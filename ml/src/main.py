from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from src.core.logger import logger
from src.core.model_loader import model_manager
from src.api.routes import router as ml_router
from src.api.health import router as health_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup lifecycle
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: Device={settings.DEVICE}, Port={settings.PORT}")

    if settings.EAGER_LOAD_MODELS:
        logger.info("EAGER_LOAD_MODELS is enabled. Loading Hugging Face weights into RAM/VRAM...")
        try:
            model_manager.preload_all_models()
        except Exception as e:
            logger.warning(f"Error during eager preloading: {e}. Models will be loaded on demand.")
    else:
        logger.info("Lazy model loading enabled. Models will load upon their first respective API call.")

    yield

    # Shutdown lifecycle
    logger.info("Shutting down CampusPulse ML Service...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Production-grade Machine Learning Microservice for CampusPulse AI. "
        "Provides Zero-shot Classification (facebook/bart-large-mnli), "
        "Semantic Duplicate Detection (sentence-transformers/all-MiniLM-L6-v2), "
        "Sentiment Analysis (cardiffnlp/twitter-roberta-base-sentiment-latest), "
        "Named Entity Recognition (dslim/bert-base-NER), "
        "Executive Summarization (facebook/bart-large-cnn), "
        "and Comprehensive Campus Opinion Mining."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Health & Maintenance routes
app.include_router(health_router, tags=["Health & Status"])

# Mount Core ML Endpoints at Root (as requested in spec: /classify, /duplicate-check, /sentiment, etc.)
app.include_router(ml_router, tags=["CampusPulse ML Operations"])

# Mount Core ML Endpoints with /api/ml prefix (for backend proxy compatibility)
app.include_router(ml_router, prefix="/api/ml", tags=["Backend Integration Proxy"])

@app.get("/", tags=["Root"])
def root_info():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc",
        },
        "endpoints": {
            "classify": "POST /classify",
            "duplicate_check": "POST /duplicate-check",
            "sentiment": "POST /sentiment",
            "extract_entities": "POST /extract-entities",
            "summarize": "POST /summarize",
            "feedback_analysis": "POST /feedback-analysis",
            "health": "GET /health",
        },
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
