from typing import Dict, List
from collections import defaultdict
from src.schemas.opinion import (
    FeedbackAnalysisRequest,
    FeedbackAnalysisResponse,
    AspectSentiment,
)
from src.schemas.sentiment import SentimentRequest
from src.schemas.summarize import SummarizeRequest
from src.services.sentiment_service import sentiment_service
from src.services.summary_service import summary_service
from src.core.logger import logger

class OpinionMiningService:
    def analyze_feedback(self, request: FeedbackAnalysisRequest) -> FeedbackAnalysisResponse:
        total = len(request.feedbacks)
        if total == 0:
            return FeedbackAnalysisResponse(
                total_feedbacks=0,
                positive_count=0,
                neutral_count=0,
                negative_count=0,
                positive_percentage=0.0,
                neutral_percentage=0.0,
                negative_percentage=0.0,
                overall_sentiment="neutral",
                top_aspects=[],
                executive_opinion_summary="No feedback items provided for analysis.",
            )

        pos_count = 0
        neu_count = 0
        neg_count = 0

        aspect_mentions: Dict[str, int] = defaultdict(int)
        aspect_polarities: Dict[str, List[float]] = defaultdict(list)
        all_feedback_texts: List[str] = []

        # Analyze each feedback comment
        for fb in request.feedbacks:
            text = fb.text.strip()
            if not text:
                continue

            all_feedback_texts.append(text)
            sent_res = sentiment_service.analyze(SentimentRequest(text=text))

            if sent_res.sentiment == "positive":
                pos_count += 1
            elif sent_res.sentiment == "negative":
                neg_count += 1
            else:
                neu_count += 1

            # Aggregate aspects and associated polarities
            for aspect in sent_res.key_aspects:
                aspect_mentions[aspect] += 1
                aspect_polarities[aspect].append(sent_res.polarity)

        evaluated_total = max(pos_count + neu_count + neg_count, 1)
        pos_pct = round((pos_count / evaluated_total) * 100, 1)
        neu_pct = round((neu_count / evaluated_total) * 100, 1)
        neg_pct = round((neg_count / evaluated_total) * 100, 1)

        if pos_count > neg_count and pos_count >= neu_count:
            overall = "positive"
        elif neg_count > pos_count and neg_count >= neu_count:
            overall = "negative"
        else:
            overall = "neutral"

        # Build top aspect sentiments
        top_aspects_list: List[AspectSentiment] = []
        sorted_aspects = sorted(aspect_mentions.items(), key=lambda x: x[1], reverse=True)[:8]

        for aspect_name, mentions in sorted_aspects:
            polarities = aspect_polarities[aspect_name]
            avg_pol = sum(polarities) / len(polarities) if polarities else 0.0
            aspect_sentiment = "positive" if avg_pol > 0.15 else ("negative" if avg_pol < -0.15 else "neutral")

            top_aspects_list.append(
                AspectSentiment(
                    aspect=aspect_name,
                    mentions=mentions,
                    sentiment=aspect_sentiment,
                    average_polarity=round(avg_pol, 3),
                )
            )

        # Generate Executive Opinion Summary
        combined_text = " ".join(all_feedback_texts[:15])
        if len(combined_text.split()) > 25:
            topic_prefix = f"Regarding {request.topic}: " if request.topic else ""
            summary_res = summary_service.summarize(
                SummarizeRequest(
                    text=f"{topic_prefix}{combined_text}",
                    max_length=100,
                    min_length=25,
                )
            )
            exec_summary = summary_res.summary
        else:
            exec_summary = (
                f"Campus consensus is predominantly {overall} ({pos_pct}% positive, {neg_pct}% negative) "
                f"based on {total} evaluated community comments."
            )

        return FeedbackAnalysisResponse(
            total_feedbacks=total,
            positive_count=pos_count,
            neutral_count=neu_count,
            negative_count=neg_count,
            positive_percentage=pos_pct,
            neutral_percentage=neu_pct,
            negative_percentage=neg_pct,
            overall_sentiment=overall,
            top_aspects=top_aspects_list,
            executive_opinion_summary=exec_summary,
        )

opinion_service = OpinionMiningService()
