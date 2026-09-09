from fastapi import APIRouter
from typing import Dict, Any
from src.config import settings
from src.core.model_loader import model_manager
from src.core.cache import cache_manager

router = APIRouter()

@router.get(
    "/health",
    summary="Service Health and Status",
    description="Returns microservice health, system device (CPU/GPU), model status, and cache hit metrics.",
)
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "device": settings.DEVICE,
        "models": model_manager.get_status(),
        "cache": cache_manager.get_stats(),
    }

@router.post(
    "/cache/clear",
    summary="Clear In-Memory Cache",
    description="Clears all inference and embedding caches.",
)
def clear_cache() -> Dict[str, str]:
    cache_manager.clear()
    return {"message": "Cache successfully cleared"}
