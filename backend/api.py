from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import random


from .api_types import (
    GetCardsPayload,
    CardRecommendationPayload,
    UserRecommendationPayload,
    SearchCardsPayload,
    AddInteractionPayload,
    GetInteractionsPayload,
    SaveDeckPayload,
)

import weaviate
from weaviate.auth import AuthApiKey
from weaviate.classes.init import AdditionalConfig, Timeout
from weaviate.classes.query import Sort
from weaviate_recommend.models.data import User

import os

from weaviate_recommend import WeaviateRecommendClient

from dotenv import load_dotenv
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
            random_card = await get_random_cards(6)
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


@app.post("/card_search")
async def card_search(payload: SearchCardsPayload):
    try:

        try:

            influence_factor = 0
            total_interactions = (
                payload.numberOfInteractions / 2
            ) + payload.numberOfDeck
            influence_factor = max(min(total_interactions / 100, 0.8), 0)

            if payload.numberOfInteractions < 5:
                influence_factor = 0

            msg.info(
                f"Searching for cards with query: {payload.query} for user: {payload.userId} with influence factor: {influence_factor} and search type: {payload.searchType}"
            )

            if payload.searchType == "recommended":
                search_results = recommender_client.search(
                    text=payload.query,
                    user_id=payload.userId,
                    limit=payload.numberOfCards,
                    influence_factor=influence_factor,
                )

        except Exception as e:
            print(f"Search error: {str(e)}")
            random_card = await get_random_cards(6)
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
            for recommendation in search_results.results
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
            random_card = await get_random_cards(6)
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


@app.post("/add_interaction")
async def add_interaction(payload: AddInteractionPayload):
    try:
        msg.info(
            f"Adding interaction for user: {payload.userId} and card: {payload.cardId} | {payload.interaction}"
        )

        await user_check(payload.userId)

        response = recommender_client.user.add_interaction(
            user_id=payload.userId,
            item_id=payload.cardId,
            interaction_property_name=payload.interaction,
            weight=payload.weight,
        )

        print(f"Interaction added: {response}")

        return JSONResponse(
            status_code=200,
            content=None,
        )
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return JSONResponse(status_code=400, content=None)


@app.post("/get_interactions")
async def get_interactions(payload: GetInteractionsPayload):
    try:
        msg.info(f"Getting interactions for user: {payload.userId}")

        await user_check(payload.userId)

        try:
            response = recommender_client.user.get_user_interactions(payload.userId)
        except Exception as e:
            print(f"An error when getting interactions: {str(e)}")
            return JSONResponse(
                status_code=200,
                content=[],
            )

        interactions = []
        for interaction in response:
            image_uri, card_name = await get_image_uri(interaction.item_id)
            interactions.append(
                {
                    "item_id": interaction.item_id,
                    "name": card_name,
                    "interaction_property_name": interaction.interaction_property_name,
                    "weight": interaction.weight,
                    "image_uri": image_uri,
                }
            )

        return JSONResponse(
            status_code=200,
            content=interactions,
        )
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return JSONResponse(status_code=400, content=None)


@app.post("/delete_all_interactions")
async def delete_all_interactions(payload: GetInteractionsPayload):
    try:
        msg.info(f"Deleting all interactions for user: {payload.userId}")

        await user_check(payload.userId)

        try:
            response = recommender_client.user.delete_all_interactions(payload.userId)
            print(f"Interactions deleted: {response}")
        except Exception as e:
            print(f"An error when getting interactions: {str(e)}")
            return JSONResponse(
                status_code=500,
                content=None,
            )
        return JSONResponse(
            status_code=200,
            content=None,
        )

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return JSONResponse(status_code=400, content=None)


@app.post("/save_deck")
async def save_deck(payload: SaveDeckPayload):
    try:
        msg.info(f"Saving deck for user: {payload.userId}")

        await user_check(payload.userId)

        updated_user = User(
            id=payload.userId, properties={"decks": payload.deck_string}
        )
        response = recommender_client.user.update_user(updated_user)
        print(f"Deck saved: {response}")

        return JSONResponse(
            status_code=200,
            content=None,
        )
    except Exception as e:
        print(f"An error when saving deck for user: {payload.userId}: {str(e)}")
        return JSONResponse(status_code=500, content=None)


@app.post("/get_deck")
async def get_deck(payload: GetInteractionsPayload):
    try:
        msg.info(f"Getting deck for user: {payload.userId}")

        await user_check(payload.userId)

        user = recommender_client.user.get_user(payload.userId)
        print(f"Deck: {user.properties['decks']}")

        return JSONResponse(
            status_code=200,
            content=user.properties["decks"],
        )
    except Exception as e:
        print(f"An error when getting deck: {str(e)}")
        return JSONResponse(status_code=500, content=None)


async def get_random_cards(num_cards: int = 1):
    card_collection = client.collections.get(os.getenv("COLLECTION_NAME"))

    aggregation_response = await card_collection.aggregate.over_all(total_count=True)

    if aggregation_response.total_count == 0:
        msg.warn("No cards found")
        return []

    cards = []
    for _ in range(num_cards):
        offset = random.randint(0, aggregation_response.total_count - 1)
        response = await card_collection.query.fetch_objects(
            limit=1,
            offset=offset,
        )

        if response.objects:
            card = response.objects[0]
            cards.append(
                {
                    **card.properties,
                    "card_id": str(card.properties["card_id"]),
                    "oracle_id": str(card.properties["oracle_id"]),
                }
            )

    return cards


async def user_check(user_id: str):
    try:
        if not recommender_client.user.exists(user_id):
            new_user = User(id=user_id, properties={"decks": ""})
            response = recommender_client.user.create_user(new_user)
            print(f"User created: {response}")
        else:
            print(f"User {user_id} exists")
    except Exception as e:
        print(f"An error occurred when creating user: {str(e)}")


async def get_image_uri(card_id: str):
    try:
        card_collection = client.collections.get(os.getenv("COLLECTION_NAME"))
        response = await card_collection.query.fetch_object_by_id(uuid=card_id)
        image_uri = response.properties["image_uri"]
        card_name = response.properties["name"]
        return image_uri, card_name
    except Exception as e:
        print(f"An error occurred while fetching image URI: {str(e)}")
        return ""
