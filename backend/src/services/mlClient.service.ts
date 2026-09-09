import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ComplaintUrgency, SentimentLabel } from '../constants/complaint.js';

export interface MLClassificationResult {
  category: string;
  confidence: number;
  urgency: ComplaintUrgency;
  urgencyScore: number;
}

export interface MLSentimentResult {
  label: SentimentLabel;
  score: number;
  aspects: string[];
}

export interface MLSimilarityMatch {
  id: string;
  similarityScore: number;
}

export class MLClientService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ENV.ML_SERVICE_URL;
  }

  async classifyComplaint(text: string): Promise<MLClassificationResult> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), ENV.ML_SERVICE_TIMEOUT_MS);

      const res = await fetch(`${this.baseUrl}/api/ml/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = (await res.json()) as any;
        return {
          category: data.category || 'General Administration',
          confidence: data.confidence || 0.85,
          urgency: (data.urgency?.toLowerCase() as ComplaintUrgency) || ComplaintUrgency.MEDIUM,
          urgencyScore: data.urgency_score || 0.5,
        };
      }
    } catch (err) {
      logger.debug('ML Service unreachable, falling back to rule-based heuristic inference:', err);
    }

    // Heuristic Rule-based classification fallback
    return this.fallbackClassify(text);
  }

  async analyzeSentiment(text: string): Promise<MLSentimentResult> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), ENV.ML_SERVICE_TIMEOUT_MS);

      const res = await fetch(`${this.baseUrl}/api/ml/sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = (await res.json()) as any;
        return {
          label: (data.sentiment?.toLowerCase() as SentimentLabel) || SentimentLabel.NEUTRAL,
          score: data.polarity || 0,
          aspects: data.key_aspects || [],
        };
      }
    } catch (err) {
      logger.debug('ML Service sentiment unreachable, using heuristic fallback');
    }

    return this.fallbackSentiment(text);
  }

  async checkSimilarity(
    queryText: string,
    existingComplaints: Array<{ id: string; text: string }>
  ): Promise<MLSimilarityMatch[]> {
    if (existingComplaints.length === 0) return [];

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), ENV.ML_SERVICE_TIMEOUT_MS);

      const res = await fetch(`${this.baseUrl}/api/ml/similarity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, corpus: existingComplaints }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = (await res.json()) as any;
        return data.matches || [];
      }
    } catch (err) {
      logger.debug('ML Service similarity unreachable, using token overlap heuristic');
    }

    return this.fallbackSimilarity(queryText, existingComplaints);
  }

  // --- Rule-based Fallback Algorithms ---

  private fallbackClassify(text: string): MLClassificationResult {
    const lower = text.toLowerCase();

    const patterns: Array<{ regex: RegExp; category: string; urgency: ComplaintUrgency; urgencyScore: number }> = [
      {
        regex: /(fire|shock|electrocution|short circuit|gas leak|flooding|hazard|medical emergency)/i,
        category: 'Campus Security & Safety',
        urgency: ComplaintUrgency.CRITICAL,
        urgencyScore: 0.98,
      },
      {
        regex: /(wifi|internet|router|lan|server|portal|portal login|network|ethernet)/i,
        category: 'IT Infrastructure & Wi-Fi',
        urgency: ComplaintUrgency.HIGH,
        urgencyScore: 0.75,
      },
      {
        regex: /(hostel|room|washroom|bathroom|water supply|leakage|bed|geyser|warden)/i,
        category: 'Hostel & Residential Life',
        urgency: ComplaintUrgency.HIGH,
        urgencyScore: 0.78,
      },
      {
        regex: /(mess|food|cafeteria|canteen|unhygienic|meal|roaches|dining)/i,
        category: 'Cafeteria & Food Services',
        urgency: ComplaintUrgency.HIGH,
        urgencyScore: 0.72,
      },
      {
        regex: /(projector|ac|air condition|lab|classroom|bench|blackboard|board)/i,
        category: 'Classroom & Academic Labs',
        urgency: ComplaintUrgency.MEDIUM,
        urgencyScore: 0.55,
      },
      {
        regex: /(bus|shuttle|parking|vehicle|cab|transport)/i,
        category: 'Transport & Parking',
        urgency: ComplaintUrgency.MEDIUM,
        urgencyScore: 0.5,
      },
      {
        regex: /(trash|garbage|dustbin|drain|smell|stench|cleaning|sanitation)/i,
        category: 'Sanitation & Environment',
        urgency: ComplaintUrgency.MEDIUM,
        urgencyScore: 0.52,
      },
      {
        regex: /(book|library|fine|journal|reading room)/i,
        category: 'Library Services',
        urgency: ComplaintUrgency.LOW,
        urgencyScore: 0.35,
      },
    ];

    for (const p of patterns) {
      if (p.regex.test(lower)) {
        return {
          category: p.category,
          confidence: 0.88,
          urgency: p.urgency,
          urgencyScore: p.urgencyScore,
        };
      }
    }

    return {
      category: 'Administration & Fees',
      confidence: 0.75,
      urgency: ComplaintUrgency.MEDIUM,
      urgencyScore: 0.45,
    };
  }

  private fallbackSentiment(text: string): MLSentimentResult {
    const lower = text.toLowerCase();
    const negativeWords = ['horrible', 'worst', 'broken', 'terrible', 'disgusting', 'failed', 'unacceptable', 'hazard', 'severe', 'dirty', 'poor', 'danger'];
    const positiveWords = ['good', 'helpful', 'fixed', 'satisfactory', 'pleased', 'fast', 'improved'];

    let negScore = 0;
    let posScore = 0;

    negativeWords.forEach(w => { if (lower.includes(w)) negScore++; });
    positiveWords.forEach(w => { if (lower.includes(w)) posScore++; });

    const diff = posScore - negScore;
    let label = SentimentLabel.NEUTRAL;
    let score = 0;

    if (diff < 0) {
      label = SentimentLabel.NEGATIVE;
      score = Math.max(-1, diff * 0.25 - 0.2);
    } else if (diff > 0) {
      label = SentimentLabel.POSITIVE;
      score = Math.min(1, diff * 0.25 + 0.2);
    }

    // Extract rudimentary noun/topic phrases
    const words = lower.split(/\s+/).filter(w => w.length > 4);
    const aspects = Array.from(new Set(words)).slice(0, 3);

    return { label, score, aspects };
  }

  private fallbackSimilarity(
    queryText: string,
    existingComplaints: Array<{ id: string; text: string }>
  ): MLSimilarityMatch[] {
    const queryTokens = new Set(
      queryText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 3)
    );

    if (queryTokens.size === 0) return [];

    const matches: MLSimilarityMatch[] = [];

    for (const item of existingComplaints) {
      const docTokens = new Set(
        item.text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 3)
      );

      let intersection = 0;
      queryTokens.forEach(t => {
        if (docTokens.has(t)) intersection++;
      });

      const jaccard = intersection / (queryTokens.size + docTokens.size - intersection || 1);
      if (jaccard > 0.45) {
        matches.push({
          id: item.id,
          similarityScore: parseFloat(jaccard.toFixed(2)),
        });
      }
    }

    return matches.sort((a, b) => b.similarityScore - a.similarityScore);
  }
}

export const mlClientService = new MLClientService();
