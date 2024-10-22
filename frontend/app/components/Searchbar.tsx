import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

import { getSearchResults } from "@/app/api";

import { CardInfo, CardType, Interaction } from "../types";

import FiltersTab from "./FiltersTab";
import RecommendationButtons from "./RecommendationButtons";

interface SearchbarProps {
  userId: string;
  setCards: (cards: CardType[]) => void;
  numberOfCards: number;
  numberOfInteractions: number;
  numberOfDeck: number;
  selectedMana: string[];
  setSelectedMana: React.Dispatch<React.SetStateAction<string[]>>;
  cardInDeck: CardInfo[];
  handleDeckRecommendations: () => void;
  handleUserRecommendations: () => void;
  handleRandomCards: () => void;
  interactions: Interaction[];
  isLoading: boolean;
}

const Searchbar: React.FC<SearchbarProps> = ({
  userId,
  setCards,
  numberOfCards,
  numberOfInteractions,
  selectedMana,
  setSelectedMana,
  numberOfDeck,
  cardInDeck,
  handleDeckRecommendations,
  handleUserRecommendations,
  handleRandomCards,
  interactions,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query: string) => {
    setIsSearching(true);
    getSearchResults(
      query,
      userId,
      numberOfCards,
      numberOfInteractions,
      numberOfDeck,
      "recommended",
      selectedMana
    ).then((data) => {
      if (data) {
        setCards(data.cards);
        setIsSearching(false);
      } else {
        setIsSearching(false);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchQuery);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-2 w-full justify-evenly">
        <div className="w-full flex flex-col gap-2">
          <div className="flex flex-col gap-2 w-full">
            <a
              href="https://weaviate.io/workbench/recommender"
              target="_blank"
              rel="noopener noreferrer"
              className="footer flex justify-start items-center gap-2 opacity-50"
            >
              <img
                src="/img/weaviate.svg"
                alt="Weaviate Logo"
                className="w-[20px]"
              />
              <p className="text-xs font-light text-gray-300">
                Powered by Weaviate Recommender Service
              </p>
            </a>
          </div>
          <div className="flex gap-3 w-full relative">
            <input
              type="text"
              placeholder="Search…"
              className="input bg-zinc-800 input-bordered focus:outline-none border-none text-xs w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />

            <button
              className="btn bg-zinc-800 hover:bg-white text-white hover:text-black"
              onClick={() => handleSearch(searchQuery)}
              disabled={isSearching}
            >
              {isSearching ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <FaSearch />
              )}
            </button>
            <div className="absolute right-0 top-0">
              <RecommendationButtons
                isLoading={isLoading}
                cardInDeck={cardInDeck}
                handleDeckRecommendations={handleDeckRecommendations}
                handleUserRecommendations={handleUserRecommendations}
                handleRandomCards={handleRandomCards}
                interactions={interactions}
              />
            </div>
          </div>
        </div>
      </div>
      <FiltersTab
        selectedMana={selectedMana}
        setSelectedMana={setSelectedMana}
      />
    </div>
  );
};

export default Searchbar;
