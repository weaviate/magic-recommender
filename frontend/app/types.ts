export type CardsResponse = {
  cards: CardType[];
  total: number;
};

export type CardType = {
  card_id: string;
  oracle_id: string;
  name: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  image_uri: string;
  type_line: string;
  oracle_text: string;
  colors: string[];
  color_identity: string[];
  keywords: string[];
  produced_mana: string[];
  set_name: string;
  rarity: string;
  power: string;
  toughness: string;
  mana_cost: string;
  loyalty: string;
  defense: string;
  life_modifier: string;
  hand_modifier: string;
  edhrec_rank: number;
  cmc: number;
};

export const PlaceholderCard: CardType = {
  card_id: "",
  oracle_id: "",
  name: "",
  released_at: "",
  uri: "",
  scryfall_uri: "",
  image_uri: "",
  type_line: "",
  oracle_text: "",
  colors: [],
  color_identity: [],
  keywords: [],
  produced_mana: [],
  set_name: "",
  rarity: "",
  power: "",
  toughness: "",
  mana_cost: "",
  loyalty: "",
  defense: "",
  life_modifier: "",
  hand_modifier: "",
  edhrec_rank: 0,
  cmc: 0,
};

export type Interaction = {
  item_id: string;
  name: string;
  image_uri: string;
  interaction_property_name: "added" | "discarded";
  weight: number;
};
