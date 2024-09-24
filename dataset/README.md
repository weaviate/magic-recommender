This demo uses the the [Scryfall API](https://scryfall.com/docs/api) to fetch card data from Magic: The Gathering. This folder is focusing on retrieving the data and storing it locally in a JSON file for further processing. The dataset is approximately 2.1 GiB.

To run the dataset script follow these steps:

- Create a virtual environment and install the requirements:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

- Run the script:

```bash
python get_dataset.py
```
