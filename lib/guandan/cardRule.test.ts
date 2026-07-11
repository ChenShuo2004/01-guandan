import assert from "node:assert/strict";
import test from "node:test";
import { detectCardPattern } from "./cardRule.ts";
import type { Card, CardRank, CardSuit } from "./card.ts";

function card(id: string, rank: CardRank, suit: CardSuit = "spade"): Card {
  return {
    id,
    rank,
    suit,
    isJoker: false,
    deckIndex: 1,
  };
}

test("accepts exactly five cards as a straight", () => {
  const pattern = detectCardPattern([3, 4, 5, 6, 7].map((rank) => card(`c-${rank}`, rank as CardRank)));

  assert.equal(pattern.valid, true);
  assert.equal(pattern.type, "straight");
});

test("rejects six or more cards as a straight", () => {
  const pattern = detectCardPattern([3, 4, 5, 6, 7, 8].map((rank) => card(`c-${rank}`, rank as CardRank)));

  assert.equal(pattern.valid, false);
  assert.equal(pattern.type, "invalid");
});
