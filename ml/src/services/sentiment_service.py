import re
from typing import List, Dict
from src.core.model_loader import model_manager
from src.core.cache import cache_manager
from src.core.logger import logger
from src.schemas.sentiment import SentimentRequest, SentimentResponse, SentimentScores

STOPWORDS = {
    "the", "a", "an", "is", "are", "was", "were", "this", "that", "there", "in", "on", "at",
    "by", "for", "with", "about", "against", "between", "into", "through", "during", "before",
    "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over",
    "under", "again", "further", "then", "once", "here", "all", "any", "both", "each", "few",
    "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "than", "too", "very", "can", "will", "just", "should", "now", "it", "its", "my", "our",
    "please", "kindly", "urgently", "campus", "college", "student", "department"
}

class SentimentService:
    def analyze(self, request: SentimentRequest) -> SentimentResponse:
        clean_text = request.text.strip()

        # Cache check
        cache_key = cache_manager.generate_key("sentiment", clean_text)
        cached_result = cache_manager.get_sentiment(cache_key)
        if cached_result:
            return SentimentResponse(**cached_result)

        try:
            pipeline = model_manager.get_sentiment_pipeline()
            # cardiffnlp/twitter-roberta-base-sentiment-latest returns a list of label scores
            # e.g. [[{'label': 'positive', 'score': 0.8}, {'label': 'neutral', 'score': 0.15}, ...]]
            results = pipeline(clean_text[:512])  # Truncate to RoBERTa context window

            # Unpack first element if nested list
            label_scores = results[0] if isinstance(results[0], list) else results

            score_dict: Dict[str, float] = {"positive": 0.0, "neutral": 0.0, "negative": 0.0}
            for item in label_scores:
                label_name = item["label"].lower()
                # Handle possible label variants: 'positive', 'neutral', 'negative' or 'LABEL_0', etc.
                if "pos" in label_name:
                    score_dict["positive"] = float(item["score"])
                elif "neg" in label_name:
                    score_dict["negative"] = float(item["score"])
                else:
                    score_dict["neutral"] = float(item["score"])

            # Determine dominant sentiment
            top_sentiment = max(score_dict, key=score_dict.get)
            confidence = score_dict[top_sentiment]

            # Polarity calculation: +1.0 (pure positive) to -1.0 (pure negative)
            polarity = score_dict["positive"] - score_dict["negative"]

            # Aspect mining from text
            aspects = self._extract_aspects(clean_text)

            response = SentimentResponse(
                text=clean_text,
                sentiment=top_sentiment,
                polarity=round(polarity, 4),
                confidence=round(confidence, 4),
                scores=SentimentScores(
                    positive=round(score_dict["positive"], 4),
                    neutral=round(score_dict["neutral"], 4),
                    negative=round(score_dict["negative"], 4),
                ),
                key_aspects=aspects,
            )

            cache_manager.set_sentiment(cache_key, response.model_dump())
            return response

        except Exception as e:
            logger.error(f"Inference error in SentimentService: {e}. Using rule-based fallback.", exc_info=True)
            return self._fallback_sentiment(clean_text)

    def _extract_aspects(self, text: str) -> List[str]:
        """Extract dominant noun and issue terms as aspects."""
        tokens = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
        meaningful_tokens = [t for t in tokens if t not in STOPWORDS]
        # Frequency count
        counts: Dict[str, int] = {}
        for t in meaningful_tokens:
            counts[t] = counts.get(t, 0) + 1

        sorted_aspects = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        return [k for k, _ in sorted_aspects[:5]]

    def _fallback_sentiment(self, text: str) -> SentimentResponse:
        lower = text.lower()
        pos_words = {"clean", "great", "good", "helpful", "fixed", "fast", "polite", "resolved", "excellent", "working"}
        neg_words = {"broken", "dirty", "unhygienic", "bad", "terrible", "worst", "danger", "hazard", "slow", "failed", "unacceptable", "delay"}

        pos_count = sum(1 for w in pos_words if w in lower)
        neg_count = sum(1 for w in neg_words if w in lower)

        if pos_count > neg_count:
            top_sentiment = "positive"
            polarity = min(1.0, 0.3 + pos_count * 0.2)
        elif neg_count > pos_count:
            top_sentiment = "negative"
            polarity = max(-1.0, -0.3 - neg_count * 0.2)
        else:
            top_sentiment = "neutral"
            polarity = 0.0

        aspects = self._extract_aspects(text)

        return SentimentResponse(
            text=text,
            sentiment=top_sentiment,
            polarity=round(polarity, 4),
            confidence=0.75,
            scores=SentimentScores(
                positive=0.7 if top_sentiment == "positive" else 0.15,
                neutral=0.7 if top_sentiment == "neutral" else 0.15,
                negative=0.7 if top_sentiment == "negative" else 0.15,
            ),
            key_aspects=aspects,
        )

sentiment_service = SentimentService()
