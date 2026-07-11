import assert from "node:assert/strict";
import test from "node:test";
import { createDeck } from "../guandan/deck.ts";
import {
  applyCheckpointResult,
  calculateRemainingTargetCounts,
  createInitialTargetProgress,
  createSessionClock,
  createTrainingDeck,
  getTargetTotal,
  isSessionExpired,
  nextCheckpointTricks,
  pauseSession,
  resolveTribute,
  resumeSession,
  updateMultiplier,
  type MemoryTargetProgress,
} from "./memoryTrainingSystem.ts";

test("creates a unique 108-card two-deck deal", () => {
  const deck = createTrainingDeck(() => 0.5);
  assert.equal(deck.length, 108);
  assert.equal(new Set(deck.map((card) => card.id)).size, 108);
  assert.equal(createDeck().filter((card) => card.isJoker).length, 4);
});

test("target progression starts with joker and level, then unlocks cumulatively", () => {
  const progress = createInitialTargetProgress(15);
  assert.deepEqual(progress.activeTargets, ["JOKER", 15]);
  const unlocked = Array.from({ length: 5 }).reduce<MemoryTargetProgress>(
    (current) => applyCheckpointResult(current, true),
    progress,
  );
  assert.equal(unlocked.activeTargets.length, 3);
  assert.equal(unlocked.activeTargets[0], "JOKER");
});

test("regression removes the newest non-joker target after five poor checkpoints", () => {
  const progress = createInitialTargetProgress(15);
  const regressed = Array.from({ length: 5 }).reduce<MemoryTargetProgress>(
    (current) => applyCheckpointResult(current, false),
    progress,
  );
  assert.deepEqual(regressed.activeTargets, ["JOKER"]);
});

test("remaining count uses total minus hand minus played cards", () => {
  const deck = createDeck();
  const hand = deck.filter((card) => card.rank === 14).slice(0, 2);
  const played = deck.filter((card) => card.rank === 14).slice(2, 3);
  const result = calculateRemainingTargetCounts([14, "JOKER"], hand, played);
  assert.equal(result["14"], 5);
  assert.equal(result.JOKER, getTargetTotal("JOKER"));
});

test("checkpoint schedule is always one to three tricks", () => {
  assert.equal(nextCheckpointTricks(() => 0), 1);
  assert.equal(nextCheckpointTricks(() => 0.99), 3);
});

test("session clock pauses and resumes without losing elapsed time", () => {
  const clock = createSessionClock(1000);
  const paused = pauseSession(clock, 5000);
  assert.equal(isSessionExpired(paused, 5000), false);
  const resumed = resumeSession(paused, 10000);
  assert.equal(isSessionExpired(resumed, 10000), false);
  assert.equal(isSessionExpired(resumed, 3_606_000), true);
});

test("multiplier halves on mistakes and remains bounded", () => {
  assert.equal(updateMultiplier(16, false), 8);
  assert.equal(updateMultiplier(1, false), 1);
  assert.equal(updateMultiplier(4, true), 4);
});

test("tribute can be resisted and otherwise returns the winner rank", () => {
  assert.deepEqual(resolveTribute(14, 3), {
    tributeRequired: true,
    tributeRank: 3,
    returnRank: 14,
    resisted: false,
  });
  assert.equal(resolveTribute(14, 3, true).tributeRequired, false);
});
