import assert from "node:assert/strict";
import test from "node:test";
import { canBeatLastPlay } from "./cardCompare.ts";
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

test("level rank beats ace but not two in single comparison", () => {
  assert.equal(canBeatLastPlay([card("level-10", 10)], [card("ace", 14)], 10).canPlay, true);
  assert.equal(canBeatLastPlay([card("level-10", 10)], [card("two", 15)], 10).canPlay, false);
});

test("level rank power is used for pairs, triples and bombs", () => {
  assert.equal(
    canBeatLastPlay(
      [card("level-1", 9), card("level-2", 9)],
      [card("ace-1", 14), card("ace-2", 14)],
      9
    ).canPlay,
    true
  );

  assert.equal(
    canBeatLastPlay(
      [card("level-bomb-1", 9), card("level-bomb-2", 9), card("level-bomb-3", 9), card("level-bomb-4", 9)],
      [card("ace-bomb-1", 14), card("ace-bomb-2", 14), card("ace-bomb-3", 14), card("ace-bomb-4", 14)],
      9
    ).canPlay,
    true
  );
});
