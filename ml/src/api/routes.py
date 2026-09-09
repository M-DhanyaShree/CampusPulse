import time
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from src.schemas.classify import ClassifyRequest, ClassifyResponse
from src.schemas.duplicate import (
    DuplicateCheckRequest,
    DuplicateCheckResponse,
)
from src.schemas.sentiment import SentimentRequest, SentimentResponse
from src.schemas.ner import NERRequest, NERResponse
from src.schemas.summarize import SummarizeRequest, SummarizeResponse
from src.schemas.opinion import (
    FeedbackAnalysisRequest,
    FeedbackAnalysisResponse,
)
from src.services.classifier_service import classifier_service
from src.services.similarity_service import similarity_service
from src.services.sentiment_service import sentiment_service
from src.services.ner_service import ner_service
from src.services.summary_service import summary_service
from src.services.opinion_service import opinion_service
from src.core.logger import logger

router = APIRouter()

# 1. Complaint Category & Urgency Classification
@router.post(
    "/classify",
    response_model=ClassifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Zero-shot Complaint Category and Urgency Classification",
    description="Uses facebook/bart-large-mnli to classify ticket categories and detect urgency levels (critical, high, medium, low).",
)
def classify_complaint(request: ClassifyRequest) -> ClassifyResponse:
    try:
        start_time = time.time()
        result = classifier_service.classify(request)
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(f"Classify completed in {elapsed_ms}ms -> Category: '{result.category}', Urgency: '{result.urgency}'")
        return result
    except Exception as e:
        logger.error(f"Error in /classify: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification failed: {str(e)}",
        )

# 2. Duplicate Complaint Detection & Similarity Ranking
@router.post(
    "/duplicate-check",
    response_model=DuplicateCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Duplicate Complaint Detection via Semantic Similarity",
    description="Uses sentence-transformers/all-MiniLM-L6-v2 to compute dense semantic embeddings and cosine similarity against existing tickets.",
)
def check_duplicate(request: DuplicateCheckRequest) -> DuplicateCheckResponse:
    try:
        start_time = time.time()
        result = similarity_service.check_duplicates(request)
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(f"Duplicate check against {len(request.corpus)} tickets completed in {elapsed_ms}ms -> Has Duplicate: {result.has_duplicate}")
        return result
    except Exception as e:
        logger.error(f"Error in /duplicate-check: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Duplicate check failed: {str(e)}",
        )

# Alias for backend mlClient.service.ts
@router.post(
    "/similarity",
    response_model=DuplicateCheckResponse,
    include_in_schema=False,
)
def check_similarity_alias(request: DuplicateCheckRequest) -> DuplicateCheckResponse:
    return check_duplicate(request)

# 3. Sentiment Analysis
@router.post(
    "/sentiment",
    response_model=SentimentResponse,
    status_code=status.HTTP_200_OK,
    summary="Sentiment Analysis & Aspect Extraction",
    description="Uses cardiffnlp/twitter-roberta-base-sentiment-latest to evaluate polarity score (-1.0 to +1.0) and sentiment label.",
)
def analyze_sentiment(request: SentimentRequest) -> SentimentResponse:
    try:
        start_time = time.time()
        result = sentiment_service.analyze(request)
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(f"Sentiment analysis completed in {elapsed_ms}ms -> Sentiment: {result.sentiment} ({result.polarity})")
        return result
    except Exception as e:
        logger.error(f"Error in /sentiment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sentiment analysis failed: {str(e)}",
        )

# 4. Named Entity Recognition
@router.post(
    "/extract-entities",
    response_model=NERResponse,
    status_code=status.HTTP_200_OK,
    summary="Campus Named Entity Recognition (NER)",
    description="Uses dslim/bert-base-NER combined with campus location patterns to extract rooms, hostel blocks, personnel, and organizations.",
)
def extract_entities(request: NERRequest) -> NERResponse:
    try:
        start_time = time.time()
        result = ner_service.extract_entities(request)
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(f"NER extraction completed in {elapsed_ms}ms -> Entities found: {len(result.entities)}")
        return result
    except Exception as e:
        logger.error(f"Error in /extract-entities: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"NER extraction failed: {str(e)}",
        )

# 5. Executive Summary Generation
@router.post(
    "/summarize",
    response_model=SummarizeResponse,
    status_code=status.HTTP_200_OK,
    summary="Executive Text Summarization",
    description="Uses facebook/bart-large-cnn to generate concise executive summaries of long complaints or aggregated departmental digests.",
)
def summarize_text(request: SummarizeRequest) -> SummarizeResponse:
    try:
        start_time = time.time()
        result = summary_service.summarize(request)
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(f"Summarization completed in {elapsed_ms}ms -> Compression ratio: {result.compression_ratio}")
        return result
    except Exception as e:
        logger.error(f"Error in /summarize: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Summarization failed: {str(e)}",
        )

# 6. Opinion Mining & Feedback Analysis
@router.post(
    "/feedback-analysis",
    response_model=FeedbackAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Opinion Mining and Campus Feedback Analysis",
    description="Aggregates student feedback comments, performs aspect-based sentiment mining, polarity distributions, and creates consensus digests.",
)
def analyze_feedbacks(request: FeedbackAnalysisRequest) -> FeedbackAnalysisResponse:
    try:
        start_time = time.time()
        result = opinion_service.analyze_feedback(request)
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(f"Opinion mining on {result.total_feedbacks} comments completed in {elapsed_ms}ms -> Sentiment: {result.overall_sentiment}")
        return result
    except Exception as e:
        logger.error(f"Error in /feedback-analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Feedback analysis failed: {str(e)}",
        )
