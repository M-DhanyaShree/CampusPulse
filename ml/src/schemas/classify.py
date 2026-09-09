from pydantic import BaseModel, Field
from typing import List, Optional

class ClassifyRequest(BaseModel):
    text: str = Field(..., description="The main text of the complaint to classify")
    title: Optional[str] = Field(None, description="Optional title of the complaint")
    candidate_categories: Optional[List[str]] = Field(
        None, description="Custom candidate categories to classify against. Defaults to standard campus categories."
    )
    multi_label: bool = Field(
        False, description="Whether multiple categories can apply simultaneously"
    )

class CategoryScore(BaseModel):
    category: str
    score: float

class ClassifyResponse(BaseModel):
    category: str = Field(..., description="Top predicted complaint category")
    confidence: float = Field(..., description="Prediction confidence score (0.0 to 1.0)")
    urgency: str = Field(..., description="Urgency rating: 'low', 'medium', 'high', 'critical'")
    urgency_score: float = Field(..., description="Numeric urgency score (0.0 to 1.0)")
    category_scores: List[CategoryScore] = Field(..., description="All evaluated categories with scores")
    is_emergency: bool = Field(..., description="True if critical safety hazard or immediate emergency detected")
