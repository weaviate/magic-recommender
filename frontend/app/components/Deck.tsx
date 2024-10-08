"use client";

import React, { useState } from "react";
import { CardInfo } from "@/app/types";
import Card from "./Card";

interface DeckProps {
  cardInDeck: CardInfo[];
  userId: string;
  handleAddQuantity: (card_id: string) => void;
  handleRemoveQuantity: (card_id: string) => void;
  handleClearDeck: () => void;
}

const Deck: React.FC<DeckProps> = ({
  cardInDeck,
  handleAddQuantity,
  handleRemoveQuantity,
  handleClearDeck,
}) => {
  const card_size = 200;

  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardClick = (card_id: string) => {
    if (selectedCard === card_id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card_id);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div>
        {cardInDeck.length === 0 && (
          <p className="text-zinc-700 text-center">No cards in deck</p>
        )}
      </div>
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
            image_uri={card.card_type.image_uri}
            width={card_size}
            card_id={card.card_type.card_id}
            card_quantity={card.quantity}
            onClick={handleCardClick}
            selected={selectedCard === card.card_type.card_id}
            preview={true}
            onAdd={handleAddQuantity}
            onDiscard={handleRemoveQuantity}
          />
        ))}
      </div>
    </div>
  );
};

export default Deck;
