"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GameArena } from "@/components/game/GameArena";
import type { GameEngineState } from "@/lib/guandan/gameState";
import { getRankLabel } from "@/lib/guandan/card";
import { MemoryTargetPanel, MemoryTargetOverlay } from "@/components/memory/MemoryTargetPanel";
import { MemoryCheckpointPanel } from "@/components/memory/MemoryCheckpointPanel";
import { MemoryFeedbackPanel } from "@/components/memory/MemoryFeedbackPanel";
import { MemorySessionSummaryPanel } from "@/components/memory/MemorySessionSummary";
import { MemoryAnswerHistoryPanel } from "@/components/memory/MemoryAnswerHistoryPanel";
import {
  createInitialTrainingState,
  createTargetRanks,
  initializeVisibleTargetCards,
  buildAllCardsById,
  shouldTriggerMemoryCheckpoint,
  evaluateCheckpointWithCards,
  getErrorReplayEvents,
  resetForNextHand,
  checkShouldUpgrade,
  getNextTargetCountStep,
  handlePoorPerformance,
  buildSessionSummary,
  OBSERVATION_TIMES_MS,
  TARGET_COUNT_STEPS,
  type ObserverMemoryTrainingState,
  type MemoryRelevantEvent,
} from "@/lib/memory/ObserverMemoryTraining";

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
  const [showSummary, setShowSummary] = useState(false);
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
    const targetRanks = createTargetRanks(training.currentTargetCount, training.levelRank);
    setTraining(prev => ({ ...prev, phase: "SHOWING_TARGETS", targetRanks, handCount: 1 }));
    setShowTargetOverlay(true);

    sessionTimerRef.current = window.setTimeout(() => {
      setTraining(prev => ({ ...prev, sessionTimeExpired: true }));
    }, training.durationMinutes * 60_000);

    return () => {
      if (observationTimerRef.current) window.clearTimeout(observationTimerRef.current);
      if (sessionTimerRef.current) window.clearTimeout(sessionTimerRef.current);
      if (checkpointTransitionTimerRef.current) window.clearTimeout(checkpointTransitionTimerRef.current);
      if (handSettlementTimerRef.current) window.clearTimeout(handSettlementTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            observerHand.some(card => card.rank === rank && visibleIds.includes(card.id))
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

    if (dealCompleteRef.current) {
      startHandObservationTimer();
    }
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
      setShowSummary(true);
      return;
    }

    setTraining(prev => ({ ...prev, phase: "HAND_SETTLEMENT" }));

    handSettlementTimerRef.current = window.setTimeout(() => {
      let next = { ...trainingRef.current };

      if (checkShouldUpgrade(next)) {
        const newStepIndex = getNextTargetCountStep(next.targetCountStepIndex);
        next = { ...next, targetCountStepIndex: newStepIndex, currentTargetCount: TARGET_COUNT_STEPS[newStepIndex] };
      }

      next = handlePoorPerformance(next);
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

    for (const entry of newEntries) {
      if (entry.action === "play" && entry.cards.length > 0) {
        const targetCards = entry.cards.filter(c => t.targetRanks.includes(c.rank));
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
    }));

    const updatedTraining = {
      ...t,
      visibleTargetCardIds: newVisibleIds,
      allCardsById,
      relevantEvents: newEvents,
      validPlayCountSinceCheckpoint: validPlays,
      lastProcessedHistoryLength: state.history.length,
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
    const withAnswers = { ...t, currentAnswers: answers };
    const checkpoint = evaluateCheckpointWithCards(withAnswers, t.allCardsById);

    setTraining(prev => ({
      ...prev,
      currentAnswers: answers,
      phase: "SHOWING_FEEDBACK",
      pendingCheckpoint: checkpoint,
      checkpoints: [...prev.checkpoints, checkpoint],
      validPlayCountSinceCheckpoint: 0,
      stageAccuracy: checkpoint.accuracy,
      overallAccuracy: prev.checkpoints.length > 0
        ? (prev.checkpoints.reduce((s, cp) => s + cp.accuracy, 0) + checkpoint.accuracy) / (prev.checkpoints.length + 1)
        : checkpoint.accuracy,
      consecutiveLowAccuracyCheckpoints: checkpoint.accuracy < 0.6
        ? prev.consecutiveLowAccuracyCheckpoints + 1
        : 0,
    }));

    setShowCheckpoint(false);
    setShowFeedback(true);
  }, []);

  // ── Feedback continue ──────────────────────────────────────────────────────────
  const handleFeedbackContinue = useCallback(() => {
    setShowFeedback(false);

    if (trainingRef.current.sessionTimeExpired) {
      setTraining(prev => ({ ...prev, phase: "SESSION_FINISHED" }));
      setShowSummary(true);
      return;
    }

    if (gameStateRef.current?.gameStatus === "finished") {
      handleGameFinished();
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

    const newState = createInitialTrainingState({ debugMode: false, levelRank: 15 });
    const targetRanks = createTargetRanks(newState.currentTargetCount, newState.levelRank);

    setTraining({ ...newState, phase: "SHOWING_TARGETS", targetRanks, handCount: 1 });
    setArenaKey((current) => current + 1);
    dealCompleteRef.current = false;
    setShowTargetOverlay(true);
    setShowCheckpoint(false);
    setShowFeedback(false);
    setShowSummary(false);

    sessionTimerRef.current = window.setTimeout(() => {
      setTraining(prev => ({ ...prev, sessionTimeExpired: true }));
    }, newState.durationMinutes * 60_000);
  }, []);

  // ── Exit ───────────────────────────────────────────────────────────────────────
  const handleExit = useCallback(() => {
    if (observationTimerRef.current) window.clearTimeout(observationTimerRef.current);
    if (sessionTimerRef.current) window.clearTimeout(sessionTimerRef.current);
    if (handSettlementTimerRef.current) window.clearTimeout(handSettlementTimerRef.current);
    if (checkpointTransitionTimerRef.current) window.clearTimeout(checkpointTransitionTimerRef.current);
    router.push("/practice");
  }, [router]);

  // ── Computed ───────────────────────────────────────────────────────────────────
  const observerPaused = training.phase !== "AI_PLAYING";

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      <GameArena
        key={arenaKey}
        observerMode
        observerPaused={observerPaused}
        onObserverStateChange={handleStateChange}
        onDealComplete={handleDealComplete}
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

      {showSummary ? (
        <MemorySessionSummaryPanel
          summary={buildSessionSummary(training)}
          onRestart={handleRestart}
          onExit={handleExit}
        />
      ) : null}
    </div>
  );
}
