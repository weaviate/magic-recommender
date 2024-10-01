"use client";

import Card from "@/app/components/Card";
import CardSelection from "@/app/components/CardSelection";

import { getCurrentIPAddress, getInteractions } from "./api";
import { CardType, Interaction } from "./types";
import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";

export default function Home() {
  const [userId, setUserId] = useState("");

  const [cardInDeck, setCardInDeck] = useState<CardType[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const ipAddress = await getCurrentIPAddress();
      if (ipAddress) {
        setUserId(ipAddress);
        const interactions = await getInteractions(ipAddress);
        if (interactions) {
          setInteractions(interactions);
        }
      }
    };
    fetchData();
  }, []);

  const handleRemoveFromDeck = (card_id: string) => {
    setCardInDeck(cardInDeck.filter((card) => card.card_id !== card_id));
  };

  const handleAddToDeck = (card: CardType) => {
    setCardInDeck([...cardInDeck, card]);
  };

  const handleClearDeck = () => {
    setCardInDeck([]);
  };

  const handleDeckClick = (card_id: string) => {};

  const card_size = 250;

  return (
    <div className=" flex flex-col">
      <div className="flex justify-center items-center">
        {/* Main Page */}
        <div
          className="flex flex-col p-4 gap-4 h-screen w-2/3 overflow-y-auto"
          style={{
            backgroundImage: "url('/img/background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Main Page Card Selection */}
          <CardSelection
            cardInDeck={cardInDeck}
            setCardInDeck={handleAddToDeck}
            setInteractions={setInteractions}
            userId={userId}
          />
        </div>
        {/* Deck Sidebar */}
        <Sidebar
          cardInDeck={cardInDeck}
          userId={userId}
          interactions={interactions}
          handleRemoveFromDeck={handleRemoveFromDeck}
          handleDeckClick={handleDeckClick}
          handleClearDeck={handleClearDeck}
        />
      </div>
    </div>
  );
}
