"use client";

import React, { useState, useEffect } from "react";
import { CardType, Interaction } from "@/app/types";
import { FaInfoCircle } from "react-icons/fa";
import { GiCardDraw, GiCardRandom, GiCardPlay } from "react-icons/gi";
import { AiFillInteraction } from "react-icons/ai";
import { FaMagic } from "react-icons/fa";

import InfoSide from "./InfoSide";
import Interactions from "./InteractionView";
import Deck from "./Deck";

interface SidebarProps {
  cardInDeck: CardType[];
  userId: string;
  handleRemoveFromDeck: (card_id: string) => void;
  handleDeckClick: (card_id: string) => void;
  interactions: Interaction[];
}

const Sidebar: React.FC<SidebarProps> = ({
  cardInDeck,
  userId,
  handleRemoveFromDeck,
  handleDeckClick,
  interactions,
}) => {
  const [currentView, setCurrentView] = useState<
    "Deck" | "Info" | "Interactions"
  >("Info");

  useEffect(() => {
    if (cardInDeck.length > 0) {
      setCurrentView("Deck");
    }
  }, [cardInDeck]);

  return (
    <div className="flex flex-col w-1/3 bg-zinc-800 items-start justify-start h-screen overflow-y-auto p-4 gap-2">
      <div className="flex items-center w-full gap-4">
        <img
          src="/img/mtg-logo.svg"
          alt="Magic: The Gathering Logo"
          width={120}
        />
        <p className="text-base font-bold text-white">Deck Builder</p>
      </div>
      <div className="divider m-1"></div>
      <div className="flex flex-row gap-2">
        <button
          className={`btn text-white ${
            currentView === "Info" ? "bg-white text-black" : "bg-zinc-900"
          } hover:bg-white hover:text-black border-none`}
          onClick={() => setCurrentView("Info")}
        >
          <FaMagic />
          <p className="text-xs">Welcome</p>
        </button>
        <button
          className={`btn flex justify-center flex-row gap-2 text-white ${
            currentView === "Deck" ? "bg-white text-black" : "bg-zinc-900"
          } hover:bg-white hover:text-black border-none`}
          onClick={() => setCurrentView("Deck")}
        >
          <GiCardDraw />
          <p className="text-xs">Deck ({cardInDeck.length})</p>
        </button>
        <button
          className={`btn flex justify-center flex-row gap-2 text-white ${
            currentView === "Interactions"
              ? "bg-white text-black"
              : "bg-zinc-900"
          } hover:bg-white hover:text-black border-none`}
          onClick={() => setCurrentView("Interactions")}
        >
          <AiFillInteraction />
          <p className="text-xs">Interactions ({interactions.length})</p>
        </button>
      </div>
      {currentView === "Info" && <InfoSide />}
      {currentView === "Deck" && (
        <Deck
          cardInDeck={cardInDeck}
          userId={userId}
          handleRemoveFromDeck={handleRemoveFromDeck}
          handleDeckClick={handleDeckClick}
        />
      )}
      {currentView === "Interactions" && (
        <Interactions interactions={interactions} />
      )}
    </div>
  );
};

export default Sidebar;
