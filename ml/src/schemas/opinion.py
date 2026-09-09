from pydantic import BaseModel, Field
from typing import List, Optional

class FeedbackItem(BaseModel):
    text: str = Field(..., description="Student or staff feedback comment")
    user_role: Optional[str] = Field(None, description="Optional role of the author (e.g. student, dept_admin)")

class FeedbackAnalysisRequest(BaseModel):
    feedbacks: List[FeedbackItem] = Field(
        ..., min_length=1, description="List of qualitative opinions or comments to mine"
    )
    topic: Optional[str] = Field(None, description="Contextual topic (e.g. 'Cafeteria Timings', 'Wi-Fi Speed')")

class AspectSentiment(BaseModel):
    aspect: str = Field(..., description="Extracted key topic/aspect noun phrase")
    mentions: int = Field(..., description="Number of times mentioned across feedback comments")
    sentiment: str = Field(..., description="Average sentiment: 'positive', 'neutral', or 'negative'")
    average_polarity: float = Field(..., description="Average polarity score between -1.0 and +1.0")

class FeedbackAnalysisResponse(BaseModel):
    total_feedbacks: int
    positive_count: int
    neutral_count: int
    negative_count: int
    positive_percentage: float
    neutral_percentage: float
    negative_percentage: float
    overall_sentiment: str
    top_aspects: List[AspectSentiment]
    executive_opinion_summary: str
