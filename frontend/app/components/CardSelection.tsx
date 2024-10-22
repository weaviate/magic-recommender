"use client";

import React, { useState, useEffect } from "react";
import { CardType, Interaction, CardInfo } from "@/app/types";
import Card from "./Card";

import Searchbar from "./Searchbar";

import {
  getRandomCards,
  getCardRecommendations,
  getUserRecommendations,
  addInteraction,
} from "@/app/api";

interface CardSelectionProps {
  cardInDeck: CardInfo[];
  setCardInDeck: (card: CardType) => void;
  userId: string;
  fetchInteractions: (userId: string) => void;
  numberOfCards: number;
  interactions: Interaction[];
}

const CardSelection: React.FC<CardSelectionProps> = ({
  cardInDeck,
  setCardInDeck,
  userId,
  numberOfCards,
  fetchInteractions,
  interactions,
}) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedMana, setSelectedMana] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const pageSize = numberOfCards;
  const card_size = 230;

  const retrieveRecommendedCards = () => {
    if (cards.length < pageSize) {
    }
    if (cardInDeck.length > 0) {
      const card_ids = cards.map((card) => card.card_id);
      getCardRecommendations(
        pageSize - cards.length,
        card_ids,
        userId,
        selectedMana
      ).then((newCards) => {
        if (newCards) {
          setCards((prevCards) => {
            const combinedCards = [...prevCards, ...newCards.cards];
            return combinedCards.length > pageSize
              ? combinedCards.slice(0, pageSize)
              : combinedCards;
          });
        }
      });
    } else {
      getRandomCards(pageSize - cards.length, userId, selectedMana).then(
        (newCards) => {
          if (newCards) {
            setCards((prevCards) => {
              const combinedCards = [...prevCards, ...newCards.cards];
              return combinedCards.length > pageSize
                ? combinedCards.slice(0, pageSize)
                : combinedCards;
            });
          }
        }
      );
    }
  };

  const retrieveUserCards = () => {
    if (interactions.length > 10) {
      getUserRecommendations(
        pageSize - cards.length,
        userId,
        selectedMana
      ).then((newCards) => {
        if (newCards) {
          setCards((prevCards) => {
            const combinedCards = [...prevCards, ...newCards.cards];
            return combinedCards.length > pageSize
              ? combinedCards.slice(0, pageSize)
              : combinedCards;
          });
        }
      });
    } else if (cardInDeck.length > 0) {
      const card_ids = cards.map((card) => card.card_id);
      getCardRecommendations(
        pageSize - cards.length,
        card_ids,
        userId,
        selectedMana
      ).then((newCards) => {
        if (newCards) {
          setCards((prevCards) => {
            const combinedCards = [...prevCards, ...newCards.cards];
            return combinedCards.length > pageSize
              ? combinedCards.slice(0, pageSize)
              : combinedCards;
          });
        }
      });
    } else {
      getRandomCards(pageSize - cards.length, userId, selectedMana).then(
        (newCards) => {
          if (newCards) {
            setCards((prevCards) => {
              const combinedCards = [...prevCards, ...newCards.cards];
              return combinedCards.length > pageSize
                ? combinedCards.slice(0, pageSize)
                : combinedCards;
            });
          }
        }
      );
    }
  };

  const handleCardClick = React.useCallback((card_id: string) => {
    setSelectedCard((prevSelectedCard) =>
      prevSelectedCard === card_id ? null : card_id
    );
  }, []);

  const handleRandomCards = () => {
    setIsLoading(true);
    setCards([]);
    setSelectedCard(null);
    getRandomCards(pageSize, userId, selectedMana).then((cards) => {
      if (cards) {
        setCards(cards.cards);
      }
    });
    setIsLoading(false);
  };

  const handleDeckRecommendations = () => {
    setIsLoading(true);
    setCards([]);
    setSelectedCard(null);
    const deckCardIds = cardInDeck.map((card) => card.card_type.card_id);
    getCardRecommendations(pageSize, deckCardIds, userId, selectedMana).then(
      (cards) => {
        if (cards) {
          setCards(cards.cards);
        }
        setIsLoading(false);
      }
    );
  };

  const handleUserRecommendations = () => {
    setIsLoading(true);
    setCards([]);
    setSelectedCard(null);
    getUserRecommendations(pageSize, userId, selectedMana).then((cards) => {
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

      // Remove all cards with the matching id from cards
      setCards((prevCards) =>
        prevCards.filter((card) => card.card_id !== card_id)
      );

      setSelectedCard(null);

      addInteraction(card_id, userId, "added", 0.8).then(() => {
        fetchInteractions(userId);
      });

      retrieveRecommendedCards();
    }
  };

  const handleDiscardCard = (card_id: string) => {
    const cardToRemove = cards.find((card) => card.card_id === card_id);
    if (cardToRemove) {
      setCards(cards.filter((card) => card.card_id !== card_id));

      addInteraction(card_id, userId, "discarded", -0.8).then(() => {
        fetchInteractions(userId);
      });

      retrieveUserCards();
    }
  };

  useEffect(() => {
    if (userId) {
      retrieveUserCards();
    }
  }, [userId]);

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="absolute top-0 left-0 right-0 z-10 mt-2 px-12 flex gap-2 justify-start items-start w-full">
        <Searchbar
          userId={userId}
          setCards={setCards}
          numberOfCards={numberOfCards}
          numberOfInteractions={interactions.length}
          isLoading={isLoading}
          cardInDeck={cardInDeck}
          handleDeckRecommendations={handleDeckRecommendations}
          handleUserRecommendations={handleUserRecommendations}
          handleRandomCards={handleRandomCards}
          interactions={interactions}
          selectedMana={selectedMana}
          setSelectedMana={setSelectedMana}
          numberOfDeck={cardInDeck.reduce(
            (sum, card) => sum + card.quantity,
            0
          )}
        />
      </div>
      <div className="flex-grow flex items-start justify-center pt-16 mt-14">
        <div className="grid grid-cols-3 gap-12 items-start justify-center mt-4 overflow-y-auto h-[80vh] p-4">
          {cards &&
            cards.map((card, index) => (
              <Card
                key={`${card.card_id}-${index}`}
                image_uri={card.image_uri}
                width={card_size}
                card_id={card.card_id}
                preview={false}
                onAdd={handleAddCard}
                onDiscard={handleDiscardCard}
                card_quantity={1}
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
