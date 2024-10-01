"use client";

interface InfoSideProps {}

const InfoSide: React.FC<InfoSideProps> = ({}) => {
  const card_size = 100;

  return (
    <div className="justify-start items-start w-full gap-4 flex flex-col p-4">
      <p className="text-lg font-bold text-white">
        Welcome to Magic: The Gathering Deck Builder
      </p>
      <p className="text-xs font-light text-gray-300">
        This demo is designed to help you build your next MTG deck by
        recommending cards that you might like. You can add cards to your deck
        and remove them.
      </p>

      <p className="text-xs font-light text-gray-300">
        This demo is using Weaviate's latest Recommender Service, which analyzes
        your interactions with cards and makes personalized recommendations
        based on your preferences based on your deck and your overall
        interactions with the game. You can view all of your interactions and
        experiment with the recommendation experience.
      </p>

      <p className="text-lg font-bold text-white">How to use the demo</p>

      <p className="text-xs font-light text-gray-300">
        You start with a random set of cards, which you can either discard or
        add to your deck. Any of these interactions will influence the next
        recommendation. The Recommendation button gives you three options,
        either you get recommendation based on all of your cards in the deck,
        get recommendations based on all of your interactions, or get a random
        set of cards.
      </p>
    </div>
  );
};

export default InfoSide;
