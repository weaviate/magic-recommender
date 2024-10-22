import React, { useState } from "react";

interface FiltersTabProps {
  selectedMana: string[];
  setSelectedMana: React.Dispatch<React.SetStateAction<string[]>>;
}

const FiltersTab: React.FC<FiltersTabProps> = ({
  selectedMana,
  setSelectedMana,
}) => {
  const handleManaSelect = (mana: string) => {
    setSelectedMana((prev) =>
      prev.includes(mana) ? prev.filter((m) => m !== mana) : [...prev, mana]
    );
  };

  return (
    <div className="flex gap-2 w-full items-center">
      <div className="flex gap-2 items-center">
        <button
          onClick={() => handleManaSelect("W")}
          className={`btn btn-sm btn-outline btn-circle hover:opacity-100 hover:bg-white  ${
            selectedMana.includes("W")
              ? "bg-yellow-500 opacity-100 border-zinc-100 "
              : "opacity-60 border-zinc-800"
          }`}
        >
          <img src="/mana/white.svg" alt="White Mana" className="w-[16px]" />
        </button>
        <button
          onClick={() => handleManaSelect("B")}
          className={`btn btn-sm btn-outline btn-circle hover:opacity-100 hover:bg-white  ${
            selectedMana.includes("B")
              ? "bg-blue-500 opacity-100 border-zinc-100 "
              : "opacity-60 border-zinc-800"
          }`}
        >
          <img src="/mana/blue.svg" alt="Blue Mana" className="w-[16px]" />
        </button>
        <button
          onClick={() => handleManaSelect("U")}
          className={`btn btn-sm btn-outline btn-circle hover:opacity-100 hover:bg-white  ${
            selectedMana.includes("U")
              ? "bg-purple-500 opacity-100 border-zinc-100 "
              : "opacity-60 border-zinc-800"
          }`}
        >
          <img src="/mana/black.svg" alt="Black Mana" className="w-[16px]" />
        </button>
        <button
          onClick={() => handleManaSelect("R")}
          className={`btn btn-sm btn-outline btn-circle hover:opacity-100 hover:bg-white  ${
            selectedMana.includes("R")
              ? "bg-red-500 opacity-100 border-zinc-100 "
              : "opacity-60 border-zinc-800"
          }`}
        >
          <img src="/mana/red.svg" alt="Red Mana" className="w-[16px]" />
        </button>
        <button
          onClick={() => handleManaSelect("G")}
          className={`btn btn-sm btn-outline btn-circle hover:opacity-100 hover:bg-white  ${
            selectedMana.includes("G")
              ? "bg-green-500 opacity-100 border-zinc-100 "
              : "opacity-60 border-zinc-800"
          }`}
        >
          <img src="/mana/green.svg" alt="Green Mana" className="w-[16px]" />
        </button>
      </div>
    </div>
  );
};

export default FiltersTab;
