import assert from "node:assert/strict";
import test from "node:test";
import { createDeck } from "../guandan/deck.ts";
import {
  applyCheckpointResult,
  applyGuandanHandUpgrade,
  advanceLevelRank,
  advanceTeamLevel,
  calculateRemainingTargetCounts,
  createInitialTargetProgress,
  createInitialTeamLevels,
  createSessionClock,
  createTrainingDeck,
  getGuandanUpgradeStep,
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

test("target progression starts with joker and level", () => {
  const progress = createInitialTargetProgress(15);
  assert.deepEqual(progress.activeTargets, ["JOKER", 15]);
});

test("target progression uses 75% promotion and 50% demotion thresholds", () => {
  const progress = {
    ...createInitialTargetProgress(15),
    activeTargets: ["JOKER", 15, 14, 13],
  } as MemoryTargetProgress;
  assert.equal(applyCheckpointResult(progress, 0.75).activeTargets.length, 5);
  assert.equal(applyCheckpointResult(progress, 0.5).activeTargets.length, 4);
  assert.equal(applyCheckpointResult(progress, 0.49).activeTargets.length, 3);
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

test("level rank advances from 2 through A and wraps back to 3", () => {
  assert.equal(advanceLevelRank(15), 3);
  assert.equal(advanceLevelRank(14), 15);
});

test("team level advances from 2 to 3 and caps at A", () => {
  assert.equal(advanceTeamLevel(15, 1), 3);
  assert.equal(advanceTeamLevel(13, 2), 14);
  assert.equal(advanceTeamLevel(14, 3), 14);
});

test("guandan upgrade step follows teammate placement", () => {
  assert.equal(getGuandanUpgradeStep([
    { playerId: "player", team: "blue" },
    { playerId: "partnerAI", team: "blue" },
    { playerId: "enemyAI1", team: "red" },
    { playerId: "enemyAI2", team: "red" },
  ]), 3);
  assert.equal(getGuandanUpgradeStep([
    { playerId: "player", team: "blue" },
    { playerId: "enemyAI1", team: "red" },
    { playerId: "partnerAI", team: "blue" },
    { playerId: "enemyAI2", team: "red" },
  ]), 2);
  assert.equal(getGuandanUpgradeStep([
    { playerId: "player", team: "blue" },
    { playerId: "enemyAI1", team: "red" },
    { playerId: "enemyAI2", team: "red" },
    { playerId: "partnerAI", team: "blue" },
  ]), 1);
});

test("guandan hand upgrade only advances the winning team", () => {
  const result = applyGuandanHandUpgrade(createInitialTeamLevels(), [
    { playerId: "enemyAI1", team: "red" },
    { playerId: "enemyAI2", team: "red" },
    { playerId: "player", team: "blue" },
    { playerId: "partnerAI", team: "blue" },
  ]);
  assert.deepEqual(result?.teamLevels, { blue: 15, red: 5 });
  assert.equal(result?.currentLevelRank, 5);
  assert.equal(result?.matchWinner, null);
});

test("guandan match finishes only after a team wins on A", () => {
  const result = applyGuandanHandUpgrade({ blue: 14, red: 13 }, [
    { playerId: "player", team: "blue" },
    { playerId: "partnerAI", team: "blue" },
    { playerId: "enemyAI1", team: "red" },
    { playerId: "enemyAI2", team: "red" },
  ]);
  assert.deepEqual(result?.teamLevels, { blue: 14, red: 13 });
  assert.equal(result?.matchWinner, "blue");
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
