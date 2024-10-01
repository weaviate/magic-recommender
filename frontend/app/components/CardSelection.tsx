"use client";

import React, { useRef, useState, useEffect } from "react";
import { CardType, Interaction, PlaceholderCard } from "@/app/types";
import Card from "./Card";
import RecommendationButtons from "./RecommendationButtons";

import {
  getRandomCards,
  getCardRecommendations,
  getUserRecommendations,
  addInteraction,
  getInteractions,
} from "@/app/api";

interface CardSelectionProps {
  cardInDeck: CardType[];
  setCardInDeck: (card: CardType) => void;
  userId: string;
  setInteractions: (interactions: Interaction[]) => void;
}

const CardSelection: React.FC<CardSelectionProps> = ({
  cardInDeck,
  setCardInDeck,
  userId,
  setInteractions,
}) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const pageSize = 6;
  const card_size = 230;

  const handleCardClick = (card_id: string) => {
    if (selectedCard === card_id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card_id);
    }
  };

  const handleRandomCards = () => {
    setIsLoading(true);
    setCards([]);
    getRandomCards(pageSize, userId).then((cards) => {
      if (cards) {
        setCards(cards.cards);
      }
    });
    setIsLoading(false);
  };

  const handleDeckRecommendations = () => {
    setIsLoading(true);
    setCards([]);
    const deckCardIds = cardInDeck.map((card) => card.card_id);
    getCardRecommendations(pageSize, deckCardIds, userId).then((cards) => {
      if (cards) {
        setCards(cards.cards);
      }
      setIsLoading(false);
    });
  };

  const handleUserRecommendations = () => {
    setIsLoading(true);
    setCards([]);
    getUserRecommendations(pageSize, userId).then((cards) => {
      if (cards) {
        setCards(cards.cards);
      }
      setIsLoading(false);
    });
  };

  const handleAddCard = (card_id: string) => {
    const cardIndex = cards.findIndex((card) => card.card_id === card_id);
    const cardToAdd = cards[cardIndex];
    if (cardToAdd) {
      setCardInDeck(cardToAdd);

      // Remove added card from cards
      setCards((prevCards) =>
        prevCards.filter((card) => card.card_id !== card_id)
      );

      // Add interaction and get a new recommendation
      Promise.all([
        addInteraction(card_id, userId, "added", 0.8),
        getCardRecommendations(1, [card_id], userId),
      ])
        .then(([_, newCards]) => {
          if (newCards && newCards.cards.length > 0) {
            setCards((prevCards) => [...prevCards, newCards.cards[0]]);
          }

          // Update interactions
          getInteractions(userId).then((newInteractions) => {
            if (newInteractions) {
              setInteractions(newInteractions);
            }
          });
        })
        .catch((error) => {
          console.error("Error adding card:", error);
        });
    }
  };

  const handleDiscardCard = (card_id: string) => {
    const cardToRemove = cards.find((card) => card.card_id === card_id);
    if (cardToRemove) {
      setCards(cards.filter((card) => card.card_id !== card_id));
      addInteraction(card_id, userId, "discarded", -0.8).then(() => {
        getInteractions(userId).then((newInteractions) => {
          if (newInteractions) {
            setInteractions(newInteractions);
          }
        });
      });
      getUserRecommendations(1, userId).then((cards) => {
        if (cards) {
          setCards((prevCards) => [...prevCards, ...cards.cards]);
        }
      });
    }
  };

  useEffect(() => {
    if (userId) {
      const fetchData = async () => {
        getRandomCards(pageSize, userId).then((cards) => {
          if (cards) {
            setCards(cards.cards);
          }
        });
      };
      fetchData();
    }
  }, [userId]);

  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute top-0 right-0 z-10 p-4">
        <RecommendationButtons
          isLoading={isLoading}
          cardInDeck={cardInDeck}
          handleDeckRecommendations={handleDeckRecommendations}
          handleUserRecommendations={handleUserRecommendations}
          handleRandomCards={handleRandomCards}
        />
      </div>
      <div className="flex-grow flex items-start justify-center pt-16">
        <div className="flex flex-wrap gap-6 items-start justify-center mt-4">
          {cards &&
            cards.map((card) => (
              <Card
                key={card.card_id}
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
    </div>
  );
};

export default CardSelection;
