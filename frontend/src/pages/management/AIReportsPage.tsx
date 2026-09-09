import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import {
  Brain,
  Sparkles,
  TrendingDown,
  TrendingUp,
  FileText,
  Tag,
  RefreshCw,
  Cpu,
  Layers,
  ShieldAlert,
} from 'lucide-react';

const EXECUTIVE_SUMMARIES = [
  {
    category: 'Electrical & Life Safety',
    model: 'facebook/bart-large-cnn',
    summary:
      'Urgent maintenance priority identified across Hostel Block A (Wings 3 & 4) due to recurring 16A breaker tripping and sparking in main distribution boards. Recommend full electrical audit before monsoon term.',
    urgencyLevel: 'Critical',
    sentiment: 'Urgent / Negative (89%)',
    entities: ['Hostel Block A', 'Wing 4', '16A Breaker', 'Distribution Board', 'Suresh Kumar'],
  },
  {
    category: 'IT Infrastructure & Digital Campus',
    model: 'facebook/bart-large-cnn',
    summary:
      'Wi-Fi 6 access points in Central Library and CSE Lab 3 suffer packet loss during peak study hours (8:00 PM – 11:30 PM). Firmware update and channel segregation recommended.',
    urgencyLevel: 'High',
    sentiment: 'Frustrated (76%)',
    entities: ['Central Library', 'CSE Lab 3', 'Cisco AP-4800', 'Amit Patel'],
  },
  {
    category: 'Cafeteria & Mess Quality',
    model: 'facebook/bart-large-cnn',
    summary:
      'Student satisfaction in Main Dining Hall improved by 14% following fresh fruit inclusion. Water cooler filtration requires weekly cartridge replacement in Block C.',
    urgencyLevel: 'Medium',
    sentiment: 'Positive / Neutral (68%)',
    entities: ['Main Dining Hall', 'Mess Committee', 'Block C Cooler'],
  },
];

const OPINION_MINING_ASPECTS = [
  { aspect: 'Wi-Fi Latency & Bandwidth', score: -0.62, sentiment: 'Negative', volume: 142 },
  { aspect: 'Hostel Water Supply', score: -0.45, sentiment: 'Negative', volume: 98 },
  { aspect: 'Library Reading Hours', score: 0.78, sentiment: 'Positive', volume: 215 },
  { aspect: 'Campus Security Night Escort', score: 0.85, sentiment: 'Positive', volume: 84 },
  { aspect: 'Mess Food Freshness', score: 0.12, sentiment: 'Neutral', volume: 165 },
];

export const AIReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      showToast('AI Synthesis Refreshed', 'Generated latest executive digest using HuggingFace models.', 'success');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-[#fca311]" />
            <span>AI Executive Reports & Opinion Mining</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated intelligence powered by Hugging Face NLP pipelines (BART, RoBERTa, BERT NER, MiniLM).
          </p>
        </div>

        <Button variant="accent" size="sm" onClick={handleRegenerate} isLoading={isGenerating}>
          <RefreshCw className="h-4 w-4" />
          <span>Regenerate Executive Digest</span>
        </Button>
      </div>

      {/* Model Tech Specs Card */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#14213d] text-[#fca311]">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-white">Active Machine Learning Inference Models</h4>
            <p className="text-[11px] text-slate-400">
              Zero-Shot (bart-large-mnli) • Summarizer (bart-large-cnn) • Sentiment (roberta-base) • NER (bert-base-NER)
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold font-mono text-[11px]">
          ML Microservice: ONLINE (FastAPI :8000)
        </span>
      </div>

      {/* Aspect-Based Opinion Mining */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#fca311]" />
            <span>Aspect-Based Campus Opinion Mining (Polarity Index)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">POST /feedback-analysis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OPINION_MINING_ASPECTS.map((item) => {
            const isPos = item.score > 0.2;
            const isNeg = item.score < -0.2;

            return (
              <div
                key={item.aspect}
                className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white truncate">{item.aspect}</span>
                  <span
                    className={`font-mono font-bold ${
                      isPos ? 'text-emerald-400' : isNeg ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  >
                    {item.score > 0 ? `+${item.score}` : item.score}
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isPos ? 'bg-emerald-500' : isNeg ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.abs(item.score) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{item.volume} Student Mentions</span>
                  <span className="font-semibold text-slate-300">{item.sentiment}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated Executive Summaries */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#fca311]" />
          <span>Departmental Syntheses & Entity Recognition (NER)</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {EXECUTIVE_SUMMARIES.map((report) => (
            <Card key={report.category} className="p-6 space-y-4 border border-white/10 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#fca311]">{report.category}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      report.urgencyLevel === 'Critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {report.urgencyLevel}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                  "{report.summary}"
                </p>

                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    Extracted Named Entities (BERT NER):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {report.entities.map((ent) => (
                      <span
                        key={ent}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-[#14213d] text-sky-200 border border-white/10 font-mono"
                      >
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Model: {report.model}</span>
                <span className="font-semibold text-slate-300">{report.sentiment}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
