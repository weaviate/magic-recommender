from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from weaviate.classes.query import Filter
import random
import time

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
from weaviate_recommend.models.filter import FilterConfig


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

        selected_mana = payload.selectedMana
        if len(selected_mana) > 0:
            filters = Filter.by_property("color_identity").contains_all(selected_mana)
            response = await card_collection.query.fetch_objects(
                limit=2000,
                sort=Sort.by_property("name", ascending=True),
                filters=filters,
            )
            random.shuffle(response.objects)
            response.objects = response.objects[: payload.pageSize]
        else:
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
            },
        )
    except Exception as e:
        msg.fail(f"An error occurred: {str(e)}")
        return JSONResponse(status_code=400, content={"cards": []})


@app.post("/card_recommendation")
async def card_recommendation(payload: CardRecommendationPayload):
    try:
        msg.info(f"Getting card recommendations from user: {payload.userId}")

        if len(payload.selectedMana) > 0:
            filters = [
                FilterConfig(
                    property_name="color_identity",
                    operator="ContainsAll",
                    value=payload.selectedMana,
                )
            ]
        else:
            filters = None

        try:
            if len(payload.cardIds) == 1:
                recommendations = recommender_client.recommendation.item.from_item(
                    item_id=payload.cardIds[0],
                    limit=payload.numberOfCards,
                    remove_reference=True,
                    filters=filters,
                )
            else:
                recommendations = recommender_client.recommendation.item.from_items(
                    item_ids=payload.cardIds,
                    limit=payload.numberOfCards,
                    remove_reference=True,
                    filters=filters,
                )
        except Exception as e:
            msg.fail(f"Recommendation error: {str(e)}")
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
        msg.fail(f"An error occurred: {str(e)}")
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

            if len(payload.selectedMana) > 0:
                filters = [
                    FilterConfig(
                        property_name="color_identity",
                        operator="ContainsAll",
                        value=payload.selectedMana,
                    )
                ]
            else:
                filters = None

            search_results = recommender_client.search(
                text=payload.query,
                user_id=payload.userId,
                limit=payload.numberOfCards,
                influence_factor=influence_factor,
                filters=filters,
            )

        except Exception as e:
            msg.fail(f"Search error: {str(e)}")
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
        msg.fail(f"An error occurred: {str(e)}")
        return JSONResponse(status_code=400, content={"cards": [], "total": 0})


@app.post("/user_recommendation")
async def user_recommendation(payload: UserRecommendationPayload):
    try:
        msg.info(f"Getting user recommendations for user: {payload.userId}")

        if len(payload.selectedMana) > 0:
            filters = [
                FilterConfig(
                    property_name="color_identity",
                    operator="ContainsAll",
                    value=payload.selectedMana,
                )
            ]
        else:
            filters = None

        try:
            recommendations = recommender_client.recommendation.item.from_user(
                user_id=payload.userId,
                limit=payload.numberOfCards,
                remove_reference=True,
                top_n_interactions=100,
            )
        except Exception as e:
            msg.fail(f"Recommendation error: {str(e)}")
            random_card = await get_random_cards(1)
            return JSONResponse(
                status_code=200,
                content={"cards": random_card, "total": 1},
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
        msg.fail(f"An error occurred: {str(e)}")
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

        msg.good(f"Interaction added: {response}")

        return JSONResponse(
            status_code=200,
            content=None,
        )
    except Exception as e:
        msg.fail(f"An error occurred: {str(e)}")
        return JSONResponse(status_code=400, content=None)


@app.post("/get_interactions")
async def get_interactions(payload: GetInteractionsPayload):
    try:
        msg.info(f"Getting interactions for user: {payload.userId}")

        await user_check(payload.userId)

        try:

            start_time = time.time()

            response = recommender_client.user.get_user_interactions(payload.userId)

            end_time = time.time()
            msg.info(
                f"Time taken to get interactions for user {payload.userId}: {end_time - start_time} seconds"
            )
        except Exception as e:
            msg.fail(f"An error when getting interactions: {str(e)}")
            return JSONResponse(
                status_code=200,
                content=[],
            )

        item_ids = set([interaction.item_id for interaction in response])
        card_info = await get_image_uris(item_ids)
        interactions = []
        for interaction in response:
            interactions.append(
                {
                    "item_id": interaction.item_id,
                    "name": card_info[interaction.item_id]["name"],
                    "interaction_property_name": interaction.interaction_property_name,
                    "weight": interaction.weight,
                    "image_uri": card_info[interaction.item_id]["image_uri"],
                }
            )

        return JSONResponse(
            status_code=200,
            content=interactions,
        )
    except Exception as e:
        msg.fail(f"An error occurred: {str(e)}")
        return JSONResponse(status_code=400, content=None)


@app.post("/delete_all_interactions")
async def delete_all_interactions(payload: GetInteractionsPayload):
    try:
        msg.info(f"Deleting all interactions for user: {payload.userId}")

        await user_check(payload.userId)

        try:
            response = recommender_client.user.delete_all_interactions(payload.userId)
            msg.info(f"Interactions deleted: {response}")
        except Exception as e:
            msg.fail(f"An error when getting interactions: {str(e)}")
            return JSONResponse(
                status_code=500,
                content=None,
            )
        return JSONResponse(
            status_code=200,
            content=None,
        )

    except Exception as e:
        msg.fail(f"An error occurred: {str(e)}")
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
        msg.good(f"Deck saved: {response}")

        return JSONResponse(
            status_code=200,
            content=None,
        )
    except Exception as e:
        msg.fail(f"An error when saving deck for user: {payload.userId}: {str(e)}")
        return JSONResponse(status_code=500, content=None)


@app.post("/get_deck")
async def get_deck(payload: GetInteractionsPayload):
    try:
        start_time = time.time()
        msg.info(f"Getting deck for user: {payload.userId}")

        await user_check(payload.userId)

        user = recommender_client.user.get_user(payload.userId)
        end_time = time.time()
        msg.info(
            f"Time taken to get deck for user {payload.userId}: {end_time - start_time} seconds"
        )

        return JSONResponse(
            status_code=200,
            content=user.properties["decks"],
        )
    except Exception as e:
        msg.fail(f"An error when getting deck: {str(e)}")
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
    start_time = time.time()
    try:
        if not recommender_client.user.exists(user_id):
            new_user = User(id=user_id, properties={"decks": ""})
            response = recommender_client.user.create_user(new_user)
            msg.info(f"User created: {response}")
        else:
            msg.info(f"User {user_id} exists")
    except Exception as e:
        msg.fail(f"An error occurred when creating user: {str(e)}")
    end_time = time.time()
    msg.info(f"Time taken for user check: {end_time - start_time} seconds")


async def get_image_uris(card_ids: list[str]):
    start_time = time.time()
    try:
        card_collection = client.collections.get(os.getenv("COLLECTION_NAME"))
        response = await card_collection.query.fetch_objects_by_ids(
            card_ids, limit=len(card_ids)
        )
        card_info = {}
        for object in response.objects:
            card_info[str(object.properties["card_id"])] = {
                "image_uri": object.properties["image_uri"],
                "name": object.properties["name"],
            }

        end_time = time.time()
        msg.info(f"Time taken to fetch image URIs: {end_time - start_time} seconds")
        return card_info
    except Exception as e:
        msg.fail(f"An error occurred while fetching image URI: {str(e)}")
        end_time = time.time()
        msg.info(f"Time taken to fetch image URIs: {end_time - start_time} seconds")
        return {}
