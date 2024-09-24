import { CardsResponse } from "./types";
import { v5 as uuidv5 } from "uuid";

const NAMESPACE = "10bca8d5-4b85-4a5f-9fb2-5d9c1b9b5e96";

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
  const rootUrl = "/health";

  const isLocalHealthy = await checkUrl(localUrl);
  if (isLocalHealthy) {
    return "http://localhost:8000";
  }

  const isRootHealthy = await checkUrl(rootUrl);
  if (isRootHealthy) {
    const root = window.location.origin;
    return root;
  }

  throw new Error("Both health checks failed, please check the Verba Server");
};

export const getCurrentIPAddress = async (): Promise<string | null> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    const uuid = uuidv5(data.ip, NAMESPACE);
    return uuid;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return null;
  }
};

// Endpoint /api/cards
export const getCards = async (
  page: number,
  pageSize: number,
  userId: string
): Promise<CardsResponse | null> => {
  try {
    const host = await detectHost();
    const response = await fetch(`${host}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page: page,
        pageSize: pageSize,
        userId: userId,
      }),
    });
    const data: CardsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error retrieving content", error);
    return null;
  }
};

// Endpoint /api/random
export const getRandomCards = async (
  pageSize: number,
  userId: string
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
      }),
    });
    const data: CardsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error retrieving content", error);
    return null;
  }
};

// Endpoint /api/card_recommendation
export const getCardRecommendations = async (
  numberOfCards: number,
  cardIds: string[],
  userId: string
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
      }),
    });
    const data: CardsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error retrieving content", error);
    return null;
  }
};

// Endpoint /api/user_recommendation
export const getUserRecommendations = async (
  numberOfCards: number,
  userId: string
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
      }),
    });
    const data: CardsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error retrieving content", error);
    return null;
  }
};
