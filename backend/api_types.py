from pydantic import BaseModel
from typing import List


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
