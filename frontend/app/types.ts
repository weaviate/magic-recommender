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

export type Interaction = {
  item_id: string;
  name: string;
  image_uri: string;
  interaction_property_name: "added" | "discarded";
  weight: number;
};
