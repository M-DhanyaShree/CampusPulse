from pydantic import BaseModel, Field
from typing import List, Optional

class CandidateTicket(BaseModel):
    id: str = Field(..., description="Unique ticket or complaint identifier")
    text: str = Field(..., description="Ticket title, description, or combined text")
    tracking_code: Optional[str] = Field(None, description="Human readable tracking code (e.g., CP-2026-001)")

class DuplicateCheckRequest(BaseModel):
    query: str = Field(..., description="The new complaint text to compare against the existing tickets")
    corpus: List[CandidateTicket] = Field(..., description="List of existing complaints to check against")
    similarity_threshold: float = Field(
        0.55, ge=0.0, le=1.0, description="Cosine similarity threshold to mark as potential duplicate"
    )
    top_k: int = Field(5, ge=1, le=50, description="Maximum number of top similar tickets to return")

class SimilarityMatch(BaseModel):
    id: str
    tracking_code: Optional[str] = None
    similarity_score: float = Field(..., description="Cosine similarity between 0.0 and 1.0")
    is_duplicate: bool = Field(..., description="True if similarity exceeds similarity_threshold")

class DuplicateCheckResponse(BaseModel):
    query: str
    matches: List[SimilarityMatch]
    top_match: Optional[SimilarityMatch] = None
    has_duplicate: bool
    evaluated_corpus_size: int
