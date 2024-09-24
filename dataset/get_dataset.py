import requests
import json
from tqdm import tqdm
import time


def get_bulk_data():
    url = "https://api.scryfall.com/bulk-data/all_cards"
    response = requests.get(url)
    return response.json()


def download_file(url, filename):
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get("content-length", 0))

    start_time = time.time()
    with open(filename, "wb") as file, tqdm(
        desc=filename,
        total=total_size,
        unit="iB",
        unit_scale=True,
        unit_divisor=1024,
    ) as progress_bar:
        for data in response.iter_content(chunk_size=1024):
            size = file.write(data)
            progress_bar.update(size)

    end_time = time.time()
    print(f"Download completed in {end_time - start_time:.2f} seconds")

    # Now parse the downloaded file and save it as JSONL
    jsonl_filename = f"{filename}.jsonl"
    unique_cards = set()
    with open(filename, "r", encoding="utf-8") as input_file, open(
        jsonl_filename, "w", encoding="utf-8"
    ) as output_file:
        data = json.load(input_file)
        for card in data:
            if card.get("lang") == "en":
                card_name = card.get("name")
                oracle_text = card.get("oracle_text")
                if card_name and oracle_text:
                    unique_key = (card_name, oracle_text)
                    if unique_key not in unique_cards:
                        unique_cards.add(unique_key)
                        json.dump(card, output_file)
                        output_file.write("\n")

    print(f"Converted to JSONL format: {jsonl_filename}")
    print(f"Total unique cards: {len(unique_cards)}")
    return jsonl_filename


def main():
    bulk_data = get_bulk_data()

    download_url = bulk_data["download_uri"]
    filename = "all_cards"

    print(f"Downloading {bulk_data['name']} dataset...")
    jsonl_filename = download_file(download_url, filename)
    print(f"File saved as {jsonl_filename}")


if __name__ == "__main__":
    main()
