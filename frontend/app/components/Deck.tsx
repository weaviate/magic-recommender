"use client";

import React, { useState } from "react";
import { CardType } from "@/app/types";
import Card from "./Card";

interface DeckProps {
  cardInDeck: CardType[];
  userId: string;
  handleRemoveFromDeck: (card_id: string) => void;
  handleDeckClick: (card_id: string) => void;
  handleClearDeck: () => void;
}

const Deck: React.FC<DeckProps> = ({
  cardInDeck,
  userId,
  handleRemoveFromDeck,
  handleDeckClick,
  handleClearDeck,
}) => {
  const card_size = 200;

  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardClick = (card_id: string) => {
    setSelectedCard(card_id);
  };

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex flex-row justify-end items-end w-full p-4 gap-2">
        {cardInDeck.length > 0 && (
          <button
            className="btn border-none bg-zinc-900 hover:bg-error text-white"
            onClick={handleClearDeck}
          >
            <p className="text-xs">Clear Deck</p>
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 justify-center items-center w-full p-4 gap-2">
        {cardInDeck.map((card) => (
          <Card
            image_uri={card.image_uri}
            width={card_size}
            card_id={card.card_id}
            onClick={handleCardClick}
            selected={selectedCard === card.card_id}
            preview={true}
            onAdd={handleDeckClick}
            onDiscard={handleRemoveFromDeck}
          />
        ))}
      </div>
    </div>
  );
};

export default Deck;
