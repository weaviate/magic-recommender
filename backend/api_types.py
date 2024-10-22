from pydantic import BaseModel
from typing import List, Literal


class AddInteractionPayload(BaseModel):
    userId: str
    cardId: str
    interaction: Literal["added", "discarded"]
    weight: float


class GetInteractionsPayload(BaseModel):
    userId: str


class SaveDeckPayload(BaseModel):
    userId: str
    deck_string: str


class SearchCardsPayload(BaseModel):
    query: str
    userId: str
    numberOfCards: int
    numberOfInteractions: int
    numberOfDeck: int
    searchType: Literal["recommended", "hybrid"]
    selectedMana: List[str]


class GetCardsPayload(BaseModel):
    pageSize: int
    page: int
    userId: str
    selectedMana: List[str]


class CardRecommendationPayload(BaseModel):
    numberOfCards: int
    cardIds: List[str]
    userId: str
    selectedMana: List[str]


class UserRecommendationPayload(BaseModel):
    numberOfCards: int
    userId: str
    selectedMana: List[str]
