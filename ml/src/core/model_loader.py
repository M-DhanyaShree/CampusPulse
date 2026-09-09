import threading
from typing import Optional, Any, Dict
import torch
from transformers import pipeline
from sentence_transformers import SentenceTransformer
from src.config import settings
from src.core.logger import logger

class ModelManager:
    """
    Thread-safe Singleton Model Manager for Pretrained Hugging Face Models.
    Ensures zero duplicate model loading in RAM/VRAM.
    """

    _instance: Optional["ModelManager"] = None
    _lock = threading.Lock()

    def __new__(cls) -> "ModelManager":
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return

        self._initialized = True
        self._models_lock = threading.Lock()

        # Model references
        self._classifier = None
        self._embedding_model = None
        self._sentiment_pipeline = None
        self._ner_pipeline = None
        self._summarizer_pipeline = None

        self.loaded_status: Dict[str, bool] = {
            "classifier": False,
            "embedding": False,
            "sentiment": False,
            "ner": False,
            "summarizer": False,
        }

        logger.info(
            f"ModelManager initialized. Target Device: {settings.DEVICE.upper()} (GPU Index: {settings.TORCH_DEVICE_INDEX})"
        )

    def get_classifier(self) -> Any:
        """
        Zero-shot classification pipeline using facebook/bart-large-mnli
        """
        if self._classifier is None:
            with self._models_lock:
                if self._classifier is None:
                    logger.info(
                        f"Loading Zero-Shot Classifier: '{settings.CLASSIFIER_MODEL}' on {settings.DEVICE}..."
                    )
                    self._classifier = pipeline(
                        "zero-shot-classification",
                        model=settings.CLASSIFIER_MODEL,
                        device=settings.TORCH_DEVICE_INDEX,
                    )
                    self.loaded_status["classifier"] = True
                    logger.info("Classifier pipeline successfully loaded.")
        return self._classifier

    def get_embedding_model(self) -> SentenceTransformer:
        """
        Semantic dense sentence embedder using sentence-transformers/all-MiniLM-L6-v2
        """
        if self._embedding_model is None:
            with self._models_lock:
                if self._embedding_model is None:
                    logger.info(
                        f"Loading Embedding Model: '{settings.EMBEDDING_MODEL}' on {settings.DEVICE}..."
                    )
                    self._embedding_model = SentenceTransformer(
                        settings.EMBEDDING_MODEL,
                        device=settings.DEVICE,
                    )
                    self.loaded_status["embedding"] = True
                    logger.info("SentenceTransformer model successfully loaded.")
        return self._embedding_model

    def get_sentiment_pipeline(self) -> Any:
        """
        Sentiment classification pipeline using cardiffnlp/twitter-roberta-base-sentiment-latest
        """
        if self._sentiment_pipeline is None:
            with self._models_lock:
                if self._sentiment_pipeline is None:
                    logger.info(
                        f"Loading Sentiment Pipeline: '{settings.SENTIMENT_MODEL}' on {settings.DEVICE}..."
                    )
                    self._sentiment_pipeline = pipeline(
                        "sentiment-analysis",
                        model=settings.SENTIMENT_MODEL,
                        device=settings.TORCH_DEVICE_INDEX,
                        top_k=None,  # Return scores for negative, neutral, positive
                    )
                    self.loaded_status["sentiment"] = True
                    logger.info("Sentiment pipeline successfully loaded.")
        return self._sentiment_pipeline

    def get_ner_pipeline(self) -> Any:
        """
        Named Entity Recognition pipeline using dslim/bert-base-NER
        """
        if self._ner_pipeline is None:
            with self._models_lock:
                if self._ner_pipeline is None:
                    logger.info(
                        f"Loading Named Entity Recognition: '{settings.NER_MODEL}' on {settings.DEVICE}..."
                    )
                    self._ner_pipeline = pipeline(
                        "ner",
                        model=settings.NER_MODEL,
                        aggregation_strategy="simple",
                        device=settings.TORCH_DEVICE_INDEX,
                    )
                    self.loaded_status["ner"] = True
                    logger.info("NER pipeline successfully loaded.")
        return self._ner_pipeline

    def get_summarizer_pipeline(self) -> Any:
        """
        Text summarization pipeline using facebook/bart-large-cnn
        """
        if self._summarizer_pipeline is None:
            with self._models_lock:
                if self._summarizer_pipeline is None:
                    logger.info(
                        f"Loading Summarizer Pipeline: '{settings.SUMMARIZER_MODEL}' on {settings.DEVICE}..."
                    )
                    self._summarizer_pipeline = pipeline(
                        "summarization",
                        model=settings.SUMMARIZER_MODEL,
                        device=settings.TORCH_DEVICE_INDEX,
                    )
                    self.loaded_status["summarizer"] = True
                    logger.info("Summarizer pipeline successfully loaded.")
        return self._summarizer_pipeline

    def preload_all_models(self) -> None:
        """
        Eagerly load all models into memory during application startup if configured.
        """
        logger.info("Starting eager preloading of all ML models...")
        self.get_embedding_model()
        self.get_sentiment_pipeline()
        self.get_ner_pipeline()
        self.get_classifier()
        self.get_summarizer_pipeline()
        logger.info("All 5 Pretrained Hugging Face models are fully cached and ready in memory.")

    def get_status(self) -> Dict[str, Any]:
        return {
            "device": settings.DEVICE,
            "torch_cuda_available": torch.cuda.is_available(),
            "models_status": self.loaded_status,
            "configured_models": {
                "classifier": settings.CLASSIFIER_MODEL,
                "embedding": settings.EMBEDDING_MODEL,
                "sentiment": settings.SENTIMENT_MODEL,
                "ner": settings.NER_MODEL,
                "summarizer": settings.SUMMARIZER_MODEL,
            },
        }

model_manager = ModelManager()
