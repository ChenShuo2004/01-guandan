import assert from "node:assert/strict";
import test from "node:test";
import { arrangeCardGroups, arrangeCards, restoreCards } from "./cardArrange.ts";
import type { Card, CardRank, CardSuit } from "../lib/guandan/card.ts";
import { analyzeStraightFlushSuits, detectStraightFlushSuits } from "../lib/guandan/straightFlush.ts";

function card(
  id: string,
  rank: CardRank,
  suit: CardSuit = "spade",
  deckIndex: 1 | 2 = 1
): Card {
  return { id, rank, suit, deckIndex, isJoker: false };
}

function ids(cards: Card[]) {
  return cards.map((item) => item.id);
}

test("detects straight flushes by suit without mixing suits", () => {
  const hand = [
    card("s3", 3, "spade"),
    card("s4", 4, "spade"),
    card("s5", 5, "spade"),
    card("s6", 6, "spade"),
    card("s7", 7, "spade"),
    card("h3", 3, "heart"),
    card("h4", 4, "heart"),
    card("h5", 5, "heart"),
    card("h6", 6, "heart"),
  ];

  assert.deepEqual(detectStraightFlushSuits(hand), ["spade"]);
  assert.equal(analyzeStraightFlushSuits(hand).find((status) => status.suit === "heart")?.longestRun, 4);
});

test("does not treat twos, jokers, or duplicate copies as a straight flush run", () => {
  const hand = [
    card("s10", 10),
    card("sj", 11),
    card("sq", 12),
    card("sk", 13),
    card("s2", 15),
    { ...card("sjoker", 16), suit: "joker" as const, isJoker: true },
    card("s10-copy", 10, "spade", 2),
  ];

  assert.deepEqual(detectStraightFlushSuits(hand), []);
});

test("mixes singles and pairs by rank, not by group size", () => {
  const hand = [
    card("a", 14),
    card("k1", 13, "spade"),
    card("k2", 13, "heart"),
    card("q", 12),
    card("j1", 11, "spade"),
    card("j2", 11, "heart"),
    card("9", 9),
    card("8", 8),
    card("6", 6)
  ];

  assert.deepEqual(ids(arrangeCards(hand, 15)), ["a", "k1", "k2", "q", "j1", "j2", "9", "8", "6"]);
});

test("splits an unused triple deterministically into pair then single", () => {
  const hand = [
    card("k1", 13, "spade"),
    card("k2", 13, "heart"),
    card("k3", 13, "club")
  ];

  const results = Array.from({ length: 10 }, () => ids(arrangeCards(hand, 15)));
  assert.deepEqual(results, Array.from({ length: 10 }, () => ["k1", "k2", "k3"]));
});

test("preserves duplicate rank-and-suit cards by entity id", () => {
  const hand = [card("copy-1", 10, "heart", 1), card("copy-2", 10, "heart", 2)];
  const arranged = arrangeCards(hand, 15);

  assert.equal(new Set(ids(arranged)).size, 2);
  assert.deepEqual(new Set(ids(arranged)), new Set(["copy-1", "copy-2"]));
});

test("protects bombs and straight flushes before ordinary groups", () => {
  const bomb = [
    card("b1", 9, "spade"),
    card("b2", 9, "heart"),
    card("b3", 9, "club"),
    card("b4", 9, "diamond")
  ];
  const straightFlush = [3, 4, 5, 6, 7].map((rank) => card(`s-${rank}`, rank as CardRank, "spade"));
  const groups = arrangeCardGroups([...bomb, ...straightFlush], 15);

  assert.equal(groups[0]?.type, "straightFlush");
  assert.equal(groups[1]?.type, "bomb");
  assert.equal(new Set(groups.flatMap((group) => ids(group.cards))).size, 9);
});

test("caps ordinary straights at exactly five cards", () => {
  const suits: CardSuit[] = ["spade", "heart", "club", "diamond"];
  const longRun = [3, 4, 5, 6, 7, 8, 9, 10].map((rank, index) =>
    card(`s-${rank}`, rank as CardRank, suits[index % suits.length])
  );
  const groups = arrangeCardGroups(longRun, 15);
  const straight = groups.find((group) => group.type === "straight");

  assert.equal(straight?.cards.length, 5);
  assert.deepEqual(straight?.cards.map((item) => item.rank).sort((a, b) => a - b), [6, 7, 8, 9, 10]);
});

test("restores the first entity-id order and rejects a stale snapshot", () => {
  const hand = [card("a", 14), card("k", 13), card("q", 12)];
  const arranged = [hand[2], hand[0], hand[1]];

  assert.deepEqual(ids(restoreCards(arranged, ["a", "k", "q"])), ["a", "k", "q"]);
  assert.deepEqual(ids(restoreCards(arranged, ["a", "k", "new"])), ["q", "a", "k"]);
});

test("repeated arrangement is stable for the same hand", () => {
  const hand = [
    card("6", 6),
    card("a", 14),
    card("k2", 13, "heart", 2),
    card("k1", 13, "spade", 1),
    card("q", 12)
  ];

  const first = ids(arrangeCards(hand, 15));
  assert.deepEqual(ids(arrangeCards(hand, 15)), first);
});
