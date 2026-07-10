import type { Card, CardRank } from "@/lib/guandan/card";
import { getRankLabel } from "@/lib/guandan/card";
import type { GameEngineState } from "@/lib/guandan/gameState";
import type { PlayerSeat } from "@/lib/guandan/player";

export type MemoryTrainingPhase =
  | "INITIALIZING"
  | "SHOWING_TARGETS"
  | "OBSERVING_INITIAL_HAND"
  | "AI_PLAYING"
  | "PAUSING_FOR_CHECKPOINT"
  | "ANSWERING"
  | "EVALUATING"
  | "SHOWING_FEEDBACK"
  | "HAND_SETTLEMENT"
  | "STARTING_NEXT_HAND"
  | "SESSION_FINISHED";

export interface MemoryRelevantEvent {
  id: string;
  handId: string;
  playIndex: number;
  type: "INITIAL_VISIBLE_HAND" | "CARD_PLAYED";
  seat: PlayerSeat;
  cardIds: string[];
  matchedTargetRanks: CardRank[];
  label: string;
}

export interface MemoryCheckpointResult {
  id: string;
  handId: string;
  targetRanks: CardRank[];
  correctAnswers: Record<string, number>;
  userAnswers: Record<string, number>;
  correctRanks: CardRank[];
  incorrectRanks: CardRank[];
  correctCount: number;
  totalCount: number;
  accuracy: number;
  createdAt: number;
}

export interface ObserverMemoryTrainingState {
  sessionId: string;
  startedAt: number;
  durationMinutes: number;
  observerSeat: PlayerSeat;
  phase: MemoryTrainingPhase;
  targetCountStepIndex: number;
  currentTargetCount: number;
  targetRanks: CardRank[];
  currentHandId: string;
  handCount: number;
  visibleTargetCardIds: string[];
  relevantEvents: MemoryRelevantEvent[];
  validPlayCountSinceCheckpoint: number;
  checkpointInterval: number;
  consecutiveLowAccuracyCheckpoints: number;
  currentAnswers: Record<string, number>;
  pendingCheckpoint: MemoryCheckpointResult | null;
  checkpoints: MemoryCheckpointResult[];
  stageAccuracy: number;
  overallAccuracy: number;
  bestTargetCount: number;
  bestTenRankResult: number;
  debugMode: boolean;
  levelRank: CardRank;
  observerHandCardIds: string[];
  allCardsById: Record<string, Card>;
  lastProcessedHistoryLength: number;
  observationTimerActive: boolean;
  sessionTimeExpired: boolean;
}

export const TARGET_COUNT_STEPS = [1, 2, 3, 5, 7, 10] as const;

export const CHECKPOINT_INTERVALS: Record<number, { min: number; max: number }> = {
  1: { min: 3, max: 5 },
  2: { min: 4, max: 6 },
  3: { min: 5, max: 5 },
  5: { min: 5, max: 7 },
  7: { min: 6, max: 8 },
  10: { min: 8, max: 10 },
};

export const OBSERVATION_TIMES_MS: Record<number, number> = {
  1: 3_000,
  2: 4_000,
  3: 5_000,
  5: 6_000,
  7: 8_000,
  10: 10_000,
};

export const AI_ACTION_DELAY_MS = 2_000;
export const DEBUG_AI_ACTION_DELAY_MS = 400;
export const DEFAULT_DURATION_MINUTES = 60;
export const DEBUG_DURATION_MINUTES = 5;

export function getRankDisplayName(rank: CardRank): string {
  return getRankLabel(rank);
}

export function getAnswerOptions(maxCount: number): number[] {
  const cap = Math.min(maxCount, 8);
  return Array.from({ length: cap + 1 }, (_, i) => i);
}

export function getMaxPossibleCount(rank: CardRank): number {
  if (rank === 16 || rank === 17) return 2;
  return 4;
}

export function createTargetRanks(targetCount: number, levelRank: CardRank): CardRank[] {
  const candidates: CardRank[] = [
    16, levelRank, 14, 15, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3,
  ];
  const unique: CardRank[] = [];
  const seen = new Set<CardRank>();
  for (const rank of candidates) {
    if (!seen.has(rank)) {
      seen.add(rank);
      unique.push(rank);
    }
  }
  return unique.slice(0, targetCount);
}

export function initializeVisibleTargetCards(
  observerHand: Card[],
  targetRanks: CardRank[],
): string[] {
  return observerHand
    .filter((card) => targetRanks.includes(card.rank))
    .map((card) => card.id);
}

export function collectVisibleTargetCards(
  currentVisibleIds: string[],
  playedCards: Card[],
  targetRanks: CardRank[],
): string[] {
  const nextIds = new Set(currentVisibleIds);
  for (const card of playedCards) {
    if (targetRanks.includes(card.rank)) {
      nextIds.add(card.id);
    }
  }
  return [...nextIds];
}

export function calculateCorrectAnswers(
  visibleCardIds: string[],
  allCardsById: Record<string, Card>,
  targetRanks: CardRank[],
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const rank of targetRanks) {
    result[String(rank)] = 0;
  }
  for (const cardId of visibleCardIds) {
    const card = allCardsById[cardId];
    if (card && targetRanks.includes(card.rank)) {
      result[String(card.rank)] += 1;
    }
  }
  return result;
}

export function buildAllCardsById(state: GameEngineState): Record<string, Card> {
  const map: Record<string, Card> = {};
  for (const player of state.players) {
    for (const card of player.hand) {
      map[card.id] = card;
    }
  }
  return map;
}

export function shouldTriggerMemoryCheckpoint(
  state: GameEngineState,
  training: ObserverMemoryTrainingState,
): boolean {
  if (state.gameStatus === "finished") return false;
  if (training.phase !== "AI_PLAYING") return false;
  const interval = CHECKPOINT_INTERVALS[training.currentTargetCount];
  if (!interval) return false;
  if (state.roundComplete && training.validPlayCountSinceCheckpoint >= interval.min) {
    return true;
  }
  return training.validPlayCountSinceCheckpoint >= interval.max;
}

export function checkShouldUpgrade(training: ObserverMemoryTrainingState): boolean {
  const { checkpoints, currentTargetCount } = training;
  switch (currentTargetCount) {
    case 1:
    case 2: {
      const recent = checkpoints.slice(-3);
      return recent.length >= 3 && recent.every((cp) => cp.accuracy === 1);
    }
    case 3: {
      const recent = checkpoints.slice(-4);
      if (recent.length < 4) return false;
      return recent.reduce((s, cp) => s + cp.accuracy, 0) / 4 >= 0.8;
    }
    case 5: {
      const recent = checkpoints.slice(-5);
      if (recent.length < 5) return false;
      return recent.reduce((s, cp) => s + cp.accuracy, 0) / 5 >= 0.8;
    }
    case 7: {
      const recent = checkpoints.slice(-5);
      if (recent.length < 5) return false;
      return recent.reduce((s, cp) => s + cp.accuracy, 0) / 5 >= 0.75;
    }
    case 10:
      return false;
    default:
      return training.targetCountStepIndex < TARGET_COUNT_STEPS.length - 1;
  }
}

export function getNextTargetCountStep(currentIndex: number): number {
  return Math.min(currentIndex + 1, TARGET_COUNT_STEPS.length - 1);
}

export function handlePoorPerformance(
  training: ObserverMemoryTrainingState,
): ObserverMemoryTrainingState {
  const recent = training.checkpoints.slice(-3);
  if (recent.length < 3) return training;
  const avg = recent.reduce((s, cp) => s + cp.accuracy, 0) / 3;
  if (avg >= 0.6) return training;
  const interval = CHECKPOINT_INTERVALS[training.currentTargetCount];
  if (!interval) return training;
  if (training.checkpointInterval > interval.min) {
    return {
      ...training,
      checkpointInterval: Math.max(interval.min, training.checkpointInterval - 1),
      consecutiveLowAccuracyCheckpoints: training.consecutiveLowAccuracyCheckpoints + 1,
    };
  }
  const prevIndex = Math.max(0, training.targetCountStepIndex - 1);
  if (prevIndex === training.targetCountStepIndex) return training;
  const newCount = TARGET_COUNT_STEPS[prevIndex];
  const newInterval = CHECKPOINT_INTERVALS[newCount];
  return {
    ...training,
    targetCountStepIndex: prevIndex,
    currentTargetCount: newCount,
    checkpointInterval: newInterval?.max ?? 5,
    consecutiveLowAccuracyCheckpoints: 0,
  };
}

export function evaluateCheckpointWithCards(
  training: ObserverMemoryTrainingState,
  allCardsById: Record<string, Card>,
): MemoryCheckpointResult {
  const correctAnswers = calculateCorrectAnswers(
    training.visibleTargetCardIds,
    allCardsById,
    training.targetRanks,
  );
  const correctRanks: CardRank[] = [];
  const incorrectRanks: CardRank[] = [];
  for (const rank of training.targetRanks) {
    const key = String(rank);
    const userCount = training.currentAnswers[key] ?? 0;
    if (userCount === (correctAnswers[key] ?? 0)) {
      correctRanks.push(rank);
    } else {
      incorrectRanks.push(rank);
    }
  }
  return {
    id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    handId: training.currentHandId,
    targetRanks: [...training.targetRanks],
    correctAnswers,
    userAnswers: { ...training.currentAnswers },
    correctRanks,
    incorrectRanks,
    correctCount: correctRanks.length,
    totalCount: training.targetRanks.length,
    accuracy: training.targetRanks.length > 0 ? correctRanks.length / training.targetRanks.length : 0,
    createdAt: Date.now(),
  };
}

export function getErrorReplayEvents(
  checkpoint: MemoryCheckpointResult,
  events: MemoryRelevantEvent[],
): MemoryRelevantEvent[] {
  return events.filter((evt) =>
    evt.matchedTargetRanks.some((rank) => checkpoint.incorrectRanks.includes(rank)),
  );
}

export function createInitialTrainingState(
  options: { debugMode?: boolean; levelRank?: CardRank } = {},
): ObserverMemoryTrainingState {
  const debug = options.debugMode ?? false;
  const levelRank = options.levelRank ?? 14;
  return {
    sessionId: `session-${Date.now()}`,
    startedAt: Date.now(),
    durationMinutes: debug ? DEBUG_DURATION_MINUTES : DEFAULT_DURATION_MINUTES,
    observerSeat: "bottom",
    phase: "INITIALIZING",
    targetCountStepIndex: 0,
    currentTargetCount: TARGET_COUNT_STEPS[0],
    targetRanks: [],
    currentHandId: `hand-${Date.now()}`,
    handCount: 0,
    visibleTargetCardIds: [],
    relevantEvents: [],
    validPlayCountSinceCheckpoint: 0,
    checkpointInterval: CHECKPOINT_INTERVALS[TARGET_COUNT_STEPS[0]]?.max ?? 5,
    consecutiveLowAccuracyCheckpoints: 0,
    currentAnswers: {},
    pendingCheckpoint: null,
    checkpoints: [],
    stageAccuracy: 0,
    overallAccuracy: 0,
    bestTargetCount: 0,
    bestTenRankResult: 0,
    debugMode: debug,
    levelRank,
    observerHandCardIds: [],
    allCardsById: {},
    lastProcessedHistoryLength: 0,
    observationTimerActive: false,
    sessionTimeExpired: false,
  };
}

export function resetForNextHand(
  training: ObserverMemoryTrainingState,
): ObserverMemoryTrainingState {
  const targetRanks = createTargetRanks(training.currentTargetCount, training.levelRank);
  return {
    ...training,
    phase: "SHOWING_TARGETS",
    targetRanks,
    currentHandId: `hand-${Date.now()}`,
    handCount: training.handCount + 1,
    visibleTargetCardIds: [],
    relevantEvents: [],
    validPlayCountSinceCheckpoint: 0,
    currentAnswers: {},
    pendingCheckpoint: null,
    lastProcessedHistoryLength: 0,
    observationTimerActive: false,
  };
}

export interface MemorySessionSummary {
  durationMinutes: number;
  handsCompleted: number;
  checkpointsCompleted: number;
  startTargetCount: number;
  bestTargetCount: number;
  overallAccuracy: number;
  bestTenRankResult: number;
  mostMissedRank: string | null;
}

export function buildSessionSummary(
  training: ObserverMemoryTrainingState,
): MemorySessionSummary {
  const { checkpoints } = training;
  const overall = checkpoints.length > 0
    ? checkpoints.reduce((s, cp) => s + cp.accuracy, 0) / checkpoints.length
    : 0;
  const missCounts: Record<string, number> = {};
  for (const cp of checkpoints) {
    for (const rank of cp.incorrectRanks) {
      const key = String(rank);
      missCounts[key] = (missCounts[key] ?? 0) + 1;
    }
  }
  const mostMissed = Object.entries(missCounts).sort(([, a], [, b]) => b - a)[0];
  const tenRankCheckpoints = checkpoints.filter((cp) => cp.targetRanks.length >= 10);
  const bestTen = tenRankCheckpoints.length > 0
    ? Math.max(...tenRankCheckpoints.map((cp) => cp.correctCount))
    : 0;
  const elapsed = (Date.now() - training.startedAt) / 60_000;
  return {
    durationMinutes: Math.round(elapsed),
    handsCompleted: training.handCount,
    checkpointsCompleted: checkpoints.length,
    startTargetCount: TARGET_COUNT_STEPS[0],
    bestTargetCount: training.bestTargetCount,
    overallAccuracy: Math.round(overall * 100),
    bestTenRankResult: bestTen,
    mostMissedRank: mostMissed ? getRankDisplayName(Number(mostMissed[0]) as CardRank) : null,
  };
}
