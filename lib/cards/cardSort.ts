import type { Card, CardRank } from "@/lib/guandan/card";
import { getCardSortValue } from "@/lib/guandan/card";

export type CardGroupType = "bomb" | "pair" | "triple" | "straight" | "single";

export interface CardHandGroup {
  id: string;
  type: CardGroupType;
  label: string;
  power: number;
  cards: Card[];
}

const suitPriority: Record<string, number> = {
  diamond: 0,
  club: 1,
  heart: 2,
  spade: 3,
  joker: 4
};

const groupPriority: Record<CardGroupType, number> = {
  bomb: 0,
  pair: 1,
  triple: 2,
  straight: 3,
  single: 4
};

export function sortCardsForHand(cards: Card[]) {
  return groupCardsForHand(cards).flatMap((group) => group.cards);
}

export function groupCardsForHand(cards: Card[]): CardHandGroup[] {
  const remaining = [...cards];
  const groups: CardHandGroup[] = [];

  for (const group of extractSameRankGroups(remaining, "bomb")) {
    groups.push(group);
    removeCards(remaining, group.cards);
  }

  for (const group of extractSameRankGroups(remaining, "pair")) {
    groups.push(group);
    removeCards(remaining, group.cards);
  }

  for (const group of extractSameRankGroups(remaining, "triple")) {
    groups.push(group);
    removeCards(remaining, group.cards);
  }

  for (const group of extractStraightGroups(remaining)) {
    groups.push(group);
    removeCards(remaining, group.cards);
  }

  for (const card of sortByRankAndSuit(remaining)) {
    groups.push({
      id: `single-${card.id}`,
      type: "single",
      label: "单牌",
      power: card.rank,
      cards: [card]
    });
  }

  return groups.sort((a, b) => {
    const priorityDelta = groupPriority[a.type] - groupPriority[b.type];
    if (priorityDelta !== 0) return priorityDelta;
    return b.power - a.power;
  });
}

function extractSameRankGroups(cards: Card[], type: "bomb" | "pair" | "triple"): CardHandGroup[] {
  const byRank = new Map<CardRank, Card[]>();

  for (const card of cards) {
    byRank.set(card.rank, [...(byRank.get(card.rank) ?? []), card]);
  }

  return [...byRank.entries()]
    .map<CardHandGroup | null>(([rank, rankCards]) => {
      const sorted = sortByRankAndSuit(rankCards);
      if (type === "bomb" && sorted.length >= 4) {
        return {
          id: `bomb-${rank}`,
          type,
          label: `${rankLabel(rank)}炸`,
          power: rank,
          cards: sorted
        };
      }

      if (type === "triple" && sorted.length === 3) {
        return {
          id: `triple-${rank}`,
          type,
          label: `${rankLabel(rank)}三张`,
          power: rank,
          cards: sorted
        };
      }

      if (type === "pair" && sorted.length === 2) {
        return {
          id: `pair-${rank}`,
          type,
          label: `${rankLabel(rank)}对子`,
          power: rank,
          cards: sorted
        };
      }

      return null;
    })
    .filter((group): group is CardHandGroup => Boolean(group))
    .sort((a, b) => b.power - a.power);
}

function extractStraightGroups(cards: Card[]) {
  const normalSingles = sortByRankAndSuit(cards)
    .filter((card) => !card.isJoker && card.rank < 15)
    .filter((card, index, array) => array.findIndex((item) => item.rank === card.rank) === index)
    .sort((a, b) => a.rank - b.rank);
  const groups: CardHandGroup[] = [];
  let run: Card[] = [];

  for (const card of normalSingles) {
    const previous = run[run.length - 1];

    if (!previous || card.rank === previous.rank + 1) {
      run.push(card);
    } else {
      pushStraight(run, groups);
      run = [card];
    }
  }

  pushStraight(run, groups);
  return groups.sort((a, b) => b.power - a.power);
}

function pushStraight(run: Card[], groups: CardHandGroup[]) {
  if (run.length < 5) return;

  const cards = sortByRankAndSuit(run.slice(-5));
  const highRank = Math.max(...cards.map((card) => card.rank));

  groups.push({
    id: `straight-${cards.map((card) => card.id).join("-")}`,
    type: "straight",
    label: "顺子",
    power: highRank,
    cards
  });
}

function sortByRankAndSuit(cards: Card[]) {
  return [...cards].sort((a, b) => {
    if (a.rank !== b.rank) return b.rank - a.rank;
    return (suitPriority[a.suit] ?? getCardSortValue(a)) - (suitPriority[b.suit] ?? getCardSortValue(b));
  });
}

function removeCards(cards: Card[], cardsToRemove: Card[]) {
  const ids = new Set(cardsToRemove.map((card) => card.id));

  for (let index = cards.length - 1; index >= 0; index -= 1) {
    if (ids.has(cards[index].id)) {
      cards.splice(index, 1);
    }
  }
}

function rankLabel(rank: CardRank) {
  if (rank === 17) return "大王";
  if (rank === 16) return "小王";
  if (rank === 15) return "2";
  if (rank === 14) return "A";
  if (rank === 13) return "K";
  if (rank === 12) return "Q";
  if (rank === 11) return "J";
  return String(rank);
}
