"use client";

import React, { useState } from "react";
import { CardType } from "@/app/types";
import Card from "./Card";

interface DeckProps {
  cardInDeck: CardType[];
  userId: string;
  handleRemoveFromDeck: (card_id: string) => void;
  handleDeckClick: (card_id: string) => void;
}

const Deck: React.FC<DeckProps> = ({
  cardInDeck,
  userId,
  handleRemoveFromDeck,
  handleDeckClick,
}) => {
  const card_size = 200;

  return (
    <div className="grid grid-cols-3 justify-center items-center w-full p-4 gap-2">
      {cardInDeck.map((card) => (
        <Card
          image_uri={card.image_uri}
          width={card_size}
          card_id={card.card_id}
          onClick={handleRemoveFromDeck}
          selected={false}
          preview={true}
          onAdd={handleDeckClick}
          onDiscard={handleDeckClick}
        />
      ))}
    </div>
  );
};

export default Deck;
