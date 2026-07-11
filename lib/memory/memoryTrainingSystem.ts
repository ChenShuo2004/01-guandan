import type { Card, CardRank } from "../guandan/card.ts";
import { createDeck } from "../guandan/deck.ts";

export type MemoryTarget = CardRank | "JOKER";
export type TrainingMultiplier = 1 | 2 | 4 | 8 | 16;

export const MEMORY_TARGET_ORDER: MemoryTarget[] = [
  "JOKER",
  14,
  13,
  12,
  11,
  10,
  9,
  8,
  7,
  6,
  5,
  4,
  3,
  15,
];

export interface MemoryTargetProgress {
  activeTargets: MemoryTarget[];
  correctStreak: number;
  recoveryStreak: number;
  checkpointSuccesses: boolean[];
  inRecovery: boolean;
}

export interface MemorySessionClock {
  startedAt: number;
  elapsedMs: number;
  pausedAt: number | null;
  durationMs: number;
}

export interface MemoryGameProgress {
  levelRank: CardRank;
  cardsConsumed: number;
  gameNumber: number;
}

export interface TributeDecision {
  tributeRequired: boolean;
  tributeRank: CardRank | null;
  returnRank: CardRank | null;
  resisted: boolean;
}

export function fisherYatesShuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createTrainingDeck(random: () => number = Math.random): Card[] {
  return fisherYatesShuffle(createDeck(), random);
}

export function getTargetCount(targets: MemoryTarget[]): number {
  return targets.length;
}

export function getTargetLabel(target: MemoryTarget): string {
  if (target === "JOKER") return "JOKER";
  if (target === 14) return "A";
  if (target === 15) return "2";
  if (target === 11) return "J";
  if (target === 12) return "Q";
  if (target === 13) return "K";
  return String(target);
}

export function getTargetTotal(target: MemoryTarget): number {
  return target === "JOKER" ? 4 : 8;
}

export function isTargetCard(card: Card, target: MemoryTarget): boolean {
  return target === "JOKER" ? card.isJoker : card.rank === target;
}

export function countCardsForTarget(cards: Card[], target: MemoryTarget): number {
  return cards.filter((card) => isTargetCard(card, target)).length;
}

export function calculateRemainingTargetCounts(
  targets: MemoryTarget[],
  userHand: Card[],
  playedCards: Card[],
): Record<string, number> {
  return Object.fromEntries(
    targets.map((target) => [
      String(target),
      Math.max(0, getTargetTotal(target) - countCardsForTarget(userHand, target) - countCardsForTarget(playedCards, target)),
    ]),
  );
}

export function createInitialTargetProgress(levelRank: CardRank): MemoryTargetProgress {
  const firstTargets = [
    "JOKER" as const,
    levelRank,
    ...MEMORY_TARGET_ORDER.filter((target) => target !== "JOKER" && target !== levelRank),
  ].slice(0, 2);
  return { activeTargets: firstTargets, correctStreak: 0, recoveryStreak: 0, checkpointSuccesses: [], inRecovery: false };
}

export function applyCheckpointResult(
  progress: MemoryTargetProgress,
  allCorrect: boolean,
): MemoryTargetProgress {
  const checkpointSuccesses = [...progress.checkpointSuccesses, allCorrect].slice(-5);
  const correctStreak = allCorrect ? progress.correctStreak + 1 : 0;
  const recoveryStreak = allCorrect ? progress.recoveryStreak + 1 : 0;
  let activeTargets = [...progress.activeTargets];

  if (correctStreak >= 5) {
    const next = MEMORY_TARGET_ORDER.find((target) => !activeTargets.includes(target));
    if (next !== undefined) activeTargets.push(next);
  }

  const recentSuccesses = checkpointSuccesses.filter(Boolean).length;
  if (checkpointSuccesses.length === 5 && recentSuccesses < 2 && activeTargets.length > 1) {
    activeTargets = activeTargets.slice(0, -1);
    return { activeTargets, correctStreak: 0, recoveryStreak: 0, checkpointSuccesses: [], inRecovery: true };
  }

  if (progress.inRecovery && recoveryStreak >= 3 && activeTargets.length < MEMORY_TARGET_ORDER.length) {
    const next = MEMORY_TARGET_ORDER.find((target) => !activeTargets.includes(target));
    if (next !== undefined) activeTargets.push(next);
    return { activeTargets, correctStreak, recoveryStreak: 0, checkpointSuccesses, inRecovery: false };
  }

  return {
    activeTargets,
    correctStreak: correctStreak >= 5 ? 0 : correctStreak,
    recoveryStreak,
    checkpointSuccesses,
    inRecovery: progress.inRecovery,
  };
}

export function nextCheckpointTricks(random: () => number = Math.random): number {
  return 1 + Math.floor(random() * 3);
}

export function updateMultiplier(multiplier: TrainingMultiplier, allCorrect: boolean): TrainingMultiplier {
  if (!allCorrect) return Math.max(1, multiplier / 2) as TrainingMultiplier;
  return multiplier;
}

export function maybeIncreaseMultiplier(
  multiplier: TrainingMultiplier,
  recentResults: boolean[],
): TrainingMultiplier {
  if (recentResults.length < 2 || !recentResults.slice(-2).every(Boolean)) return multiplier;
  return Math.min(16, multiplier * 2) as TrainingMultiplier;
}

export function advanceLevelRank(levelRank: CardRank): CardRank {
  return levelRank >= 14 ? 3 : (levelRank + 1) as CardRank;
}

export function consumeCards(progress: MemoryGameProgress, count: number): MemoryGameProgress {
  const cardsConsumed = progress.cardsConsumed + count;
  if (cardsConsumed < 108) return { ...progress, cardsConsumed };
  return {
    levelRank: advanceLevelRank(progress.levelRank),
    cardsConsumed: 0,
    gameNumber: progress.gameNumber + 1,
  };
}

export function resolveTribute(
  winnerRank: CardRank,
  loserRank: CardRank,
  resisted = false,
): TributeDecision {
  if (resisted || winnerRank === loserRank) {
    return { tributeRequired: false, tributeRank: null, returnRank: null, resisted };
  }
  return {
    tributeRequired: true,
    tributeRank: loserRank,
    returnRank: winnerRank,
    resisted: false,
  };
}

export function createSessionClock(
  now = Date.now(),
  durationMs = 60 * 60 * 1000,
): MemorySessionClock {
  return { startedAt: now, elapsedMs: 0, pausedAt: null, durationMs };
}

export function pauseSession(clock: MemorySessionClock, now = Date.now()): MemorySessionClock {
  if (clock.pausedAt !== null) return clock;
  return { ...clock, elapsedMs: clock.elapsedMs + Math.max(0, now - clock.startedAt), pausedAt: now };
}

export function resumeSession(clock: MemorySessionClock, now = Date.now()): MemorySessionClock {
  if (clock.pausedAt === null) return clock;
  return { ...clock, startedAt: now, pausedAt: null };
}

export function getSessionElapsedMs(clock: MemorySessionClock, now = Date.now()): number {
  return clock.elapsedMs + (clock.pausedAt === null ? Math.max(0, now - clock.startedAt) : 0);
}

export function isSessionExpired(clock: MemorySessionClock, now = Date.now()): boolean {
  return getSessionElapsedMs(clock, now) >= clock.durationMs;
}

export function saveTrainingState<T>(storage: Pick<Storage, "setItem">, key: string, value: T): void {
  storage.setItem(key, JSON.stringify(value));
}

export function loadTrainingState<T>(storage: Pick<Storage, "getItem">, key: string): T | null {
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
