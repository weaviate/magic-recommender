from fastapi import FastAPI, WebSocket, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from contextlib import asynccontextmanager
import random


from .api_types import (
    GetCardsPayload,
    CardRecommendationPayload,
    UserRecommendationPayload,
)

import weaviate
from weaviate.client import WeaviateAsyncClient
from weaviate.auth import AuthApiKey
from weaviate.classes.init import AdditionalConfig, Timeout
from weaviate.classes.query import Filter, Sort, MetadataQuery

import os
from pathlib import Path

from weaviate_recommend import WeaviateRecommendClient

from dotenv import load_dotenv
from starlette.websockets import WebSocketDisconnect
from wasabi import msg  # type: ignore[import]

load_dotenv()

# Get the service URL from the environment variable
service_url = os.getenv("SERVICE_URL")
api_key = os.getenv("API_KEY")

# Create a client instance
recommender_client = WeaviateRecommendClient(service_url, api_key)
client = weaviate.use_async_with_weaviate_cloud(
    cluster_url=os.getenv("WCD_URL"),
    auth_credentials=AuthApiKey(os.getenv("WCD_API_KEY")),
    additional_config=AdditionalConfig(timeout=Timeout(init=60, query=300, insert=300)),
)


async def initialize_weaviate_client():
    await client.connect()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await initialize_weaviate_client()
    yield
    await client.close()


# FastAPI App
app = FastAPI(lifespan=lifespan)

# Allow requests only from the same origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # This will be restricted by the custom middleware
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return JSONResponse(status_code=200, content={"connected": True})


@app.post("/cards")
async def get_cards(payload: GetCardsPayload):
    try:
        msg.info(f"Getting cards from user: {payload.userId}")

        offset = payload.pageSize * (payload.page - 1)
        card_collection = client.collections.get(os.getenv("COLLECTION_NAME"))
        aggregation_response = await card_collection.aggregate.over_all(
            total_count=True
        )

        if aggregation_response.total_count == 0:
            msg.warn("No cards found")
            return JSONResponse(status_code=200, content={"cards": [], "total": 0})

        response = await card_collection.query.fetch_objects(
            limit=payload.pageSize,
            offset=offset,
            sort=Sort.by_property("name", ascending=True),
        )

        cards = [
            {
                **card.properties,
                "card_id": str(card.properties["card_id"]),
                "oracle_id": str(card.properties["oracle_id"]),
            }
            for card in response.objects
        ]

        return JSONResponse(
            status_code=200,
            content={
                "cards": cards,
                "total": aggregation_response.total_count,
            },
        )
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return JSONResponse(status_code=400, content={"cards": [], "total": 0})


@app.post("/card_recommendation")
async def card_recommendation(payload: CardRecommendationPayload):
    try:
        msg.info(
            f"Getting card recommendations for cards: {payload.cardIds} from user: {payload.userId}"
        )

        try:
            if len(payload.cardIds) == 1:
                recommendations = recommender_client.recommendation.item.from_item(
                    item_id=payload.cardIds[0],
                    limit=payload.numberOfCards,
                    remove_reference=True,
                )
            else:
                recommendations = recommender_client.recommendation.item.from_items(
                    item_ids=payload.cardIds,
                    limit=payload.numberOfCards,
                    remove_reference=True,
                )
        except Exception as e:
            print(f"Recommendation error: {str(e)}")
            random_card = await get_random_card()
            return JSONResponse(
                status_code=200,
                content={"cards": random_card, "total": len(random_card)},
            )

        cards = [
            {
                **recommendation.properties,
                "card_id": str(recommendation.properties["card_id"]),
                "oracle_id": str(recommendation.properties["oracle_id"]),
            }
            for recommendation in recommendations.recommendations
        ]

        return JSONResponse(
            status_code=200,
            content={
                "cards": cards,
                "total": len(cards),
            },
        )
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return JSONResponse(status_code=400, content={"cards": [], "total": 0})


@app.post("/user_recommendation")
async def user_recommendation(payload: UserRecommendationPayload):
    try:
        msg.info(f"Getting user recommendations for user: {payload.userId}")

        try:
            recommendations = recommender_client.recommendation.item.from_user(
                user_id=payload.userId,
                limit=payload.numberOfCards,
                remove_reference=True,
                top_n_interactions=100,
            )
        except Exception as e:
            print(f"Recommendation error: {str(e)}")
            random_card = await get_random_card()
            return JSONResponse(
                status_code=200,
                content={"cards": random_card, "total": len(random_card)},
            )

        cards = [
            {
                **recommendation.properties,
                "card_id": str(recommendation.properties["card_id"]),
                "oracle_id": str(recommendation.properties["oracle_id"]),
            }
            for recommendation in recommendations.recommendations
        ]

        return JSONResponse(
            status_code=200,
            content={
                "cards": cards,
                "total": len(cards),
            },
        )
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return JSONResponse(status_code=400, content={"cards": [], "total": 0})


async def get_random_card():
    card_collection = client.collections.get(os.getenv("COLLECTION_NAME"))

    offset = random.randint(1, 25000)
    card_collection = client.collections.get(os.getenv("COLLECTION_NAME"))
    aggregation_response = await card_collection.aggregate.over_all(total_count=True)

    if aggregation_response.total_count == 0:
        msg.warn("No cards found")
        return []

    response = await card_collection.query.fetch_objects(
        limit=1,
        offset=offset,
    )

    cards = [
        {
            **card.properties,
            "card_id": str(card.properties["card_id"]),
            "oracle_id": str(card.properties["oracle_id"]),
        }
        for card in response.objects
    ]

    return cards