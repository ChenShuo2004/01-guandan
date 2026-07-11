import type { Card, CardRank, CardSuit } from "@/lib/guandan/card";
import { getCardLabel, sortCards } from "@/lib/guandan/card";

type SmartGroupType =
  | "fourJokers"
  | "straightFlush"
  | "bomb"
  | "steelPlate"
  | "tripleWithPair"
  | "straight"
  | "pair"
  | "level"
  | "single";

interface SmartGroup {
  cards: Card[];
  power: number;
  type: SmartGroupType;
}

const suitOrder: Record<CardSuit | "joker", number> = {
  spade: 4,
  heart: 3,
  club: 2,
  diamond: 1,
  joker: 5
};

const groupOrder: Record<SmartGroupType, number> = {
  fourJokers: 0,
  straightFlush: 1,
  bomb: 2,
  steelPlate: 3,
  tripleWithPair: 4,
  straight: 5,
  pair: 6,
  level: 7,
  single: 8
};

export function smartSortCardsForGuandan(cards: Card[], levelRank: string) {
  const remaining = [...cards];
  const groups: SmartGroup[] = [];

  extractFourJokers(remaining, groups);
  extractStraightFlushes(remaining, groups);
  extractBombs(remaining, groups);
  extractSteelPlates(remaining, groups);
  extractTripleWithPairs(remaining, groups);
  extractStraights(remaining, groups);
  extractPairs(remaining, groups);
  extractLevelCards(remaining, groups, levelRank);
  extractSingles(remaining, groups);

  return groups
    .sort((a, b) => {
      const typeDelta = groupOrder[a.type] - groupOrder[b.type];
      if (typeDelta !== 0) return typeDelta;
      return b.power - a.power;
    })
    .flatMap((group) => group.cards);
}

function extractFourJokers(remaining: Card[], groups: SmartGroup[]) {
  const jokers = remaining.filter((card) => card.isJoker);
  if (jokers.length < 4) return;

  const cards = sortCards(jokers).slice(0, 4);
  removeCards(remaining, cards);
  groups.push({ cards, power: 1000, type: "fourJokers" });
}

function extractStraightFlushes(remaining: Card[], groups: SmartGroup[]) {
  for (const suit of ["spade", "heart", "club", "diamond"] as CardSuit[]) {
    const suited = remaining.filter((card) => card.suit === suit && card.rank < 15);
    const runs = findRunsByRank(suited);

    for (const run of runs) {
      if (run.length < 5) continue;
      const cards = takeBestFiveRunCards(run, suited);
      removeCards(remaining, cards);
      groups.push({
        cards,
        power: Math.max(...cards.map((card) => card.rank)),
        type: "straightFlush"
      });
    }
  }
}

function extractBombs(remaining: Card[], groups: SmartGroup[]) {
  const byRank = groupByRank(remaining);
  const bombs = [...byRank.entries()]
    .filter(([, cards]) => cards.length >= 4)
    .sort(([rankA, cardsA], [rankB, cardsB]) => cardsB.length - cardsA.length || rankB - rankA);

  for (const [rank, cards] of bombs) {
    const bombCards = sortByRankSuit(cards);
    removeCards(remaining, bombCards);
    groups.push({ cards: bombCards, power: rank + bombCards.length * 20, type: "bomb" });
  }
}

function extractSteelPlates(remaining: Card[], groups: SmartGroup[]) {
  let found = true;

  while (found) {
    found = false;
    const triples = [...groupByRank(remaining).entries()]
      .filter(([rank, cards]) => rank < 15 && cards.length >= 3)
      .sort(([rankA], [rankB]) => rankA - rankB);

    for (let index = triples.length - 1; index > 0; index -= 1) {
      const [highRank, highCards] = triples[index];
      const [lowRank, lowCards] = triples[index - 1];
      if (highRank !== lowRank + 1) continue;

      const cards = [...sortByRankSuit(highCards).slice(0, 3), ...sortByRankSuit(lowCards).slice(0, 3)];
      removeCards(remaining, cards);
      groups.push({ cards, power: highRank, type: "steelPlate" });
      found = true;
      break;
    }
  }
}

function extractTripleWithPairs(remaining: Card[], groups: SmartGroup[]) {
  let found = true;

  while (found) {
    found = false;
    const triples = [...groupByRank(remaining).entries()]
      .filter(([, cards]) => cards.length >= 3)
      .sort(([rankA], [rankB]) => rankB - rankA);
    const pairs = [...groupByRank(remaining).entries()]
      .filter(([, cards]) => cards.length >= 2)
      .sort(([rankA], [rankB]) => rankB - rankA);

    for (const [tripleRank, tripleCards] of triples) {
      const pair = pairs.find(([pairRank]) => pairRank !== tripleRank);
      if (!pair) continue;

      const cards = [
        ...sortByRankSuit(tripleCards).slice(0, 3),
        ...sortByRankSuit(pair[1]).slice(0, 2)
      ];
      removeCards(remaining, cards);
      groups.push({ cards, power: tripleRank, type: "tripleWithPair" });
      found = true;
      break;
    }
  }
}

function extractStraights(remaining: Card[], groups: SmartGroup[]) {
  const runs = findRunsByRank(remaining.filter((card) => !card.isJoker && card.rank < 15));

  for (const run of runs) {
    if (run.length < 5) continue;
    const cards = takeBestFiveRunCards(run, remaining);
    removeCards(remaining, cards);
    groups.push({
      cards,
      power: Math.max(...cards.map((card) => card.rank)),
      type: "straight"
    });
  }
}

function extractPairs(remaining: Card[], groups: SmartGroup[]) {
  const pairs = [...groupByRank(remaining).entries()]
    .filter(([, cards]) => cards.length >= 2)
    .sort(([rankA], [rankB]) => rankB - rankA);

  for (const [rank, cards] of pairs) {
    const pairCards = sortByRankSuit(cards).slice(0, 2);
    removeCards(remaining, pairCards);
    groups.push({ cards: pairCards, power: rank, type: "pair" });
  }
}

function extractLevelCards(remaining: Card[], groups: SmartGroup[], levelRank: string) {
  const cards = remaining.filter((card) => getCardLabel(card) === levelRank);
  if (cards.length === 0) return;

  const levelCards = sortByRankSuit(cards);
  removeCards(remaining, levelCards);
  groups.push({ cards: levelCards, power: 900, type: "level" });
}

function extractSingles(remaining: Card[], groups: SmartGroup[]) {
  for (const card of sortByRankSuit(remaining)) {
    groups.push({ cards: [card], power: card.rank, type: "single" });
  }
  remaining.splice(0, remaining.length);
}

function findRunsByRank(cards: Card[]) {
  const uniqueRanks = [...new Set(cards.map((card) => card.rank))]
    .filter((rank) => rank < 15)
    .sort((a, b) => a - b);
  const runs: CardRank[][] = [];
  let current: CardRank[] = [];

  for (const rank of uniqueRanks) {
    const previous = current[current.length - 1];
    if (!previous || rank === previous + 1) {
      current.push(rank);
    } else {
      if (current.length >= 5) runs.push(current);
      current = [rank];
    }
  }

  if (current.length >= 5) runs.push(current);
  return runs.sort((a, b) => b[b.length - 1] - a[a.length - 1]);
}

function takeBestFiveRunCards(ranks: CardRank[], cards: Card[]) {
  return ranks
    .slice(-5)
    .map((rank) => sortByRankSuit(cards.filter((card) => card.rank === rank))[0])
    .filter((card): card is Card => Boolean(card));
}

function groupByRank(cards: Card[]) {
  return cards.reduce<Map<CardRank, Card[]>>((groups, card) => {
    groups.set(card.rank, [...(groups.get(card.rank) ?? []), card]);
    return groups;
  }, new Map<CardRank, Card[]>());
}

function sortByRankSuit(cards: Card[]) {
  return [...cards].sort((a, b) => {
    if (a.rank !== b.rank) return b.rank - a.rank;
    return (suitOrder[b.suit] ?? 0) - (suitOrder[a.suit] ?? 0);
  });
}

function removeCards(remaining: Card[], cards: Card[]) {
  const ids = new Set(cards.map((card) => card.id));

  for (let index = remaining.length - 1; index >= 0; index -= 1) {
    if (ids.has(remaining[index].id)) {
      remaining.splice(index, 1);
    }
  }
}
