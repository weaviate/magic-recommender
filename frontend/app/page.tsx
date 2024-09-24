"use client";

import Card from "@/app/components/Card";

import {
  getRandomCards,
  getCurrentIPAddress,
  getCardRecommendations,
  getUserRecommendations,
  addInteraction,
} from "./api";
import { CardType } from "./types";
import { useState, useEffect } from "react";
import { GiCardDraw } from "react-icons/gi";
import { GiCardRandom } from "react-icons/gi";
import { FaUserTag } from "react-icons/fa";

export default function Home() {
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState("");

  const [cards, setCards] = useState<CardType[]>([]);
  const [total, setTotal] = useState(0);

  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const [cardInDeck, setCardInDeck] = useState<CardType[]>([]);

  const pageSize = 3;

  useEffect(() => {
    const fetchData = async () => {
      const ipAddress = await getCurrentIPAddress();
      if (ipAddress) {
        setUserId(ipAddress);
      }
      getRandomCards(pageSize, ipAddress!).then((cards) => {
        if (cards) {
          setCards(cards.cards);
          setTotal(cards.total);
        }
      });
    };

    fetchData();
  }, []);

  const handleDeckClick = (card_id: string) => {};

  const handleCardClick = (card_id: string) => {
    if (selectedCard === card_id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card_id);
    }
  };

  const handleAddCard = (card_id: string) => {
    const cardToAdd = cards.find((card) => card.card_id === card_id);
    if (cardToAdd) {
      setCardInDeck([...cardInDeck, cardToAdd]);
      setCards(cards.filter((card) => card.card_id !== card_id));
      addInteraction(card_id, userId, "added");
      getCardRecommendations(1, [card_id], userId).then((cards) => {
        if (cards) {
          setCards((prevCards) => [...prevCards, ...cards.cards]);
        }
      });
    }
  };

  const handleDiscardCard = (card_id: string) => {
    const cardToRemove = cards.find((card) => card.card_id === card_id);
    if (cardToRemove) {
      setCards(cards.filter((card) => card.card_id !== card_id));
      getUserRecommendations(1, userId).then((cards) => {
        if (cards) {
          setCards((prevCards) => [...prevCards, ...cards.cards]);
        }
      });
    }
  };

  const handleRandomCards = () => {
    getRandomCards(pageSize, userId).then((cards) => {
      if (cards) {
        setCards(cards.cards);
        setTotal(cards.total);
      }
    });
  };

  const handleDeckRecommendations = () => {
    const deckCardIds = cardInDeck.map((card) => card.card_id);
    getCardRecommendations(pageSize, deckCardIds, userId).then((cards) => {
      if (cards) {
        setCards(cards.cards);
        setTotal(cards.total);
      }
    });
  };

  const handleRemoveFromDeck = (card_id: string) => {
    setCardInDeck(cardInDeck.filter((card) => card.card_id !== card_id));
  };

  const card_size = 250;

  return (
    <div className=" flex flex-col">
      <div className="flex justify-center items-center">
        <div className="flex flex-col p-4 gap-8 h-screen bg-zinc-700 w-2/3 overflow-y-auto">
          <div className="flex justify-between items-center w-full ">
            <div className="flex items-center">
              <img
                src="/img/mtg-logo.svg"
                alt="Magic: The Gathering Logo"
                width={120}
              />
            </div>
            <div className="flex items-center gap-2">
              <p className="font-light text-xs">Powered by</p>
              <img src="/img/weaviate.svg" alt="Weaviate Logo" width={30} />
            </div>
          </div>
          <div className="flex justify-center items-center w-full gap-2">
            <div className="flex flex-row  justify-center items-center gap-2 w-full">
              {cardInDeck.length > 0 && (
                <button
                  className="btn border-none gap-2"
                  onClick={handleDeckRecommendations}
                >
                  <GiCardDraw /> Deck Recommendations
                </button>
              )}
              <button className="btn border-none gap-2">
                <FaUserTag /> User Recommendations
              </button>
              <button
                className="btn border-none gap-2"
                onClick={handleRandomCards}
              >
                <GiCardRandom /> Random Cards
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 w-full h-full items-center justify-center">
            {cards &&
              cards.map((card) => (
                <Card
                  image_uri={card.image_uri}
                  width={card_size}
                  card_id={card.card_id}
                  preview={false}
                  onAdd={handleAddCard}
                  onDiscard={handleDiscardCard}
                  onClick={handleCardClick}
                  selected={selectedCard === card.card_id}
                />
              ))}
          </div>
        </div>
        <div className="flex flex-col w-1/3 bg-zinc-800 items-start justify-start h-screen overflow-y-auto p-4">
          <div className="flex flex-col p-4 justify-center items-center w-full">
            <p className="text-lg font-bold">Deck ({cardInDeck.length})</p>
            <p className="text-xs font-light opacity-50">User ID: {userId}</p>
          </div>
          <div className="grid grid-cols-3 justify-center items-center w-full gap-2 p-4">
            {cardInDeck.map((card) => (
              <Card
                image_uri={card.image_uri}
                width={card_size / 2}
                card_id={card.card_id}
                onClick={handleRemoveFromDeck}
                selected={false}
                preview={true}
                onAdd={handleDeckClick}
                onDiscard={handleDeckClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
