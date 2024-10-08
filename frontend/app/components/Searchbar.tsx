import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

import { getSearchResults } from "@/app/api";

import { CardType } from "../types";

interface SearchbarProps {
  userId: string;
  setCards: (cards: CardType[]) => void;
  numberOfCards: number;
  numberOfInteractions: number;
  numberOfDeck: number;
}

const Searchbar: React.FC<SearchbarProps> = ({
  userId,
  setCards,
  numberOfCards,
  numberOfInteractions,
  numberOfDeck,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<"recommended" | "hybrid">(
    "recommended"
  );

  const handleSearch = (query: string) => {
    setIsSearching(true);
    getSearchResults(
      query,
      userId,
      numberOfCards,
      numberOfInteractions,
      numberOfDeck,
      searchType
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
    <div className="flex gap-2 w-full justify-evenly">
      <div className="w-full flex gap-2">
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
      </div>
    </div>
  );
};

export default Searchbar;
