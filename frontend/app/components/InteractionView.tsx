"use client";

import { Interaction } from "@/app/types";

interface InteractionViewProps {
  interactions: Interaction[];
  handleClearInteractions: () => void;
}

const InteractionView: React.FC<InteractionViewProps> = ({
  interactions,
  handleClearInteractions,
}) => {
  // Invert the sort of interactions
  const sortedInteractions = [...interactions].reverse();

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center">
        {sortedInteractions.length === 0 && (
          <p className="text-zinc-700 text-center">No interactions yet</p>
        )}
      </div>
      <div className="justify-start items-start w-full gap-4 flex flex-col p-4">
        <div className="flex justify-end items-end w-full">
          {interactions.length > 0 && (
            <button
              className="btn border-none bg-zinc-900 hover:bg-error text-white"
              onClick={handleClearInteractions}
            >
              <p className="text-xs">Clear Interactions</p>
            </button>
          )}
        </div>
        {sortedInteractions.map((interaction, index) => (
          <div key={index} className="flex items-center space-x-4">
            <img
              src={interaction.image_uri}
              alt={`Card ${interaction.name}`}
              className="w-20 object-cover rounded-lg"
            />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-white">{interaction.name}</p>
              <p className="text-xs font-mono">
                Interaction: {interaction.interaction_property_name}
              </p>
              <p className="text-xs   font-mono">
                Weight: {interaction.weight}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteractionView;
