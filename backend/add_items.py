import json
from weaviate_recommend import WeaviateRecommendClient
import weaviate.classes.config as wvcc
from dotenv import load_dotenv
import os
from tqdm import tqdm
from wasabi import msg
from weaviate_recommend.models.data import RecommenderItem
import time

# Load environment variables from .env file
load_dotenv()

msg.divider("Starting ingestion process")

# Configuration
train_at = 10000
start_at = 10000

# Get the service URL from the environment variable
service_url = os.getenv("SERVICE_URL")
api_key = os.getenv("API_KEY")

# Create a client instance
client = WeaviateRecommendClient(service_url, api_key)

file_path = "../dataset/all_cards.jsonl"

# Count total number of lines in the file
total_lines = sum(1 for _ in open(file_path, "r"))

batch_size = 1000
counter = 0
items = []
training = False

with open(file_path, "r") as file:
    for line in tqdm(file, total=total_lines, desc="Processing cards"):
        try:
            card = json.loads(line.strip())
            item_properties = {
                "card_id": card["id"],
                "oracle_id": card.get("oracle_id", ""),
                "name": card["name"],
                "released_at": card.get("released_at", ""),
                "uri": card["uri"],
                "scryfall_uri": card["scryfall_uri"],
                "image_uri": (
                    card["image_uris"]["normal"] if "image_uris" in card else ""
                ),
                "type_line": card.get("type_line", ""),
                "oracle_text": card.get("oracle_text", ""),
                "colors": card.get("colors", []),
                "color_identity": card.get("color_identity", []),
                "keywords": card.get("keywords", []),
                "produced_mana": card.get("produced_mana", []),
                "set_name": card.get("set_name", ""),
                "rarity": card.get("rarity", ""),
                "power": card.get("power", ""),
                "toughness": card.get("toughness", ""),
                "mana_cost": card.get("mana_cost", ""),
                "loyalty": card.get("loyalty", ""),
                "defense": card.get("defense", ""),
                "life_modifier": card.get("life_modifier", ""),
                "hand_modifier": card.get("hand_modifier", ""),
                "edhrec_rank": card.get("edhrec_rank", 0),
                "cmc": card.get("cmc", 0),
            }

            counter += 1
            if start_at <= counter:
                items.append(RecommenderItem(id=card["id"], properties=item_properties))

            if len(items) >= batch_size and not training:
                response = client.item.add_batch(items)
                msg.info(response)
                items = []  # Clear the list after batch insertion

            if counter == train_at:
                training = True
                response = client.train(overwrite=True)
                msg.info(response)

                try:
                    while client.is_training():
                        msg.info("Training in progress...")
                        time.sleep(10)  # Wait for 10 seconds before checking again
                        status = client.train_status()
                        if status.status == "error":
                            msg.fail("Training failed!")
                            msg.info(status)
                            exit(1)
                        msg.info(status)
                except Exception as e:
                    msg.fail(f"Error getting training status: {e}")
                    exit(1)

        except json.JSONDecodeError as e:
            msg.warn(f"Error decoding JSON: {e}")
        except Exception as e:
            msg.fail(f"Error processing card: {e}")
            continue

# Add any remaining items in the last batch
if items:
    response = client.item.add_batch(items)

msg.good("Ingestion process completed.")
