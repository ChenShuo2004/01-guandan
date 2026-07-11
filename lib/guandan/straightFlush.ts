import { SUITS, type Card, type CardSuit } from "./card.ts";

const STRAIGHT_FLUSH_RANK_MAX = 14;

export interface StraightFlushSuitStatus {
  suit: CardSuit;
  ranks: number[];
  longestRun: number;
  matched: boolean;
}

export function analyzeStraightFlushSuits(cards: Card[]): StraightFlushSuitStatus[] {
  return SUITS.map((suit) => {
    const ranks: number[] = [...new Set(
      cards
        .filter((card) => !card.isJoker && card.suit === suit && card.rank <= STRAIGHT_FLUSH_RANK_MAX)
        .map((card) => card.rank),
    )].sort((left, right) => left - right);

    let longestRun = 0;
    let currentRun = 0;
    for (let rank = 3; rank <= STRAIGHT_FLUSH_RANK_MAX; rank += 1) {
      currentRun = ranks.includes(rank as Card["rank"]) ? currentRun + 1 : 0;
      longestRun = Math.max(longestRun, currentRun);
    }

    return { suit, ranks, longestRun, matched: longestRun >= 5 };
  });
}

export function detectStraightFlushSuits(cards: Card[]): CardSuit[] {
  return analyzeStraightFlushSuits(cards)
    .filter((status) => status.matched)
    .map((status) => status.suit);
}
