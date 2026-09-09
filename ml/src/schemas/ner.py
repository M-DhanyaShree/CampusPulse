from pydantic import BaseModel, Field
from typing import List

class NERRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text from which to extract named entities")

class EntityItem(BaseModel):
    text: str = Field(..., description="Extracted entity string")
    entity_group: str = Field(..., description="Entity category: 'LOC' (Location), 'PER' (Person), 'ORG' (Organization), 'MISC'")
    score: float = Field(..., description="Model confidence score for this entity")
    start: int = Field(..., description="Character start index")
    end: int = Field(..., description="Character end index")

class NERResponse(BaseModel):
    entities: List[EntityItem]
    locations: List[str] = Field(default_factory=list, description="Extracted campus locations, rooms, or hostel blocks")
    people: List[str] = Field(default_factory=list, description="Extracted person names")
    organizations: List[str] = Field(default_factory=list, description="Extracted departments, bodies, or authorities")
