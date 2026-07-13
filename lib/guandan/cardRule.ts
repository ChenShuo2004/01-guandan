import { type Card, type CardRank, getRankCounts, sortCardsAscending } from "./card.ts";

export type CardPatternType =
  | "single"
  | "pair"
  | "triple"
  | "tripleWithPair"
  | "straight"
  | "bomb"
  | "fourJokers"
  | "invalid";

export interface CardPattern {
  valid: boolean;
  type: CardPatternType;
  power: number;
  cards: Card[];
  message?: string;
}

export function detectCardPattern(cards: Card[], levelRank: CardRank = 15): CardPattern {
  const sortedCards = sortCardsAscending(cards);
  const rankCounts = getRankCounts(sortedCards);
  const countGroups = [...rankCounts.values()].map((group) => group.length).sort((a, b) => b - a);
  const ranks = [...rankCounts.keys()].sort((a, b) => a - b);
  const highestRank = ranks[ranks.length - 1];
  const highestPower = highestRank ? getGuandanRankPower(highestRank, levelRank) : 0;

  if (cards.length === 0) {
    return invalid(cards, "请选择要出的牌");
  }

  if (cards.length === 1) {
    return valid("single", highestPower, sortedCards);
  }

  if (cards.length === 2 && rankCounts.size === 1) {
    return valid("pair", highestPower, sortedCards);
  }

  if (cards.length === 3 && rankCounts.size === 1) {
    return valid("triple", highestPower, sortedCards);
  }

  if (isFourJokers(sortedCards)) {
    return valid("fourJokers", 2000, sortedCards);
  }

  if (cards.length >= 4 && rankCounts.size === 1) {
    return valid("bomb", 500 + cards.length * 100 + highestPower, sortedCards);
  }

  if (cards.length === 5 && countGroups[0] === 3 && countGroups[1] === 2) {
    const tripleRank = [...rankCounts.entries()].find(([, group]) => group.length === 3)?.[0];
    return valid("tripleWithPair", tripleRank ? getGuandanRankPower(tripleRank, levelRank) : highestPower, sortedCards);
  }

  if (cards.length === 5 && isStraightRanks(ranks) && rankCounts.size === cards.length) {
    return valid("straight", highestPower, sortedCards);
  }

  return invalid(cards, "当前阶段暂不支持这个牌型");
}

function isFourJokers(cards: Card[]) {
  return cards.length === 4 && cards.every((card) => card.isJoker);
}

function isStraightRanks(ranks: CardRank[]) {
  if (ranks.length !== 5) return false;
  if (ranks.some((rank) => rank >= 15)) return false;

  return ranks.every((rank, index) => index === 0 || rank === ranks[index - 1] + 1);
}

export function getGuandanRankPower(rank: CardRank, levelRank: CardRank = 15): number {
  if (rank === 17) return 170;
  if (rank === 16) return 160;
  if (rank === 15) return 150;
  if (rank === levelRank) return 145;
  if (rank === 14) return 140;
  return rank * 10;
}

function valid(type: CardPatternType, power: number, cards: Card[]): CardPattern {
  return {
    valid: true,
    type,
    power,
    cards
  };
}

function invalid(cards: Card[], message: string): CardPattern {
  return {
    valid: false,
    type: "invalid",
    power: 0,
    cards,
    message
  };
}
