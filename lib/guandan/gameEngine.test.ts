import assert from "node:assert/strict";
import test from "node:test";
import { getGameStateIssues, stabilizeGameState } from "./gameStateGuard.ts";
import { getNextActiveTurn, getRequiredPassCountForTrickReset, getTurnAfterTrickReset } from "./turnManager.ts";
import type { CardRank } from "./card.ts";
import type { GameEngineState } from "./gameState.ts";
import type { PlayerId } from "./player.ts";

function card(id: string, rank: CardRank) {
  return {
    id,
    rank,
    suit: "spade" as const,
    isJoker: false,
    deckIndex: 1 as const
  };
}

function player(id: PlayerId, hand: ReturnType<typeof card>[]) {
  return {
    id,
    name: id,
    role: id,
    seat: "bottom",
    hand,
    passed: false
  };
}

test("skips a finished player when a trick resets", () => {
  const state = {
    players: [
      { id: "player", hand: [], finishOrder: [] },
      { id: "enemyAI1", hand: [card("enemy-1", 4)], finishOrder: [] },
      { id: "partnerAI", hand: [card("partner", 5)], finishOrder: [] },
      { id: "enemyAI2", hand: [card("enemy-2", 6)], finishOrder: [] }
    ],
    currentTurn: 3,
    lastPlayerId: "player" as const,
    finishOrder: ["player" as const],
  } as unknown as GameEngineState;

  assert.equal(getTurnAfterTrickReset(state), 1);
});

test("advances to the next active player after a player finishes by playing cards", () => {
  const state = {
    players: [
      player("player", []),
      player("enemyAI1", [card("enemy-4", 4)]),
      player("partnerAI", [card("partner-5", 5)]),
      player("enemyAI2", [card("enemy-6", 6)])
    ],
    currentTurn: 0,
    finishOrder: [],
  } as unknown as GameEngineState;

  assert.equal(getNextActiveTurn({ ...state, finishOrder: ["player"] }), 1);
});

test("requires every active non-leading player to pass when the leading player has finished", () => {
  const state = {
    players: [
      player("player", []),
      player("enemyAI1", [card("enemy-4", 4)]),
      player("partnerAI", [card("partner-5", 5)]),
      player("enemyAI2", [card("enemy-6", 6)])
    ],
    currentTurn: 3,
    lastPlayedCards: [card("player-3", 3)],
    lastPlayerId: "player",
    finishOrder: ["player"],
    gameStatus: "playing",
    selectedCards: [],
    passCount: 2,
    turnNumber: 4,
    currentRoundActions: {},
    history: [],
    playerActionState: {},
    cardRemainingCount: {},
    invalidCardIds: []
  } as unknown as GameEngineState;

  assert.equal(getRequiredPassCountForTrickReset(state), 3);
  assert.equal(getTurnAfterTrickReset(state), 1);
});

test("stabilizes a dirty state whose turn points to a finished player", () => {
  const state = {
    players: [
      player("player", []),
      player("enemyAI1", [card("enemy-4", 4)]),
      player("partnerAI", [card("partner-5", 5)]),
      player("enemyAI2", [card("enemy-6", 6)])
    ],
    currentTurn: 0,
    lastPlayerId: "player",
    finishOrder: [],
    gameStatus: "playing",
    winner: null,
    passCount: 5,
    turnAction: {
      playerId: "player",
      status: "waiting",
      label: "waiting",
      remainingSeconds: 15
    },
    playerActionState: {}
  } as unknown as GameEngineState;

  assert.deepEqual(getGameStateIssues(state), [
    "finishOrder contains duplicate or unknown players",
    "currentTurn points to inactive player player",
    "passCount exceeds active trick requirement"
  ]);

  const stableState = stabilizeGameState(state);

  assert.deepEqual(stableState.finishOrder, ["player"]);
  assert.equal(stableState.currentTurn, 1);
  assert.equal(stableState.passCount, 3);
  assert.equal(stableState.turnAction.playerId, "enemyAI1");
  assert.deepEqual(getGameStateIssues(stableState), []);
});
