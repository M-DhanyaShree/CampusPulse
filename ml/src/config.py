import os
import torch
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "CampusPulse AI - Machine Learning Microservice"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")

    # Hugging Face Pretrained Model Identifiers
    CLASSIFIER_MODEL: str = os.getenv("CLASSIFIER_MODEL", "facebook/bart-large-mnli")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    SENTIMENT_MODEL: str = os.getenv("SENTIMENT_MODEL", "cardiffnlp/twitter-roberta-base-sentiment-latest")
    NER_MODEL: str = os.getenv("NER_MODEL", "dslim/bert-base-NER")
    SUMMARIZER_MODEL: str = os.getenv("SUMMARIZER_MODEL", "facebook/bart-large-cnn")

    # Device Configuration
    DEVICE: str = "cuda" if torch.cuda.is_available() else "cpu"
    TORCH_DEVICE_INDEX: int = 0 if torch.cuda.is_available() else -1

    # In-memory Caching
    CACHE_MAX_SIZE: int = int(os.getenv("CACHE_MAX_SIZE", "1024"))
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "3600"))

    # Lazy vs Eager Model Loading
    EAGER_LOAD_MODELS: bool = os.getenv("EAGER_LOAD_MODELS", "false").lower() == "true"

    # Default Campus Department Categories for Zero-Shot Classification
    DEFAULT_CATEGORIES: List[str] = [
        "Hostel & Residential Life",
        "IT Infrastructure & Wi-Fi",
        "Cafeteria & Food Services",
        "Classroom & Academic Labs",
        "Sanitation & Environment",
        "Transport & Parking",
        "Campus Security & Safety",
        "Library Services",
        "Administration & Fees",
    ]

    # Candidate Labels for Zero-Shot Urgency Detection
    URGENCY_LABELS: List[str] = [
        "critical emergency life safety hazard danger",
        "high urgency rapid resolution required",
        "medium standard routine maintenance",
        "low minor cosmetic suggestion",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
