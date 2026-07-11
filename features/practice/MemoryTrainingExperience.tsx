"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GameArena } from "@/components/game/GameArena";
import type { GameEngineState } from "@/lib/guandan/gameState";
import { getRankLabel } from "@/lib/guandan/card";
import { MemoryTargetPanel, MemoryTargetOverlay } from "@/components/memory/MemoryTargetPanel";
import { MemoryCheckpointPanel } from "@/components/memory/MemoryCheckpointPanel";
import { MemoryFeedbackPanel } from "@/components/memory/MemoryFeedbackPanel";
import { MemoryReviewReportPanel } from "@/components/memory/MemoryReviewReportPanel";
import { MemoryAnswerHistoryPanel } from "@/components/memory/MemoryAnswerHistoryPanel";
import {
  createInitialTrainingState,
  createTargetRanks,
  initializeVisibleTargetCards,
  getPlayedTargetCardIds,
  isTargetCard,
  buildAllCardsById,
  shouldTriggerMemoryCheckpoint,
  evaluateCheckpointWithCards,
  getErrorReplayEvents,
  resetForNextHand,
  buildSessionSummary,
  calculateOverallAccuracy,
  normalizeTrainingStateForResume,
  OBSERVATION_TIMES_MS,
  TARGET_COUNT_STEPS,
  type ObserverMemoryTrainingState,
  type MemoryRelevantEvent,
} from "@/lib/memory/ObserverMemoryTraining";
import {
  advanceLevelRank,
  applyCheckpointResult,
  loadTrainingState,
  maybeIncreaseMultiplier,
  getSessionElapsedMs,
  pauseSession,
  resumeSession,
  saveTrainingState,
  updateMultiplier,
} from "@/lib/memory/memoryTrainingSystem";

const MEMORY_SESSION_STORAGE_KEY = "guandan-memory-training-session";

export function MemoryTrainingExperience() {
  const router = useRouter();

  // ── Training state ────────────────────────────────────────────────────────────
  const [training, setTraining] = useState<ObserverMemoryTrainingState>(() =>
    createInitialTrainingState({ debugMode: false, levelRank: 15 })
  );
  const trainingRef = useRef(training);
  useEffect(() => { trainingRef.current = training; }, [training]);

  // ── UI visibility state ───────────────────────────────────────────────────────
  const [showTargetOverlay, setShowTargetOverlay] = useState(false);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [arenaKey, setArenaKey] = useState(0);

  // ── Refs ──────────────────────────────────────────────────────────────────────
  const dealCompleteRef = useRef(false);
  const observationTimerRef = useRef<number | null>(null);
  const sessionTimerRef = useRef<number | null>(null);
  const checkpointTransitionTimerRef = useRef<number | null>(null);
  const handSettlementTimerRef = useRef<number | null>(null);
  const phaseRef = useRef(training.phase);

  // ── Game store (observer mode) ─────────────────────────────────────────────────
  const checkpointTriggeredRef = useRef(false);
  const gameStateRef = useRef<GameEngineState | null>(null);

  // Keep phaseRef in sync
  useEffect(() => { phaseRef.current = training.phase; }, [training.phase]);

  useEffect(() => {
    if (typeof window !== "undefined") saveTrainingState(window.localStorage, MEMORY_SESSION_STORAGE_KEY, training);
  }, [training]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionTimerRef.current) window.clearTimeout(sessionTimerRef.current);
    if (training.sessionClock.pausedAt !== null || training.sessionTimeExpired) return;

    const remaining = Math.max(0, training.sessionClock.durationMs - getSessionElapsedMs(training.sessionClock));
    sessionTimerRef.current = window.setTimeout(() => {
      setTraining((prev) => ({ ...prev, sessionTimeExpired: true, phase: "SESSION_FINISHED" }));
      setShowReport(true);
    }, remaining);

    return () => {
      if (sessionTimerRef.current) window.clearTimeout(sessionTimerRef.current);
    };
  }, [training.sessionClock, training.sessionTimeExpired]);

  // ── Helper: start hand observation timer ───────────────────────────────────────
  const startHandObservationTimer = useCallback(() => {
    const t = trainingRef.current;
    const duration = OBSERVATION_TIMES_MS[t.currentTargetCount] ?? 3000;
    if (observationTimerRef.current) window.clearTimeout(observationTimerRef.current);
    observationTimerRef.current = window.setTimeout(() => {
      setTraining(prev => ({ ...prev, phase: "AI_PLAYING" }));
    }, duration);
  }, []);

  // ── Initialization (mount only) ────────────────────────────────────────────────
  useEffect(() => {
    const initial = createInitialTrainingState({ debugMode: false, levelRank: 15 });
    const stored = loadTrainingState<ObserverMemoryTrainingState>(window.localStorage, MEMORY_SESSION_STORAGE_KEY);
    const next = stored
      ? normalizeTrainingStateForResume({
          ...initial,
          ...stored,
          sessionClock: { ...initial.sessionClock, ...stored.sessionClock },
          targetProgress: stored.targetProgress ?? initial.targetProgress,
        })
      : { ...initial, phase: "SHOWING_TARGETS" as const, targetRanks: createTargetRanks(initial.currentTargetCount, initial.levelRank), handCount: 1 };
    setTraining(next);
    setShowTargetOverlay(next.phase === "SHOWING_TARGETS" || next.phase === "OBSERVING_INITIAL_HAND");
    setShowCheckpoint(next.phase === "ANSWERING");
    setShowFeedback(next.phase === "SHOWING_FEEDBACK" && Boolean(next.pendingCheckpoint));
    setShowReport(next.phase === "SESSION_FINISHED" || next.sessionTimeExpired);

    return () => {
      if (observationTimerRef.current) window.clearTimeout(observationTimerRef.current);
      if (sessionTimerRef.current) window.clearTimeout(sessionTimerRef.current);
      if (checkpointTransitionTimerRef.current) window.clearTimeout(checkpointTransitionTimerRef.current);
      if (handSettlementTimerRef.current) window.clearTimeout(handSettlementTimerRef.current);
    };
  }, []);

  const handleObserverPauseChange = useCallback((paused: boolean) => {
    setTraining((prev) => ({
      ...prev,
      sessionClock: paused ? pauseSession(prev.sessionClock) : resumeSession(prev.sessionClock),
    }));
  }, []);

  // ── Handle target overlay completion ───────────────────────────────────────────
  const handleObservationComplete = useCallback(() => {
    setShowTargetOverlay(false);

    const t = trainingRef.current;
    const currentState = gameStateRef.current;
    const observerHand = currentState?.players.find((player) => player.id === "player")?.hand ?? [];
    const allCardsById = currentState ? buildAllCardsById(currentState) : {};
    const visibleIds = initializeVisibleTargetCards(observerHand, t.targetRanks);

    const initialEvent: MemoryRelevantEvent | null = visibleIds.length > 0
      ? {
          id: `evt-init-${Date.now()}`,
          handId: t.currentHandId,
          playIndex: 0,
          type: "INITIAL_VISIBLE_HAND",
          seat: "bottom",
          cardIds: visibleIds,
          matchedTargetRanks: t.targetRanks.filter(rank =>
            observerHand.some(card => isTargetCard(card, [rank]) && visibleIds.includes(card.id))
          ),
          label: `初始手牌包含 ${visibleIds.length} 张目标牌`,
        }
      : null;

    setTraining(prev => ({
      ...prev,
      phase: "OBSERVING_INITIAL_HAND",
      visibleTargetCardIds: visibleIds,
      allCardsById,
      observerHandCardIds: observerHand.map(c => c.id),
      relevantEvents: initialEvent ? [initialEvent] : [],
    }));

    // DealAnimation has its own lock. The memory phase must advance independently;
    // otherwise a slow or interrupted deal callback can leave AI_PLAYING unreachable.
    startHandObservationTimer();
  }, [startHandObservationTimer]);

  // ── Handle deal completion ─────────────────────────────────────────────────────
  const handleDealComplete = useCallback(() => {
    if (dealCompleteRef.current) return;
    dealCompleteRef.current = true;
    if (phaseRef.current === "OBSERVING_INITIAL_HAND") {
      startHandObservationTimer();
    }
  }, [startHandObservationTimer]);

  // ── Checkpoint trigger ─────────────────────────────────────────────────────────
  const triggerCheckpoint = useCallback(() => {
    if (checkpointTriggeredRef.current) return;
    checkpointTriggeredRef.current = true;
    setTraining(prev => ({ ...prev, phase: "PAUSING_FOR_CHECKPOINT" }));
    checkpointTransitionTimerRef.current = window.setTimeout(() => {
      setTraining(prev => ({ ...prev, phase: "ANSWERING" }));
      setShowCheckpoint(true);
    }, 300);
  }, []);

  // ── Game finished handler ──────────────────────────────────────────────────────
  const handleGameFinished = useCallback(() => {
    const t = trainingRef.current;
    if (t.phase === "HAND_SETTLEMENT" || t.phase === "STARTING_NEXT_HAND" || t.phase === "SESSION_FINISHED") return;

    if (t.sessionTimeExpired) {
      setTraining(prev => ({ ...prev, phase: "SESSION_FINISHED" }));
      setShowReport(true);
      return;
    }

    setTraining(prev => ({ ...prev, phase: "HAND_SETTLEMENT" }));

    handSettlementTimerRef.current = window.setTimeout(() => {
      let next = {
        ...trainingRef.current,
        levelRank: advanceLevelRank(trainingRef.current.levelRank),
      };

      next = { ...next, bestTargetCount: Math.max(next.bestTargetCount, next.currentTargetCount) };

      const resetState = resetForNextHand(next);
      setTraining(resetState);
      setArenaKey((current) => current + 1);
      dealCompleteRef.current = false;
      setShowCheckpoint(false);
      setShowFeedback(false);
      setShowTargetOverlay(true);
    }, 1500);
  }, []);

  // ── Game state change tracking ─────────────────────────────────────────────────
  const handleStateChange = useCallback((state: GameEngineState) => {
    gameStateRef.current = state;
    const t = trainingRef.current;
    if (t.phase !== "AI_PLAYING") return;

    const newEntries = state.history.slice(t.lastProcessedHistoryLength);
    if (newEntries.length === 0) return;

    let newVisibleIds = [...t.visibleTargetCardIds];
    const newEvents = [...t.relevantEvents];
    let validPlays = t.validPlayCountSinceCheckpoint;
    const allCardsById = { ...t.allCardsById, ...buildAllCardsById(state) };
    const currentObserverHandCardIds = state.players
      .find((player) => player.id === "player")?.hand
      .map((card) => card.id) ?? t.observerHandCardIds;

    for (const entry of newEntries) {
      if (entry.action === "play" && entry.cards.length > 0) {
        const targetCards = entry.cards.filter(c => isTargetCard(c, t.targetRanks));
        if (targetCards.length > 0) {
          for (const card of targetCards) {
            if (!newVisibleIds.includes(card.id)) newVisibleIds.push(card.id);
          }
          const player = state.players.find(p => p.id === entry.playerId);
          newEvents.push({
            id: `evt-${entry.turn}-${entry.playerId}-${Date.now()}`,
            handId: t.currentHandId,
            playIndex: entry.turn,
            type: "CARD_PLAYED",
            seat: player?.seat ?? "bottom",
            cardIds: targetCards.map(c => c.id),
            matchedTargetRanks: [...new Set(targetCards.map(c => c.rank))],
            label: `${entry.playerName} 打出 ${targetCards.map(c => getRankLabel(c.rank)).join(", ")}`,
          });
        }
        validPlays++;
      }
    }

    setTraining(prev => ({
      ...prev,
      visibleTargetCardIds: newVisibleIds,
      allCardsById,
      relevantEvents: newEvents,
      validPlayCountSinceCheckpoint: validPlays,
      lastProcessedHistoryLength: state.history.length,
      observerHandCardIds: currentObserverHandCardIds,
    }));

    const updatedTraining = {
      ...t,
      visibleTargetCardIds: newVisibleIds,
      allCardsById,
      relevantEvents: newEvents,
      validPlayCountSinceCheckpoint: validPlays,
      lastProcessedHistoryLength: state.history.length,
      observerHandCardIds: currentObserverHandCardIds,
    };

    if (shouldTriggerMemoryCheckpoint(state, updatedTraining)) {
      triggerCheckpoint();
    }

    if (state.gameStatus === "finished") {
      handleGameFinished();
    }
  }, [handleGameFinished, triggerCheckpoint]);

  // ── Checkpoint submit ──────────────────────────────────────────────────────────
  const handleCheckpointSubmit = useCallback((answers: Record<string, number>) => {
    if (trainingRef.current.phase !== "ANSWERING") return;

    const t = trainingRef.current;
    checkpointTriggeredRef.current = false;
    const currentState = gameStateRef.current;
    const currentObserverHandCardIds = currentState?.players
      .find((player) => player.id === "player")?.hand
      .map((card) => card.id) ?? t.observerHandCardIds;
    const currentAllCardsById = currentState
      ? { ...t.allCardsById, ...buildAllCardsById(currentState) }
      : t.allCardsById;
    const withAnswers = {
      ...t,
      currentAnswers: answers,
      observerHandCardIds: currentObserverHandCardIds,
      allCardsById: currentAllCardsById,
    };
    const playedTargetCardIds = currentState
      ? getPlayedTargetCardIds(currentState, t.targetRanks)
      : undefined;
    const checkpoint = evaluateCheckpointWithCards(withAnswers, currentAllCardsById, playedTargetCardIds);
    const allCorrect = checkpoint.incorrectRanks.length === 0;
    const targetProgress = applyCheckpointResult(t.targetProgress, allCorrect);
    const nextMultiplier = maybeIncreaseMultiplier(
      updateMultiplier(t.multiplier, allCorrect),
      [...t.multiplierResults, allCorrect],
    );

    setTraining(prev => ({
      ...prev,
      currentAnswers: answers,
      phase: "SHOWING_FEEDBACK",
      pendingCheckpoint: checkpoint,
      checkpoints: [...prev.checkpoints, checkpoint],
      validPlayCountSinceCheckpoint: 0,
      stageAccuracy: checkpoint.accuracy,
      overallAccuracy: calculateOverallAccuracy([...prev.checkpoints, checkpoint]),
      consecutiveLowAccuracyCheckpoints: checkpoint.accuracy < 0.6
        ? prev.consecutiveLowAccuracyCheckpoints + 1
        : 0,
      multiplier: nextMultiplier,
      multiplierResults: [...prev.multiplierResults, allCorrect].slice(-2),
      targetProgress,
      currentTargetCount: targetProgress.activeTargets.length,
      targetCountStepIndex: Math.min(
        TARGET_COUNT_STEPS.length - 1,
        Math.max(0, targetProgress.activeTargets.length - 2),
      ),
    }));

    setShowCheckpoint(false);
    setShowFeedback(true);
  }, []);

  // ── Feedback continue ──────────────────────────────────────────────────────────
  const handleFeedbackContinue = useCallback(() => {
    setShowFeedback(false);

    if (trainingRef.current.sessionTimeExpired) {
      setTraining(prev => ({ ...prev, phase: "SESSION_FINISHED" }));
      setShowReport(true);
      return;
    }

    if (gameStateRef.current?.gameStatus === "finished") {
      handleGameFinished();
      return;
    }

    const current = trainingRef.current;
    if (current.targetRanks.length !== current.currentTargetCount) {
      const nextHand = resetForNextHand({ ...current, phase: "STARTING_NEXT_HAND" });
      setTraining(nextHand);
      setArenaKey((currentKey) => currentKey + 1);
      dealCompleteRef.current = false;
      setShowCheckpoint(false);
      setShowFeedback(false);
      setShowTargetOverlay(true);
      return;
    }

    setTraining(prev => ({ ...prev, phase: "AI_PLAYING", pendingCheckpoint: null }));
  }, [handleGameFinished]);

  // ── Restart ────────────────────────────────────────────────────────────────────
  const handleRestart = useCallback(() => {
    if (observationTimerRef.current) window.clearTimeout(observationTimerRef.current);
    if (sessionTimerRef.current) window.clearTimeout(sessionTimerRef.current);
    if (handSettlementTimerRef.current) window.clearTimeout(handSettlementTimerRef.current);
    if (checkpointTransitionTimerRef.current) window.clearTimeout(checkpointTransitionTimerRef.current);

    const newState = createInitialTrainingState({ debugMode: false, levelRank: trainingRef.current.levelRank });
    const targetRanks = createTargetRanks(newState.currentTargetCount, newState.levelRank);

    setTraining({ ...newState, phase: "SHOWING_TARGETS", targetRanks, handCount: 1 });
    setArenaKey((current) => current + 1);
    dealCompleteRef.current = false;
    setShowTargetOverlay(true);
    setShowCheckpoint(false);
    setShowFeedback(false);
    setShowReport(false);

    sessionTimerRef.current = window.setTimeout(() => {
      setTraining(prev => ({ ...prev, sessionTimeExpired: true }));
    }, newState.durationMinutes * 60_000);
  }, []);

  // ── Exit ───────────────────────────────────────────────────────────────────────
  const exitToLobby = useCallback(() => {
    if (observationTimerRef.current) window.clearTimeout(observationTimerRef.current);
    if (sessionTimerRef.current) window.clearTimeout(sessionTimerRef.current);
    if (handSettlementTimerRef.current) window.clearTimeout(handSettlementTimerRef.current);
    if (checkpointTransitionTimerRef.current) window.clearTimeout(checkpointTransitionTimerRef.current);
    router.push("/practice");
  }, [router]);

  const handleExit = useCallback(() => {
    if (observationTimerRef.current) window.clearTimeout(observationTimerRef.current);
    if (sessionTimerRef.current) window.clearTimeout(sessionTimerRef.current);
    if (handSettlementTimerRef.current) window.clearTimeout(handSettlementTimerRef.current);
    if (checkpointTransitionTimerRef.current) window.clearTimeout(checkpointTransitionTimerRef.current);
    setTraining((prev) => ({ ...prev, phase: "SESSION_FINISHED" }));
    setShowReport(true);
  }, []);

  const handleReportResume = useCallback(() => {
    setShowReport(false);
  }, []);

  // ── Computed ───────────────────────────────────────────────────────────────────
  const observerPaused = training.phase !== "AI_PLAYING";

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      <GameArena
        key={arenaKey}
        observerMode
        initialLevelRank={training.levelRank}
        observerPaused={observerPaused}
        onObserverStateChange={handleStateChange}
        onDealComplete={handleDealComplete}
        onObserverPauseChange={handleObserverPauseChange}
        onObserverExit={handleExit}
        onObserverOpenReport={() => setShowReport(true)}
      />

      <MemoryTargetPanel
        targetRanks={training.targetRanks}
        currentTargetCount={training.currentTargetCount}
        visible={training.phase === "AI_PLAYING" || training.phase === "OBSERVING_INITIAL_HAND"}
      />

      <MemoryAnswerHistoryPanel
        checkpoints={training.checkpoints}
        currentAnswers={training.currentAnswers}
        currentPhase={training.phase}
        currentTargetRanks={training.targetRanks}
        overallAccuracy={Math.round(training.overallAccuracy * 100)}
        visible
      />

      {showTargetOverlay ? (
        <MemoryTargetOverlay
          targetRanks={training.targetRanks}
          currentTargetCount={training.currentTargetCount}
          observationTimeMs={OBSERVATION_TIMES_MS[training.currentTargetCount] ?? 3000}
          onObservationComplete={handleObservationComplete}
          visible
        />
      ) : null}

      {showCheckpoint ? (
        <MemoryCheckpointPanel
          targetRanks={training.targetRanks}
          currentTargetCount={training.currentTargetCount}
          levelRank={training.levelRank}
          onSubmit={handleCheckpointSubmit}
        />
      ) : null}

      {showFeedback && training.pendingCheckpoint ? (
        <MemoryFeedbackPanel
          checkpoint={training.pendingCheckpoint}
          errorEvents={getErrorReplayEvents(training.pendingCheckpoint, training.relevantEvents)}
          onContinue={handleFeedbackContinue}
        />
      ) : null}

      {showReport ? (
        <MemoryReviewReportPanel
          canResume={training.phase !== "SESSION_FINISHED" && !training.sessionTimeExpired}
          checkpoints={training.checkpoints}
          onExit={exitToLobby}
          onRestart={handleRestart}
          onResume={handleReportResume}
          summary={buildSessionSummary(training)}
        />
      ) : null}

    </div>
  );
}
