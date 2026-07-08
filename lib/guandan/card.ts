export type CardSuit = "spade" | "heart" | "club" | "diamond";

export type CardRank = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;

export interface Card {
  id: string;
  suit: CardSuit | "joker";
  rank: CardRank;
  isJoker: boolean;
  deckIndex: 1 | 2;
}

export const SUITS: CardSuit[] = ["spade", "heart", "club", "diamond"];

export const NORMAL_RANKS: CardRank[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export function getCardLabel(card: Card) {
  if (card.rank === 16) return "SJ";
  if (card.rank === 17) return "BJ";
  if (card.rank === 14) return "A";
  if (card.rank === 15) return "2";
  if (card.rank === 11) return "J";
  if (card.rank === 12) return "Q";
  if (card.rank === 13) return "K";
  return String(card.rank);
}

export function getCardSortValue(card: Card) {
  return card.rank * 10 + (card.isJoker ? 9 : SUITS.indexOf(card.suit as CardSuit));
}

export function sortCards(cards: Card[]) {
  return [...cards].sort((a, b) => getCardSortValue(b) - getCardSortValue(a));
}

export function sortCardsAscending(cards: Card[]) {
  return [...cards].sort((a, b) => getCardSortValue(a) - getCardSortValue(b));
}

export function getRankCounts(cards: Card[]) {
  return cards.reduce<Map<CardRank, Card[]>>((counts, card) => {
    const current = counts.get(card.rank) ?? [];
    counts.set(card.rank, [...current, card]);
    return counts;
  }, new Map<CardRank, Card[]>());
}
