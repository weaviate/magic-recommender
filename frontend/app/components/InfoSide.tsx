"use client";

const InfoSide = () => {
  return (
    <div className="justify-start items-start w-full gap-4 flex flex-col p-4">
      <img src="/img/mtg-logo.svg" alt="MTG Logo" className="w-1/2" />

      <p className="text-lg font-bold text-white">
        Welcome to Magic: The Gathering Deck Builder
      </p>

      <p className="text-xs font-light text-gray-300">
        This demo is designed to help you build your next MTG deck by
        recommending cards based on your deck and your interactions while
        creating it.
      </p>

      <p className="text-xs font-light text-gray-300">
        It makes use of the latest Recommending Service by Weaviate, which
        analyzes your interactions with cards and your deck to create
        personalized recommendations. For instance, if you are going for a white
        vampire deck, the system will recommend cards that are relevant to that
        specific theme.
      </p>

      <p className="text-lg font-bold text-white">How it works!</p>

      <p className="text-xs font-light text-gray-300">
        You start with a random set of cards, which you can either add to your
        deck or discard. Any of these interactions will influence the next
        recommendation, and keeps building up through your interactions. You can
        search and filter for specific cards that you are looking for, and add
        them to your deck.
      </p>

      <p className="text-xs font-light text-gray-300">
        The Recommendation button gives you three options, either you get
        recommendation based on all of your cards in the deck, get
        recommendations based on all of your interactions, or get a random set
        of cards.
      </p>

      <p className="text-lg font-bold text-white">What is Weaviate?</p>

      <p className="text-xs font-light text-gray-300">
        Weaviate is an open-source vector database that allows you to store,
        search, and query data in a vector space. It is designed to work with
        machine learning models and is used to store and query data in a vector
        space.
      </p>
    </div>
  );
};

export default InfoSide;
