"use server";

import { CardsResponse, Interaction } from "./types";

const checkUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    return false;
  }
};

export const detectHost = async (): Promise<string> => {
  const localUrl = "http://localhost:8000/health";
  const rootUrl = "http://127.0.0.1:8000/health";

  const isLocalHealthy = await checkUrl(localUrl);
  if (isLocalHealthy) {
    return "http://localhost:8000";
  }

  const isRootHealthy = await checkUrl(rootUrl);
  if (isRootHealthy) {
    return "http://127.0.0.1:8000";
  }

  throw new Error("Both health checks failed, please check the Magic Server");
};

// Endpoint /random
export const getRandomCards = async (
  pageSize: number,
  userId: string,
  selectedMana: string[]
): Promise<CardsResponse | null> => {
  try {
    const host = await detectHost();
    const response = await fetch(`${host}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page: Math.floor(Math.random() * 1000) + 1,
        pageSize: pageSize,
        userId: userId,
        selectedMana: selectedMana,
      }),
    });
    const data: CardsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error retrieving content", error);
    return null;
  }
};

// Endpoint /card_recommendation
export const getCardRecommendations = async (
  numberOfCards: number,
  cardIds: string[],
  userId: string,
  selectedMana: string[]
): Promise<CardsResponse | null> => {
  try {
    const host = await detectHost();
    const response = await fetch(`${host}/card_recommendation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        numberOfCards: numberOfCards,
        cardIds: cardIds,
        userId: userId,
        selectedMana: selectedMana,
      }),
    });
    const data: CardsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error retrieving content", error);
    return null;
  }
};

// Endpoint /user_recommendation
export const getUserRecommendations = async (
  numberOfCards: number,
  userId: string,
  selectedMana: string[]
): Promise<CardsResponse | null> => {
  try {
    const host = await detectHost();
    const response = await fetch(`${host}/user_recommendation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        numberOfCards: numberOfCards,
        userId: userId,
        selectedMana: selectedMana,
      }),
    });
    const data: CardsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error retrieving content", error);
    return null;
  }
};

// Endpoint /card_search
export const getSearchResults = async (
  query: string,
  userId: string,
  numberOfCards: number,
  numberOfInteractions: number,
  numberOfDeck: number,
  searchType: "recommended" | "hybrid",
  selectedMana: string[]
): Promise<CardsResponse | null> => {
  try {
    const host = await detectHost();
    const response = await fetch(`${host}/card_search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        userId: userId,
        numberOfCards: numberOfCards,
        numberOfInteractions: numberOfInteractions,
        numberOfDeck: numberOfDeck,
        searchType: searchType,
        selectedMana: selectedMana,
      }),
    });
    const data: CardsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error retrieving content", error);
    return null;
  }
};

// Endpoint /add_interaction
export const addInteraction = async (
  cardId: string,
  userId: string,
  interaction: "added" | "discarded",
  weight: number
): Promise<CardsResponse | null> => {
  try {
    const host = await detectHost();
    const response = await fetch(`${host}/add_interaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardId: cardId,
        userId: userId,
        interaction: interaction,
        weight: weight,
      }),
    });
    const data: CardsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error retrieving content", error);
    return null;
  }
};

// Endpoint /get_interactions
export const getInteractions = async (
  userId: string
): Promise<Interaction[] | null> => {
  try {
    const host = await detectHost();
    const response = await fetch(`${host}/get_interactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
      }),
    });
    const data: Interaction[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error retrieving content", error);
    return null;
  }
};

// Endpoint /delete_all_interactions
export const deleteAllInteractions = async (userId: string): Promise<void> => {
  try {
    const host = await detectHost();
    await fetch(`${host}/delete_all_interactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
      }),
    });
  } catch (error) {
    console.error("Error deleting interactions", error);
  }
};

// Endpoint /save_deck
export const saveDeck = async (
  deckString: string,
  userId: string
): Promise<void> => {
  try {
    const host = await detectHost();
    await fetch(`${host}/save_deck`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deck_string: deckString,
        userId: userId,
      }),
    });
  } catch (error) {
    console.error("Error saving deck", error);
  }
};

// Endpoint /get_deck
export const getDeck = async (userId: string): Promise<string | null> => {
  try {
    const host = await detectHost();
    const response = await fetch(`${host}/get_deck`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
      }),
    });
    const data: string = await response.json();
    return data;
  } catch (error) {
    console.error("Error retrieving deck", error);
    return null;
  }
};
