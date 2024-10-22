# magic-recommender

This demo showcases the Recommender service by Weaviate using a dataset of 30,000 Magic: The Gathering cards. Magic: The Gathering is a popular collectible card game known for its large community and complex game mechanics (https://magic.wizards.com/en). This demo builds upon a previous Magic demo created with Streamlit, highlighting Hybrid and Generative Search capabilities (https://weaviate-magic-chat.streamlit.app/).

The goal of this demo application is to help you create a personalized deck based on your interactions and card recommendations. You begin with a random set of cards, which you can either add to your deck or discard. Each interaction influences the next recommendations, continuously refining them based on your choices. You can also search for and filter specific cards to add to your deck.

As you interact with the cards, the recommendations will become increasingly tailored to your preferences, considering factors such as card type, color, and effects. For instance, the more you engage with white cards, the more white cards will be recommended to you.

## Commands

`npm run dev`
`uvicorn backend.api:app --reload`

### Docker

`docker build --no-cache -t magic_app .`
`docker build -t magic_app .`
`docker run -p 3000:3000 magic_app`
`docker ps`
`docker stop <container_id>`
