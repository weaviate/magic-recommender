"use client";

import React, { useState, useEffect } from "react";
import { CardInfo, Interaction } from "@/app/types";
import { GiCardDraw } from "react-icons/gi";
import { AiFillInteraction } from "react-icons/ai";
import { FaMagic } from "react-icons/fa";

import InfoSide from "./InfoSide";
import Interactions from "./InteractionView";
import Deck from "./Deck";

interface SidebarProps {
  cardInDeck: CardInfo[];
  userId: string;
  handleRemoveFromDeck: (card_id: string) => void;
  handleAddQuantity: (card_id: string) => void;
  handleRemoveQuantity: (card_id: string) => void;
  interactions: Interaction[];
  handleClearDeck: () => void;
  handleClearInteractions: () => void;
  fetchInteractions: (userId: string) => void;
  loadingInteractions: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  cardInDeck,
  userId,
  handleAddQuantity,
  handleRemoveQuantity,
  handleClearDeck,
  fetchInteractions,
  loadingInteractions,
  interactions,
  handleClearInteractions,
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
        <p className="text-[9px] font-light text-zinc-700">{userId}</p>
      </div>
      <div className="divider m-1"></div>
      <div className="flex flex-row gap-2">
        <button
          className={`btn ${
            currentView === "Info"
              ? "bg-white text-black"
              : "text-white bg-zinc-900"
          } hover:bg-white hover:text-black border-none`}
          onClick={() => setCurrentView("Info")}
        >
          <FaMagic />
          <p className="text-xs">Welcome</p>
        </button>
        <button
          className={`btn flex justify-center flex-row gap-2  ${
            currentView === "Deck"
              ? "bg-white text-black"
              : " text-white bg-zinc-900"
          } hover:bg-white hover:text-black border-none`}
          onClick={() => setCurrentView("Deck")}
        >
          <GiCardDraw />
          <p className="text-xs">
            Deck ({cardInDeck.reduce((sum, card) => sum + card.quantity, 0)})
          </p>
        </button>
        <button
          className={`btn flex justify-center flex-row gap-2 ${
            currentView === "Interactions"
              ? "bg-white text-black"
              : "bg-zinc-900 text-white"
          } hover:bg-white hover:text-black border-none`}
          onClick={() => {
            setCurrentView("Interactions");
            fetchInteractions(userId);
          }}
        >
          <AiFillInteraction />
          <p className="text-xs items-center flex gap-2">
            Interactions{" "}
            {loadingInteractions ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              `(${interactions.length})`
            )}
          </p>
        </button>
      </div>
      <div className="divider m-1"></div>
      {currentView === "Info" && <InfoSide />}
      {currentView === "Deck" && (
        <Deck
          cardInDeck={cardInDeck}
          userId={userId}
          handleAddQuantity={handleAddQuantity}
          handleRemoveQuantity={handleRemoveQuantity}
          handleClearDeck={handleClearDeck}
        />
      )}
      {currentView === "Interactions" && (
        <Interactions
          interactions={interactions}
          handleClearInteractions={handleClearInteractions}
        />
      )}
    </div>
  );
};

export default Sidebar;
