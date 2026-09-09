from src.core.model_loader import model_manager
from src.core.cache import cache_manager
from src.core.logger import logger
from src.schemas.summarize import SummarizeRequest, SummarizeResponse

class SummaryService:
    def summarize(self, request: SummarizeRequest) -> SummarizeResponse:
        clean_text = request.text.strip()
        max_len = request.max_length or 130
        min_len = request.min_length or 30

        # Cache check
        cache_key = cache_manager.generate_key("summary", clean_text, max_len, min_len)
        cached_summary = cache_manager.get_summary(cache_key)
        if cached_summary:
            return SummarizeResponse(
                summary=cached_summary,
                original_characters=len(clean_text),
                summary_characters=len(cached_summary),
                compression_ratio=round(len(cached_summary) / max(len(clean_text), 1), 3),
            )

        # If text is already very short, return as-is
        if len(clean_text.split()) < 25:
            return SummarizeResponse(
                summary=clean_text,
                original_characters=len(clean_text),
                summary_characters=len(clean_text),
                compression_ratio=1.0,
            )

        try:
            summarizer = model_manager.get_summarizer_pipeline()
            # Truncate text to 1024 tokens approximately
            truncated_text = clean_text[:4000]

            result = summarizer(
                truncated_text,
                max_length=max_len,
                min_length=min_len,
                do_sample=False,
            )

            summary_text = result[0]["summary_text"].strip()

            cache_manager.set_summary(cache_key, summary_text)

            return SummarizeResponse(
                summary=summary_text,
                original_characters=len(clean_text),
                summary_characters=len(summary_text),
                compression_ratio=round(len(summary_text) / max(len(clean_text), 1), 3),
            )

        except Exception as e:
            logger.error(f"Inference error in SummaryService: {e}. Generating extractive summary.", exc_info=True)
            return self._extractive_fallback(clean_text)

    def _extractive_fallback(self, text: str) -> SummarizeResponse:
        """Simple extractive fallback by taking the most informative sentences."""
        sentences = [s.strip() for s in text.replace("\n", " ").split(".") if len(s.strip()) > 15]
        if not sentences:
            summary = text[:200]
        else:
            summary = ". ".join(sentences[:2]) + "."

        return SummarizeResponse(
            summary=summary,
            original_characters=len(text),
            summary_characters=len(summary),
            compression_ratio=round(len(summary) / max(len(text), 1), 3),
        )

summary_service = SummaryService()
