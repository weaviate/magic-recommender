from weaviate_recommend import WeaviateRecommendClient
import weaviate.classes.config as wvcc
from dotenv import load_dotenv
import os
from wasabi import msg

# Load environment variables from .env file
load_dotenv()


msg.divider("Creating schema")

# Get the service URL from the environment variable
service_url = os.getenv("SERVICE_URL")
api_key = os.getenv("API_KEY")

# Create a client instance
client = WeaviateRecommendClient(service_url, api_key)

client.delete()

client.create(
    name="magic_the_gathering_cards",
    properties={
        "card_id": wvcc.DataType.UUID,
        "oracle_id": wvcc.DataType.UUID,
        "name": wvcc.DataType.TEXT,
        "released_at": wvcc.DataType.TEXT,
        "uri": wvcc.DataType.TEXT,
        "scryfall_uri": wvcc.DataType.TEXT,
        "image_uri": wvcc.DataType.TEXT,
        "type_line": wvcc.DataType.TEXT,
        "oracle_text": wvcc.DataType.TEXT,
        "colors": wvcc.DataType.TEXT_ARRAY,
        "color_identity": wvcc.DataType.TEXT_ARRAY,
        "keywords": wvcc.DataType.TEXT_ARRAY,
        "produced_mana": wvcc.DataType.TEXT_ARRAY,
        "set_name": wvcc.DataType.TEXT,
        "rarity": wvcc.DataType.TEXT,
        "power": wvcc.DataType.TEXT,
        "toughness": wvcc.DataType.TEXT,
        "mana_cost": wvcc.DataType.TEXT,
        "loyalty": wvcc.DataType.TEXT,
        "defense": wvcc.DataType.TEXT,
        "life_modifier": wvcc.DataType.TEXT,
        "hand_modifier": wvcc.DataType.TEXT,
        "edhrec_rank": wvcc.DataType.NUMBER,
        "cmc": wvcc.DataType.NUMBER,
    },
    trainable_properties=[
        "name",
        "released_at",
        "type_line",
        "oracle_text",
        "colors",
        "keywords",
        "produced_mana",
        "set_name",
        "rarity",
        "power",
        "toughness",
        "mana_cost",
        "loyalty",
        "defense",
        "life_modifier",
        "hand_modifier",
        "edhrec_rank",
        "cmc",
    ],
    user_properties={"decks": wvcc.DataType.TEXT},
    user_interaction_property_names=[
        "added",
        "discarded",
    ],
    text_search_property_name="oracle_text",
)

msg.good("Magic The Gathering schema created")
