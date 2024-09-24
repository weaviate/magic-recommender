from pydantic import BaseModel
from typing import List, Literal


class AddInteractionPayload(BaseModel):
    userId: str
    cardId: str
    interaction: Literal["added", "discarded"]


class GetCardsPayload(BaseModel):
    pageSize: int
    page: int
    userId: str


class CardRecommendationPayload(BaseModel):
    numberOfCards: int
    cardIds: List[str]
    userId: str


class UserRecommendationPayload(BaseModel):
    numberOfCards: int
    userId: str
