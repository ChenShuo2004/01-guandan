import type { Card, CardRank } from "../guandan/card.ts";
import { getRankLabel } from "../guandan/card.ts";
import type { GameEngineState } from "../guandan/gameState.ts";
import type { PlayerId, PlayerSeat } from "../guandan/player.ts";
import type { GuandanTeam, MemorySessionClock, MemoryTargetProgress, TeamLevels, TrainingMultiplier } from "./memoryTrainingSystem";
import { calculateRemainingTargetCounts, createInitialTargetProgress, createInitialTeamLevels } from "./memoryTrainingSystem";

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

export interface MemoryHandResult {
  handId: string;
  placements: Array<{
    playerId: PlayerId;
    playerName: string;
    role: string;
    seat: PlayerSeat;
    team: GuandanTeam;
  }>;
  createdAt: number;
}

export type MemoryMethodGuideReason = "opening" | "wrong_streak";

export interface ObserverMemoryTrainingState {
  sessionId: string;
  startedAt: number;
  durationMinutes: number;
  observerSeat: PlayerSeat;
  phase: MemoryTrainingPhase;
  currentTargetCount: number;
  targetRanks: CardRank[];
  currentHandId: string;
  handCount: number;
  visibleTargetCardIds: string[];
  relevantEvents: MemoryRelevantEvent[];
  validPlayCountSinceCheckpoint: number;
  currentAnswers: Record<string, number>;
  pendingCheckpoint: MemoryCheckpointResult | null;
  checkpoints: MemoryCheckpointResult[];
  handResults: MemoryHandResult[];
  stageAccuracy: number;
  overallAccuracy: number;
  bestTargetCount: number;
  bestTenRankResult: number;
  debugMode: boolean;
  levelRank: CardRank;
  currentLevelRank: CardRank;
  teamLevels: TeamLevels;
  leadingTeam: GuandanTeam;
  handsCompleted: number;
  matchWinner: GuandanTeam | null;
  observerHandCardIds: string[];
  allCardsById: Record<string, Card>;
  lastProcessedHistoryLength: number;
  sessionTimeExpired: boolean;
  multiplier: TrainingMultiplier;
  multiplierResults: boolean[];
  sessionClock: MemorySessionClock;
  targetProgress: MemoryTargetProgress;
  playersPlayedSinceCheckpoint: Set<string>;
  consecutiveWrongCheckpoints: number;
  hasSeenOpeningMethodGuide: boolean;
  lastMethodGuideReason?: MemoryMethodGuideReason;
}

export const TARGET_COUNT_STEPS = [2, 3, 4, 5, 7, 10] as const;

export const CHECKPOINT_INTERVALS: Record<number, { min: number; max: number }> = {
  1: { min: 3, max: 5 },
  2: { min: 4, max: 6 },
  3: { min: 5, max: 5 },
  4: { min: 5, max: 6 },
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
  if (rank === 16 || rank === 17) return "JOKER";
  return getRankLabel(rank);
}

const NORMAL_RANK_DECK_COUNT = 8;
const TOTAL_JOKER_DECK_COUNT = 4;

export function getAnswerOptions(maxCount: number): number[] {
  const safeMax = Math.max(0, maxCount);
  return Array.from({ length: safeMax + 1 }, (_, index) => index);
}

export function getMaxPossibleCount(rank: CardRank): number {
  if (rank === 16 || rank === 17) return TOTAL_JOKER_DECK_COUNT;
  return NORMAL_RANK_DECK_COUNT;
}

export function getTotalJokerDeckCount(): number {
  return TOTAL_JOKER_DECK_COUNT;
}

export function createTargetRanks(targetCount: number, levelRank: CardRank): CardRank[] {
  const descendingRanks: CardRank[] = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 15];
  const candidates: CardRank[] = [16, levelRank, ...descendingRanks];
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
    .filter((card) => isTargetCard(card, targetRanks))
    .map((card) => card.id);
}

export function collectVisibleTargetCards(
  currentVisibleIds: string[],
  playedCards: Card[],
  targetRanks: CardRank[],
): string[] {
  const nextIds = new Set(currentVisibleIds);
  for (const card of playedCards) {
    if (isTargetCard(card, targetRanks)) {
      nextIds.add(card.id);
    }
  }
  return [...nextIds];
}

export function isTargetCard(card: Card, targetRanks: CardRank[]): boolean {
  return targetRanks.some((rank) =>
    rank === 16 || rank === 17
      ? card.rank === 16 || card.rank === 17
      : card.rank === rank,
  );
}

export function getPlayedTargetCardIds(
  state: GameEngineState,
  targetRanks: CardRank[],
): string[] {
  return state.history
    .filter((entry) => entry.action === "play")
    .flatMap((entry) => entry.cards)
    .filter((card) => isTargetCard(card, targetRanks))
    .map((card) => card.id);
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

  const visibleCards = visibleCardIds
    .map((cardId) => allCardsById[cardId])
    .filter((card): card is Card => Boolean(card));
  const visibleJokerCount = visibleCards.filter((card) => card.rank === 16 || card.rank === 17).length;

  for (const rank of targetRanks) {
    if (rank === 16 || rank === 17) {
      result[String(rank)] = visibleJokerCount;
      continue;
    }

    result[String(rank)] = visibleCards.filter((card) => card.rank === rank).length;
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
  for (const entry of state.history) {
    for (const card of entry.cards) {
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
  
  const aiPlayers = ["enemyAI1", "partnerAI", "enemyAI2"];
  const allAIsPlayed = aiPlayers.every(playerId => 
    training.playersPlayedSinceCheckpoint.has(playerId)
  );
  
  if (!allAIsPlayed) return false;
  
  if (state.roundComplete && training.validPlayCountSinceCheckpoint >= interval.min) {
    return true;
  }
  return training.validPlayCountSinceCheckpoint >= interval.max;
}

export function evaluateCheckpointWithCards(
  training: ObserverMemoryTrainingState,
  allCardsById: Record<string, Card>,
  playedCardIds?: string[],
): MemoryCheckpointResult {
  const userHand = training.observerHandCardIds
    .map((cardId) => allCardsById[cardId])
    .filter((card): card is Card => Boolean(card));
  const playedCards = (playedCardIds ?? training.relevantEvents
    .filter((event) => event.type === "CARD_PLAYED")
    .flatMap((event) => event.cardIds))
    .map((cardId) => allCardsById[cardId])
    .filter((card): card is Card => Boolean(card));
  const remaining = calculateRemainingTargetCounts(
    training.targetRanks.map((rank) => rank === 16 || rank === 17 ? "JOKER" : rank),
    userHand,
    playedCards,
  );
  const correctAnswers = Object.fromEntries(
    training.targetRanks.map((rank) => [String(rank), remaining[String(rank === 16 || rank === 17 ? "JOKER" : rank)] ?? 0]),
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
  const levelRank = options.levelRank ?? 15;
  const teamLevels = createInitialTeamLevels();
  return {
    sessionId: `session-${Date.now()}`,
    startedAt: Date.now(),
    durationMinutes: debug ? DEBUG_DURATION_MINUTES : DEFAULT_DURATION_MINUTES,
    observerSeat: "bottom",
    phase: "SHOWING_TARGETS",
    currentTargetCount: TARGET_COUNT_STEPS[0],
    targetRanks: createTargetRanks(TARGET_COUNT_STEPS[0], levelRank),
    currentHandId: `hand-${Date.now()}`,
    handCount: 1,
    visibleTargetCardIds: [],
    relevantEvents: [],
    validPlayCountSinceCheckpoint: 0,
    currentAnswers: {},
    pendingCheckpoint: null,
    checkpoints: [],
    handResults: [],
    stageAccuracy: 0,
    overallAccuracy: 0,
    bestTargetCount: 0,
    bestTenRankResult: 0,
    debugMode: debug,
    levelRank,
    currentLevelRank: levelRank,
    teamLevels,
    leadingTeam: "blue",
    handsCompleted: 0,
    matchWinner: null,
    observerHandCardIds: [],
    allCardsById: {},
    lastProcessedHistoryLength: 0,
    sessionTimeExpired: false,
    multiplier: 1,
    multiplierResults: [],
    sessionClock: {
      startedAt: Date.now(),
      elapsedMs: 0,
      pausedAt: null,
      durationMs: (debug ? DEBUG_DURATION_MINUTES : DEFAULT_DURATION_MINUTES) * 60_000,
    },
    targetProgress: createInitialTargetProgress(levelRank),
    playersPlayedSinceCheckpoint: new Set(),
    consecutiveWrongCheckpoints: 0,
    hasSeenOpeningMethodGuide: false,
    lastMethodGuideReason: undefined,
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
    playersPlayedSinceCheckpoint: new Set(),
  };
}

export function normalizeTrainingStateForResume(
  training: ObserverMemoryTrainingState,
): ObserverMemoryTrainingState {
  const teamLevels = training.teamLevels ?? createInitialTeamLevels();
  const leadingTeam = training.leadingTeam ?? "blue";
  const normalized = {
    ...training,
    handResults: training.handResults ?? [],
    teamLevels,
    leadingTeam,
    currentLevelRank: training.currentLevelRank ?? training.levelRank ?? teamLevels[leadingTeam],
    levelRank: training.levelRank ?? training.currentLevelRank ?? teamLevels[leadingTeam],
    handsCompleted: training.handsCompleted ?? training.handResults?.length ?? 0,
    matchWinner: training.matchWinner ?? null,
    consecutiveWrongCheckpoints: training.consecutiveWrongCheckpoints ?? 0,
    hasSeenOpeningMethodGuide: training.hasSeenOpeningMethodGuide ?? false,
    lastMethodGuideReason: training.lastMethodGuideReason,
  };

  if (training.phase === "SESSION_FINISHED" || training.sessionTimeExpired) return {
    ...normalized,
    playersPlayedSinceCheckpoint: training.playersPlayedSinceCheckpoint instanceof Set 
      ? training.playersPlayedSinceCheckpoint 
      : new Set(),
  };

  // GameArena state is intentionally ephemeral, so a restored session starts a
  // fresh hand while keeping curriculum, multiplier, checkpoints and session time.
  const currentTargetCount = normalized.targetProgress.activeTargets.length;
  return resetForNextHand({
    ...normalized,
    phase: "STARTING_NEXT_HAND",
    currentTargetCount,
  });
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
  teamLevels: TeamLevels;
  matchWinner: GuandanTeam | null;
}

export function calculateOverallAccuracy(checkpoints: MemoryCheckpointResult[]): number {
  const totalCorrect = checkpoints.reduce((sum, checkpoint) => sum + checkpoint.correctCount, 0);
  const totalQuestions = checkpoints.reduce((sum, checkpoint) => sum + checkpoint.totalCount, 0);
  return totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
}

export function buildSessionSummary(
  training: ObserverMemoryTrainingState,
): MemorySessionSummary {
  const { checkpoints } = training;
  const overall = calculateOverallAccuracy(checkpoints);
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
    handsCompleted: training.handsCompleted,
    checkpointsCompleted: checkpoints.length,
    startTargetCount: TARGET_COUNT_STEPS[0],
    bestTargetCount: training.bestTargetCount,
    overallAccuracy: Math.round(overall * 100),
    bestTenRankResult: bestTen,
    mostMissedRank: mostMissed ? getRankDisplayName(Number(mostMissed[0]) as CardRank) : null,
    teamLevels: training.teamLevels,
    matchWinner: training.matchWinner,
  };
}
