import hashlib
import threading
from typing import Any, Optional, Dict
from cachetools import TTLCache, LRUCache
from src.config import settings
from src.core.logger import logger

class MLCacheManager:
    """
    Thread-safe in-memory caching for ML inferences, embeddings, and text outputs.
    Avoids redundant deep neural forward passes for recurring texts.
    """

    def __init__(self):
        self._lock = threading.Lock()
        self.classification_cache = TTLCache(
            maxsize=settings.CACHE_MAX_SIZE, ttl=settings.CACHE_TTL_SECONDS
        )
        self.embedding_cache = LRUCache(maxsize=settings.CACHE_MAX_SIZE * 2)
        self.sentiment_cache = TTLCache(
            maxsize=settings.CACHE_MAX_SIZE, ttl=settings.CACHE_TTL_SECONDS
        )
        self.ner_cache = TTLCache(
            maxsize=settings.CACHE_MAX_SIZE, ttl=settings.CACHE_TTL_SECONDS
        )
        self.summary_cache = TTLCache(
            maxsize=settings.CACHE_MAX_SIZE, ttl=settings.CACHE_TTL_SECONDS
        )

        self.stats = {
            "classification_hits": 0,
            "classification_misses": 0,
            "embedding_hits": 0,
            "embedding_misses": 0,
            "sentiment_hits": 0,
            "sentiment_misses": 0,
            "ner_hits": 0,
            "ner_misses": 0,
            "summary_hits": 0,
            "summary_misses": 0,
        }

    @staticmethod
    def generate_key(*args: Any) -> str:
        raw = ":".join(str(arg) for arg in args)
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    # Classification
    def get_classification(self, key: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            val = self.classification_cache.get(key)
            if val is not None:
                self.stats["classification_hits"] += 1
            else:
                self.stats["classification_misses"] += 1
            return val

    def set_classification(self, key: str, value: Dict[str, Any]) -> None:
        with self._lock:
            self.classification_cache[key] = value

    # Embeddings
    def get_embedding(self, key: str) -> Optional[Any]:
        with self._lock:
            val = self.embedding_cache.get(key)
            if val is not None:
                self.stats["embedding_hits"] += 1
            else:
                self.stats["embedding_misses"] += 1
            return val

    def set_embedding(self, key: str, value: Any) -> None:
        with self._lock:
            self.embedding_cache[key] = value

    # Sentiment
    def get_sentiment(self, key: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            val = self.sentiment_cache.get(key)
            if val is not None:
                self.stats["sentiment_hits"] += 1
            else:
                self.stats["sentiment_misses"] += 1
            return val

    def set_sentiment(self, key: str, value: Dict[str, Any]) -> None:
        with self._lock:
            self.sentiment_cache[key] = value

    # NER
    def get_ner(self, key: str) -> Optional[Any]:
        with self._lock:
            val = self.ner_cache.get(key)
            if val is not None:
                self.stats["ner_hits"] += 1
            else:
                self.stats["ner_misses"] += 1
            return val

    def set_ner(self, key: str, value: Any) -> None:
        with self._lock:
            self.ner_cache[key] = value

    # Summary
    def get_summary(self, key: str) -> Optional[str]:
        with self._lock:
            val = self.summary_cache.get(key)
            if val is not None:
                self.stats["summary_hits"] += 1
            else:
                self.stats["summary_misses"] += 1
            return val

    def set_summary(self, key: str, value: str) -> None:
        with self._lock:
            self.summary_cache[key] = value

    def get_stats(self) -> Dict[str, Any]:
        with self._lock:
            return {
                **self.stats,
                "current_cache_sizes": {
                    "classification": len(self.classification_cache),
                    "embedding": len(self.embedding_cache),
                    "sentiment": len(self.sentiment_cache),
                    "ner": len(self.ner_cache),
                    "summary": len(self.summary_cache),
                },
            }

    def clear(self) -> None:
        with self._lock:
            self.classification_cache.clear()
            self.embedding_cache.clear()
            self.sentiment_cache.clear()
            self.ner_cache.clear()
            self.summary_cache.clear()
            logger.info("ML in-memory cache cleared successfully.")

cache_manager = MLCacheManager()
