from pydantic import BaseModel, Field
from typing import List, Dict

class SentimentRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text string to evaluate sentiment and opinions for")

class SentimentScores(BaseModel):
    positive: float
    neutral: float
    negative: float

class SentimentResponse(BaseModel):
    text: str
    sentiment: str = Field(..., description="Top sentiment label: 'positive', 'neutral', or 'negative'")
    polarity: float = Field(..., description="Continuous polarity score between -1.0 (very negative) and +1.0 (very positive)")
    confidence: float = Field(..., description="Classification confidence (0.0 to 1.0)")
    scores: SentimentScores = Field(..., description="Normalized probability distribution over sentiment labels")
    key_aspects: List[str] = Field(default_factory=list, description="Key opinion/issue aspects identified in the text")
