import type { Card, CardRank, CardSuit } from "../lib/guandan/card";

export type CardGroupType =
  | "fourJokers"
  | "straightFlush"
  | "bomb"
  | "steel"
  | "plane"
  | "straight"
  | "tripleWithPair"
  | "triple"
  | "pair"
  | "single";

export type CardGroupZone = "left" | "middle" | "right";

export interface CardGroup {
  type: CardGroupType;
  zone: CardGroupZone;
  cards: Card[];
  power: number;
  bombSize?: number;
}

const suitPower: Record<CardSuit | "joker", number> = {
  spade: 4,
  heart: 3,
  club: 2,
  diamond: 1,
  joker: 5
};

const leftTypePower: Record<CardGroupType, number> = {
  straightFlush: 400,
  bomb: 300,
  fourJokers: 300,
  steel: 0,
  plane: 0,
  straight: 0,
  tripleWithPair: 0,
  triple: 0,
  pair: 0,
  single: 0
};

const middleTypePower: Record<CardGroupType, number> = {
  triple: 300,
  pair: 200,
  single: 100,
  fourJokers: 0,
  straightFlush: 0,
  bomb: 0,
  steel: 0,
  plane: 0,
  straight: 0,
  tripleWithPair: 0
};

const rightTypePower: Record<CardGroupType, number> = {
  plane: 500,
  steel: 400,
  straight: 300,
  tripleWithPair: 200,
  fourJokers: 0,
  straightFlush: 0,
  bomb: 0,
  triple: 0,
  pair: 0,
  single: 0
};

export function arrangeCards(cards: Card[], levelRank: CardRank): Card[] {
  const groups = arrangeCardGroups(cards, levelRank);
  const arranged = groups.flatMap((group) => group.cards);
  validateArrangement(cards, arranged, groups, levelRank);
  return arranged;
}

export function arrangeCardGroups(cards: Card[], levelRank: CardRank): CardGroup[] {
  const groups = detectGroups(cards, levelRank);

  return [
    ...sortLeft(groups.filter((group) => group.zone === "left")),
    ...sortMiddle(groups.filter((group) => group.zone === "middle")),
    ...sortRight(groups.filter((group) => group.zone === "right"))
  ];
}

export function restoreCards(cards: Card[], originalOrder: string[]): Card[] {
  const byId = new Map(cards.map((card) => [card.id, card]));
  const currentIds = cards.map((card) => card.id);
  const snapshotIds = [...originalOrder];
  const currentSet = new Set(currentIds);
  const snapshotSet = new Set(snapshotIds);

  if (
    currentIds.length !== snapshotIds.length ||
    currentSet.size !== currentIds.length ||
    snapshotSet.size !== snapshotIds.length ||
    currentSet.size !== snapshotSet.size ||
    [...currentSet].some((id) => !snapshotSet.has(id))
  ) {
    reportArrangeError("恢复快照与当前手牌实体集合不一致", {
      currentIds,
      originalOrder
    });
    return [...cards];
  }

  const restoredIds = new Set<string>();
  const restored = originalOrder
    .map((id) => byId.get(id))
    .filter((card): card is Card => {
      if (!card || restoredIds.has(card.id)) return false;
      restoredIds.add(card.id);
      return true;
    });

  const newCards = cards.filter((card) => !restoredIds.has(card.id));
  return [...restored, ...newCards];
}

export function detectGroups(cards: Card[], _levelRank: CardRank): CardGroup[] {
  const remaining = [...cards];
  const groups: CardGroup[] = [];

  extractFourJokers(remaining, groups);
  extractStraightFlushes(remaining, groups);
  extractBombsByMinimumSize(remaining, groups, 6);
  extractBombsByMinimumSize(remaining, groups, 5);
  extractBombsByMinimumSize(remaining, groups, 4);
  extractSteel(remaining, groups);
  extractPlane(remaining, groups);
  extractStraights(remaining, groups);
  extractTripleWithPairs(remaining, groups);
  extractTriples(remaining, groups);
  extractPairs(remaining, groups);
  extractSingles(remaining, groups);

  return groups;
}

export function sortLeft(groups: CardGroup[]): CardGroup[] {
  return [...groups].sort((a, b) => {
    const typeDelta = leftTypePower[b.type] - leftTypePower[a.type];
    if (typeDelta !== 0) return typeDelta;
    const sizeDelta = (b.bombSize ?? b.cards.length) - (a.bombSize ?? a.cards.length);
    if (sizeDelta !== 0) return sizeDelta;
    const powerDelta = b.power - a.power;
    if (powerDelta !== 0) return powerDelta;
    return maxSuitPower(b.cards) - maxSuitPower(a.cards) || compareGroupsStable(a, b);
  });
}

export function sortMiddle(groups: CardGroup[]): CardGroup[] {
  return [...groups].sort((a, b) => {
    const aIsSimple = a.type === "pair" || a.type === "single";
    const bIsSimple = b.type === "pair" || b.type === "single";

    if (aIsSimple && bIsSimple) {
      return compareGroupsByPower(a, b) || compareSimpleGroupType(a, b) || compareGroupsStable(a, b);
    }

    if (aIsSimple !== bIsSimple) return aIsSimple ? -1 : 1;

    const typeDelta = (middleTypePower[b.type] ?? 0) - (middleTypePower[a.type] ?? 0);
    return typeDelta || compareGroupsByPower(a, b) || compareGroupsStable(a, b);
  });
}

export function sortRight(groups: CardGroup[]): CardGroup[] {
  return [...groups].sort((a, b) => {
    const typeDelta = rightTypePower[b.type] - rightTypePower[a.type];
    if (typeDelta !== 0) return typeDelta;
    return b.power - a.power || b.cards.length - a.cards.length || compareGroupsStable(a, b);
  });
}

function extractFourJokers(remaining: Card[], groups: CardGroup[]) {
  const jokers = remaining.filter((card) => card.isJoker);
  if (jokers.length < 4) return;

  const cards = sortByRankSuit(jokers).slice(0, 4);
  removeCards(remaining, cards);
  groups.push({ type: "fourJokers", zone: "left", cards, power: 1000, bombSize: 4 });
}

function extractBombsByMinimumSize(remaining: Card[], groups: CardGroup[], minimumSize: number) {
  const bombs = [...groupByRank(remaining).entries()]
    .filter(([rank, rankCards]) => !isJokerRank(rank) && rankCards.length >= minimumSize)
    .sort(([rankA, cardsA], [rankB, cardsB]) => cardsB.length - cardsA.length || rankB - rankA);

  for (const [rank, rankCards] of bombs) {
    const cards = sortByRankSuit(rankCards);
    removeCards(remaining, cards);
    groups.push({ type: "bomb", zone: "left", cards, power: rank, bombSize: cards.length });
  }
}

function extractStraightFlushes(remaining: Card[], groups: CardGroup[]) {
  for (const suit of ["spade", "heart", "club", "diamond"] as CardSuit[]) {
    let found = true;

    while (found) {
      found = false;
      const suited = remaining.filter((card) => card.suit === suit && isStraightRank(card.rank));
      const run = findBestRankRun(suited, 5);
      if (run.length < 5) continue;

      const cards = run.map((rank) => firstCardByRank(suited, rank)).filter((card): card is Card => Boolean(card));
      removeCards(remaining, cards);
      groups.push({ type: "straightFlush", zone: "left", cards: sortRunCards(cards), power: highRank(cards) });
      found = true;
    }
  }
}

function extractSteel(remaining: Card[], groups: CardGroup[]) {
  let found = true;

  while (found) {
    found = false;
    const tripleRanks = getTripleRanks(remaining);
    const runs = getConsecutiveRuns(tripleRanks).filter((run) => run.length === 2);
    const run = runs.sort((a, b) => b[b.length - 1] - a[a.length - 1])[0];
    if (!run) return;

    const cards = run.flatMap((rank) => sortByRankSuit(remaining.filter((card) => card.rank === rank)).slice(0, 3));
    removeCards(remaining, cards);
    groups.push({ type: "steel", zone: "right", cards: sortRunCards(cards), power: highRank(cards) });
    found = true;
  }
}

function extractPlane(remaining: Card[], groups: CardGroup[]) {
  let found = true;

  while (found) {
    found = false;
    const tripleRanks = getTripleRanks(remaining);
    const run = getConsecutiveRuns(tripleRanks)
      .filter((candidate) => candidate.length >= 3)
      .sort((a, b) => b.length - a.length || b[b.length - 1] - a[a.length - 1])[0];
    if (!run) return;

    const cards = run.flatMap((rank) => sortByRankSuit(remaining.filter((card) => card.rank === rank)).slice(0, 3));
    removeCards(remaining, cards);
    groups.push({ type: "plane", zone: "right", cards: sortRunCards(cards), power: highRank(cards) });
    found = true;
  }
}

function extractStraights(remaining: Card[], groups: CardGroup[]) {
  let found = true;

  while (found) {
    found = false;
    const run = findBestRankRun(remaining.filter((card) => isStraightRank(card.rank)), 5);
    if (run.length < 5) return;

    const cards = run.map((rank) => firstCardByRank(remaining, rank)).filter((card): card is Card => Boolean(card));
    removeCards(remaining, cards);
    groups.push({ type: "straight", zone: "right", cards: sortRunCards(cards), power: highRank(cards) });
    found = true;
  }
}

function extractTripleWithPairs(remaining: Card[], groups: CardGroup[]) {
  let found = true;

  while (found) {
    found = false;
    const triple = [...groupByRank(remaining).entries()]
      .filter(([rank, rankCards]) => !isJokerRank(rank) && rankCards.length >= 3)
      .sort(([rankA], [rankB]) => rankB - rankA)[0];
    if (!triple) return;

    const pair = [...groupByRank(remaining).entries()]
      .filter(([rank, rankCards]) => rank !== triple[0] && rankCards.length >= 2)
      .sort(([rankA], [rankB]) => rankB - rankA)[0];
    if (!pair) return;

    const cards = [
      ...sortByRankSuit(triple[1]).slice(0, 3),
      ...sortByRankSuit(pair[1]).slice(0, 2)
    ];
    removeCards(remaining, cards);
    groups.push({ type: "tripleWithPair", zone: "middle", cards, power: triple[0] });
    found = true;
  }
}

function extractTriples(remaining: Card[], groups: CardGroup[]) {
  const triples = [...groupByRank(remaining).entries()]
    .filter(([, rankCards]) => rankCards.length >= 3)
    .sort(([rankA], [rankB]) => rankB - rankA);

  for (const [rank, rankCards] of triples) {
    const cards = sortByRankSuit(rankCards).slice(0, 3);
    removeCards(remaining, cards);
    groups.push({ type: "pair", zone: "middle", cards: cards.slice(0, 2), power: rank });
    groups.push({ type: "single", zone: "middle", cards: cards.slice(2), power: rank });
  }
}

function extractPairs(remaining: Card[], groups: CardGroup[]) {
  const pairs = [...groupByRank(remaining).entries()]
    .filter(([, rankCards]) => rankCards.length >= 2)
    .sort(([rankA], [rankB]) => rankB - rankA);

  for (const [rank, rankCards] of pairs) {
    const cards = sortByRankSuit(rankCards).slice(0, 2);
    removeCards(remaining, cards);
    groups.push({ type: "pair", zone: "middle", cards, power: rank });
  }
}

function extractSingles(remaining: Card[], groups: CardGroup[]) {
  for (const card of sortByRankSuit(remaining)) {
    groups.push({ type: "single", zone: "middle", cards: [card], power: card.rank });
  }
  remaining.splice(0, remaining.length);
}

function groupByRank(cards: Card[]) {
  return cards.reduce<Map<CardRank, Card[]>>((groups, card) => {
    groups.set(card.rank, [...(groups.get(card.rank) ?? []), card]);
    return groups;
  }, new Map<CardRank, Card[]>());
}

function getTripleRanks(cards: Card[]) {
  return [...groupByRank(cards).entries()]
    .filter(([rank, rankCards]) => isStraightRank(rank) && rankCards.length >= 3)
    .map(([rank]) => rank)
    .sort((a, b) => a - b);
}

function getConsecutiveRuns(ranks: CardRank[]) {
  const runs: CardRank[][] = [];
  let current: CardRank[] = [];

  for (const rank of ranks) {
    const previous = current[current.length - 1];
    if (!previous || rank === previous + 1) {
      current.push(rank);
    } else {
      if (current.length >= 2) runs.push(current);
      current = [rank];
    }
  }

  if (current.length >= 2) runs.push(current);
  return runs;
}

function findBestRankRun(cards: Card[], minLength: number) {
  const ranks = [...new Set(cards.map((card) => card.rank))]
    .filter(isStraightRank)
    .sort((a, b) => a - b);
  const runs = getConsecutiveRuns(ranks).filter((run) => run.length >= minLength);
  const run = runs.sort((a, b) => b.length - a.length || b[b.length - 1] - a[a.length - 1])[0] ?? [];
  return run.slice(-minLength);
}

function firstCardByRank(cards: Card[], rank: CardRank) {
  return sortByRankSuit(cards.filter((card) => card.rank === rank))[0];
}

function sortRunCards(cards: Card[]) {
  return [...cards].sort(compareCardsDesc);
}

function sortByRankSuit(cards: Card[]) {
  return [...cards].sort(compareCardsDesc);
}

function removeCards(remaining: Card[], cards: Card[]) {
  const ids = new Set(cards.map((card) => card.id));

  for (let index = remaining.length - 1; index >= 0; index -= 1) {
    if (ids.has(remaining[index].id)) {
      remaining.splice(index, 1);
    }
  }
}

function highRank(cards: Card[]) {
  return Math.max(...cards.map((card) => card.rank));
}

function maxSuitPower(cards: Card[]) {
  return Math.max(...cards.map((card) => suitPower[card.suit]));
}

function isStraightRank(rank: CardRank): boolean {
  return rank < 15;
}

function isJokerRank(rank: CardRank): boolean {
  return rank >= 16;
}

function compareCardsDesc(a: Card, b: Card) {
  return b.rank - a.rank || suitPower[b.suit] - suitPower[a.suit] || a.deckIndex - b.deckIndex || compareCardIds(a.id, b.id);
}

function compareCardIds(a: string, b: string) {
  return a === b ? 0 : a < b ? -1 : 1;
}

function compareGroupsByPower(a: CardGroup, b: CardGroup) {
  return b.power - a.power || maxSuitPower(b.cards) - maxSuitPower(a.cards);
}

function compareSimpleGroupType(a: CardGroup, b: CardGroup) {
  if (a.type === b.type) return 0;
  return a.type === "pair" ? -1 : 1;
}

function compareGroupsStable(a: CardGroup, b: CardGroup) {
  const aId = a.cards.map((card) => card.id).sort(compareCardIds).join("|");
  const bId = b.cards.map((card) => card.id).sort(compareCardIds).join("|");
  return compareCardIds(aId, bId);
}

function validateArrangement(cards: Card[], arranged: Card[], groups: CardGroup[], levelRank: CardRank) {
  const originalIds = cards.map((card) => card.id);
  const arrangedIds = arranged.map((card) => card.id);
  const originalSet = new Set(originalIds);
  const arrangedSet = new Set(arrangedIds);
  const duplicateIds = arrangedIds.filter((id, index) => arrangedIds.indexOf(id) !== index);
  const missingIds = originalIds.filter((id) => !arrangedSet.has(id));
  const unusedIds = arrangedIds.filter((id) => !originalSet.has(id));
  const sameCardSet =
    originalIds.length === arrangedIds.length &&
    originalSet.size === originalIds.length &&
    arrangedSet.size === arrangedIds.length &&
    missingIds.length === 0 &&
    unusedIds.length === 0;

  if (!sameCardSet || duplicateIds.length > 0) {
    reportArrangeError("理牌结果实体牌校验失败", {
      originalCount: cards.length,
      arrangedCount: arranged.length,
      originalIds,
      arrangedIds,
      groups: groups.map((group) => ({
        type: group.type,
        cardIds: group.cards.map((card) => card.id)
      })),
      duplicateIds,
      unusedIds,
      missingIds,
      levelRank
    });
  }
}

function reportArrangeError(message: string, details: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[arrange-hand] ${message}`, details);
  }
}
