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
