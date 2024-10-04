"use client";

import React, { useState } from "react";
import { CardType, Interaction } from "@/app/types";
import { GiCardDraw, GiCardRandom, GiCardPlay } from "react-icons/gi";

import { FaUserTag } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";

interface RecommendationButtonsProps {
  cardInDeck: CardType[];
  handleDeckRecommendations: () => void;
  handleUserRecommendations: () => void;
  handleRandomCards: () => void;
  interactions: Interaction[];
  isLoading: boolean;
}

const RecommendationButtons: React.FC<RecommendationButtonsProps> = ({
  cardInDeck,
  handleDeckRecommendations,
  handleUserRecommendations,
  handleRandomCards,
  interactions,
  isLoading,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const buttonClass =
    "btn text-white bg-zinc-800 hover:text-black hover:bg-gray-200 text-xs border-none w-full flex items-center justify-evenly";
  const iconClass = "w-[20px] flex justify-center";

  const handleRecommendationClick = (action: () => void) => {
    action();
    setIsExpanded(false);
  };

  return (
    <div className="relative flex flex-col gap-2 w-[210px] z-30">
      <button
        className={buttonClass}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={iconClass}>
          {isLoading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <IoMdAddCircle size={20} />
          )}
        </span>
        <p>Recommendations</p>
      </button>
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-fadeIn w-full">
          <button
            className={buttonClass}
            onClick={() => handleRecommendationClick(handleRandomCards)}
          >
            <span className={iconClass}>
              <GiCardRandom size={20} />
            </span>
            <p>Random Cards</p>
          </button>
          <button
            className={buttonClass}
            onClick={() => handleRecommendationClick(handleDeckRecommendations)}
            disabled={cardInDeck.length === 0}
          >
            <span className={iconClass}>
              <GiCardDraw size={20} />
            </span>
            <p>Based on Deck</p>
          </button>
          <button
            className={buttonClass}
            onClick={() => handleRecommendationClick(handleUserRecommendations)}
            disabled={interactions.length <= 5}
          >
            <span className={iconClass}>
              <FaUserTag size={20} />
            </span>
            <p>Based on User</p>
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendationButtons;
