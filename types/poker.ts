export type PokerSuit = "spade" | "heart" | "club" | "diamond";

export type PokerRank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A"
  | "SJ"
  | "BJ";

export interface PokerCardData {
  id: string;
  suit?: PokerSuit;
  rank: PokerRank;
  isWild?: boolean;
}

export type CardType = "normal" | "joker" | "levelCard";
export type CardVariant = "hand" | "played" | "counter" | "levelBadge";
export type CardSize = "sm" | "md" | "lg" | "joker" | "hero";

export interface CardTypeState {
  type: CardType;
  variant: CardVariant;
  size: CardSize;
  selected?: boolean;
  disabled?: boolean;
}
