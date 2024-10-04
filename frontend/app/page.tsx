"use client";

import Card from "@/app/components/Card";
import CardSelection from "@/app/components/CardSelection";

import { getCurrentIPAddress, getInteractions, getSearchResults } from "./api";
import { CardType, Interaction } from "./types";
import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";

export default function Home() {
  const [userId, setUserId] = useState("");
  const [cardInDeck, setCardInDeck] = useState<CardType[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  const [numberOfCards, setNumberOfCards] = useState(6);

  const [loadingInteractions, setLoadingInteractions] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const ipAddress = await getCurrentIPAddress();
      if (ipAddress) {
        setUserId(ipAddress);
        fetchInteractions(ipAddress);
      }
    };
    fetchData();
  }, []);

  const fetchInteractions = async (userId: string) => {
    setLoadingInteractions(true);
    const interactions = await getInteractions(userId);
    if (interactions) {
      setInteractions(interactions);
      setLoadingInteractions(false);
    } else {
      setLoadingInteractions(false);
    }
  };

  const handleRemoveFromDeck = (card_id: string) => {
    setCardInDeck(cardInDeck.filter((card) => card.card_id !== card_id));
  };

  const handleAddToDeck = (card: CardType) => {
    setCardInDeck([...cardInDeck, card]);
  };

  const handleClearDeck = () => {
    setCardInDeck([]);
  };

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
            numberOfCards={numberOfCards}
            interactions={interactions}
            setCardInDeck={handleAddToDeck}
            setCardDeck={setCardInDeck}
            setInteractions={setInteractions}
            userId={userId}
            fetchInteractions={fetchInteractions}
          />
        </div>
        {/* Deck Sidebar */}
        <Sidebar
          cardInDeck={cardInDeck}
          userId={userId}
          fetchInteractions={fetchInteractions}
          loadingInteractions={loadingInteractions}
          interactions={interactions}
          handleRemoveFromDeck={handleRemoveFromDeck}
          handleClearDeck={handleClearDeck}
        />
      </div>
    </div>
  );
}
