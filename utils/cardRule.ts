import type { PokerCardData } from "@/types/poker";

export type BasicCardPattern = "single" | "pair" | "triple" | "straight" | "bomb" | "unknown";

export function getBasicCardPattern(cards: PokerCardData[]): BasicCardPattern {
  if (cards.length === 1) return "single";
  if (cards.length === 2 && cards[0]?.rank === cards[1]?.rank) return "pair";
  if (cards.length === 3 && cards.every((card) => card.rank === cards[0]?.rank)) return "triple";
  if (cards.length >= 4 && cards.every((card) => card.rank === cards[0]?.rank)) return "bomb";
  return "unknown";
}
