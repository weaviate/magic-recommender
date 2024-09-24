from weaviate_recommend import WeaviateRecommendClient
import weaviate.classes.config as wvcc
from dotenv import load_dotenv
import os
from wasabi import msg
import time

# Load environment variables from .env file
load_dotenv()

msg.divider("Checking status")

# Get the service URL from the environment variable
service_url = os.getenv("SERVICE_URL")
api_key = os.getenv("API_KEY")

# Create a client instance
client = WeaviateRecommendClient(service_url, api_key)

msg.info(client.details())

while not client.is_trained():
    msg.info("Training in progress...")
    time.sleep(10)  # Wait for 10 seconds before checking again
    status = client.train_status()
    msg.info(status)
