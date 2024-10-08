"use client";

import Card from "@/app/components/Card";
import CardSelection from "@/app/components/CardSelection";

import {
  getCurrentIPAddress,
  getInteractions,
  deleteAllInteractions,
  saveDeck,
  getDeck,
} from "./api";
import { CardType, Interaction, CardInfo } from "./types";
import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";

export default function Home() {
  const [userId, setUserId] = useState("");
  const [cardInDeck, setCardInDeck] = useState<CardInfo[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  const [numberOfCards, setNumberOfCards] = useState(6);

  const [loadingInteractions, setLoadingInteractions] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const ipAddress = await getCurrentIPAddress();
      if (ipAddress) {
        setUserId(ipAddress);
        fetchInteractions(ipAddress);
        const deck = await getDeck(ipAddress);
        if (deck) {
          if (deck.length > 0) {
            setCardInDeck(JSON.parse(deck));
          } else {
            setCardInDeck([]);
          }
        }
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
    setCardInDeck(
      cardInDeck.filter((card) => card.card_type.card_id !== card_id)
    );
    handleSaveDeck();
  };

  const handleAddToDeck = (card: CardType) => {
    const existingCardIndex = cardInDeck.findIndex(
      (deckCard) => deckCard.card_type.card_id === card.card_id
    );

    if (existingCardIndex !== -1) {
      // Card already exists in deck, increase quantity
      const updatedDeck = [...cardInDeck];
      updatedDeck[existingCardIndex].quantity += 1;
      setCardInDeck(updatedDeck);
    } else {
      // Card doesn't exist in deck, add it with quantity 1
      setCardInDeck([...cardInDeck, { card_type: card, quantity: 1 }]);
    }
    handleSaveDeck();
  };

  const handleAddQuantity = (card_id: string) => {
    setCardInDeck(
      cardInDeck.map((card) =>
        card.card_type.card_id === card_id
          ? { ...card, quantity: card.quantity + 1 }
          : card
      )
    );
  };

  const handleRemoveQuantity = (card_id: string) => {
    setCardInDeck(
      cardInDeck.reduce((acc, card) => {
        if (card.card_type.card_id === card_id) {
          const newQuantity = card.quantity - 1;
          if (newQuantity > 0) {
            acc.push({ ...card, quantity: newQuantity });
          }
        } else {
          acc.push(card);
        }
        return acc;
      }, [] as CardInfo[])
    );
  };

  const handleClearDeck = () => {
    setCardInDeck([]);
    handleSaveDeck();
  };

  const handleClearInteractions = () => {
    deleteAllInteractions(userId)
      .then(() => {
        setInteractions([]);
      })
      .catch((error) => {
        console.error("Error clearing interactions:", error);
      });
  };

  const handleSaveDeck = async () => {
    const deckString = JSON.stringify(cardInDeck);
    await saveDeck(deckString, userId);
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
            setInteractions={setInteractions}
            userId={userId}
            fetchInteractions={fetchInteractions}
          />
        </div>
        {/* Deck Sidebar */}
        <Sidebar
          cardInDeck={cardInDeck}
          userId={userId}
          handleRemoveFromDeck={handleRemoveFromDeck}
          fetchInteractions={fetchInteractions}
          loadingInteractions={loadingInteractions}
          interactions={interactions}
          handleAddQuantity={handleAddQuantity}
          handleRemoveQuantity={handleRemoveQuantity}
          handleClearDeck={handleClearDeck}
          handleClearInteractions={handleClearInteractions}
        />
      </div>
    </div>
  );
}
