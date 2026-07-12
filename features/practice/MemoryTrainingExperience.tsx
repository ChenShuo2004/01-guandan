"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GameArena } from "@/components/game/GameArena";
import { SettlementSequenceOverlay } from "@/components/game/SettlementSequenceOverlay";
import type { GameEngineState } from "@/lib/guandan/gameState";
import { getRankLabel, sortCards, sortCardsAscending, type Card } from "@/lib/guandan/card";
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
  type ObserverMemoryTrainingState,
  type MemoryRelevantEvent,
} from "@/lib/memory/ObserverMemoryTraining";
import {
  advanceLevelRank,
  applyCheckpointResult,
  createSessionClock,
  loadTrainingState,
  maybeIncreaseMultiplier,
  getSessionElapsedMs,
  pauseSession,
  resumeSession,
  saveTrainingState,
  updateMultiplier,
} from "@/lib/memory/memoryTrainingSystem";

const MEMORY_SESSION_STORAGE_KEY = "guandan-memory-training-session";

interface TributeNotice {
  tributeCard: Card | null;
  returnCard: Card | null;
  tributeFromId: string;
  tributeToId: string;
  tributeFrom: string;
  tributeTo: string;
  leadPlayer: string;
  resisted: boolean;
}

export function MemoryTrainingExperience() {
  const router = useRouter();

  // ── Training state ────────────────────────────────────────────────────────────
  const [training, setTraining] = useState<ObserverMemoryTrainingState>(() =>
    createInitialTrainingState({ debugMode: false, levelRank: 15 })
  );
  const trainingRef = useRef(training);
  useEffect(() => { trainingRef.current = training; }, [training]);

  // ── UI visibility state ───────────────────────────────────────────────────────
  const [showTargetOverlay, setShowTargetOverlay] = useState(true);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [tributeNotice, setTributeNotice] = useState<TributeNotice | null>(null);
  const [arenaKey, setArenaKey] = useState(0);

  // ── Refs ──────────────────────────────────────────────────────────────────────
  const dealCompleteRef = useRef(false);
  const sessionTimerRef = useRef<number | null>(null);
  const checkpointTransitionTimerRef = useRef<number | null>(null);
  const handSettlementTimerRef = useRef<number | null>(null);

  // ── Game store (observer mode) ─────────────────────────────────────────────────
  const checkpointTriggeredRef = useRef(false);
  const gameStateRef = useRef<GameEngineState | null>(null);

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
          playersPlayedSinceCheckpoint: stored.playersPlayedSinceCheckpoint instanceof Set 
            ? stored.playersPlayedSinceCheckpoint 
            : new Set(),
        })
      : initial;
    setTraining(next);
    setShowTargetOverlay(next.phase === "SHOWING_TARGETS" || next.phase === "OBSERVING_INITIAL_HAND");
    setShowCheckpoint(next.phase === "ANSWERING");
    setShowFeedback(next.phase === "SHOWING_FEEDBACK" && Boolean(next.pendingCheckpoint));
    setShowReport(next.phase === "SESSION_FINISHED" || next.sessionTimeExpired);
    const sessionTimer = sessionTimerRef.current;
    const checkpointTransitionTimer = checkpointTransitionTimerRef.current;
    const handSettlementTimer = handSettlementTimerRef.current;

    return () => {
      if (sessionTimer) window.clearTimeout(sessionTimer);
      if (checkpointTransitionTimer) window.clearTimeout(checkpointTransitionTimer);
      if (handSettlementTimer) window.clearTimeout(handSettlementTimer);
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
      phase: "ANSWERING",
      visibleTargetCardIds: visibleIds,
      allCardsById,
      observerHandCardIds: observerHand.map(c => c.id),
      relevantEvents: initialEvent ? [initialEvent] : [],
      playersPlayedSinceCheckpoint: new Set(),
    }));
    setShowCheckpoint(true);
  }, []);

  // ── Handle deal completion ─────────────────────────────────────────────────────
  const handleDealComplete = useCallback(() => {
    if (dealCompleteRef.current) return;
    dealCompleteRef.current = true;
  }, []);

  const advanceAfterSettlement = useCallback(() => {
    const current = trainingRef.current;
    const handCheckpoints = current.checkpoints.filter(
      (checkpoint) => checkpoint.handId === current.currentHandId,
    );
    const handAccuracy = calculateOverallAccuracy(handCheckpoints);
    const targetProgress = handCheckpoints.length > 0
      ? applyCheckpointResult(current.targetProgress, handAccuracy)
      : current.targetProgress;
    let next = {
      ...current,
      levelRank: advanceLevelRank(current.levelRank),
      targetProgress,
      currentTargetCount: targetProgress.activeTargets.length,
    };

    next = { ...next, bestTargetCount: Math.max(next.bestTargetCount, next.currentTargetCount) };

    setTraining(resetForNextHand(next));
    setArenaKey((current) => current + 1);
    dealCompleteRef.current = false;
    setShowCheckpoint(false);
    setShowFeedback(false);
    setShowTargetOverlay(true);
    setTributeNotice(null);
  }, []);

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

    const finishedState = gameStateRef.current;
    const winner = finishedState?.players.find((player) => player.id === finishedState.winner);
    const handResult = finishedState
      ? {
          handId: t.currentHandId,
          placements: finishedState.finishOrder.map((playerId) => {
            const player = finishedState.players.find((item) => item.id === playerId);
            return {
              playerId,
              playerName: player?.name ?? playerId,
              role: player?.role ?? "",
              seat: player?.seat ?? "bottom",
            };
          }),
          createdAt: Date.now(),
        }
      : null;
    const winningTeam = winner?.team;
    const losingTeamPlayers = finishedState?.players.filter((player) => player.team !== winningTeam) ?? [];
    const winningTeamPlayers = finishedState?.players.filter((player) => player.team === winningTeam) ?? [];
    const tributeDonor = [...losingTeamPlayers].sort((a, b) => b.hand.length - a.hand.length)[0];
    const returnDonor = [...winningTeamPlayers].sort((a, b) => b.hand.length - a.hand.length)[0];
    const resisted = losingTeamPlayers
      .flatMap((player) => player.hand)
      .filter((card) => card.rank === 17).length >= 2;
    const tributeCard = tributeDonor?.hand.length ? sortCards(tributeDonor.hand)[0] : null;
    const returnCandidates = returnDonor?.hand.filter(
      (card) => !card.isJoker && card.rank !== finishedState?.levelRank && card.rank <= 10,
    ) ?? [];
    const returnCard = returnCandidates.length > 0
      ? sortCardsAscending(returnCandidates)[0]
      : returnDonor?.hand.length
        ? sortCardsAscending(returnDonor.hand.filter((card) => !card.isJoker))[0] ?? null
        : null;

    setTributeNotice(winner && tributeDonor ? {
      tributeCard: resisted ? null : tributeCard,
      returnCard: resisted ? null : returnCard,
      tributeFromId: tributeDonor.id,
      tributeToId: returnDonor?.id ?? winner.id,
      tributeFrom: tributeDonor.name,
      tributeTo: returnDonor?.name ?? winner.name,
      leadPlayer: winner.name,
      resisted,
    } : null);
    setTraining(prev => ({
      ...prev,
      phase: "HAND_SETTLEMENT",
      handResults: handResult ? [...prev.handResults, handResult] : prev.handResults,
    }));

    handSettlementTimerRef.current = window.setTimeout(() => {
      advanceAfterSettlement();
    }, 6500);
  }, [advanceAfterSettlement]);

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

    const newPlayersPlayed = new Set(t.playersPlayedSinceCheckpoint);
    
    for (const entry of newEntries) {
      if (entry.action === "play" && entry.cards.length > 0) {
        newPlayersPlayed.add(entry.playerId);
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
      playersPlayedSinceCheckpoint: newPlayersPlayed,
    }));

    const updatedTraining = {
      ...t,
      visibleTargetCardIds: newVisibleIds,
      allCardsById,
      relevantEvents: newEvents,
      validPlayCountSinceCheckpoint: validPlays,
      lastProcessedHistoryLength: state.history.length,
      observerHandCardIds: currentObserverHandCardIds,
      playersPlayedSinceCheckpoint: newPlayersPlayed,
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
      playersPlayedSinceCheckpoint: new Set(),
      stageAccuracy: checkpoint.accuracy,
      overallAccuracy: calculateOverallAccuracy([...prev.checkpoints, checkpoint]),
      multiplier: nextMultiplier,
      multiplierResults: [...prev.multiplierResults, allCorrect].slice(-2),
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
    setShowReport(false);
    setTributeNotice(null);

    sessionTimerRef.current = window.setTimeout(() => {
      setTraining(prev => ({ ...prev, sessionTimeExpired: true }));
    }, newState.durationMinutes * 60_000);
  }, []);

  // ── Exit ───────────────────────────────────────────────────────────────────────
  const exitToLobby = useCallback(() => {
    if (sessionTimerRef.current) window.clearTimeout(sessionTimerRef.current);
    if (handSettlementTimerRef.current) window.clearTimeout(handSettlementTimerRef.current);
    if (checkpointTransitionTimerRef.current) window.clearTimeout(checkpointTransitionTimerRef.current);
    router.push("/practice");
  }, [router]);

  const handleExit = useCallback(() => {
    if (sessionTimerRef.current) window.clearTimeout(sessionTimerRef.current);
    if (handSettlementTimerRef.current) window.clearTimeout(handSettlementTimerRef.current);
    if (checkpointTransitionTimerRef.current) window.clearTimeout(checkpointTransitionTimerRef.current);
    setTraining((prev) => ({ ...prev, phase: "SESSION_FINISHED" }));
    setShowReport(true);
  }, []);

  const handleReportResume = useCallback(() => {
    setShowReport(false);
    setTraining((prev) => {
      if (prev.sessionTimeExpired) {
        return {
          ...prev,
          sessionTimeExpired: false,
          phase: "AI_PLAYING",
          sessionClock: createSessionClock(Date.now(), prev.sessionClock.durationMs),
        };
      }

      if (prev.phase === "SESSION_FINISHED") {
        return { ...prev, phase: "AI_PLAYING" };
      }

      return prev;
    });
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
        observerMultiplier={training.multiplier}
        observerPaused={observerPaused}
        settlementFocus={
          tributeNotice
            ? { donorId: tributeNotice.tributeFromId, receiverId: tributeNotice.tributeToId }
            : undefined
        }
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

      {tributeNotice ? (
        <SettlementSequenceOverlay
          levelRank={getRankLabel(training.levelRank)}
          notice={tributeNotice}
          onComplete={() => {
            if (handSettlementTimerRef.current) {
              window.clearTimeout(handSettlementTimerRef.current);
              handSettlementTimerRef.current = null;
            }
            advanceAfterSettlement();
          }}
        />
      ) : null}

      <MemoryAnswerHistoryPanel
        checkpoints={training.checkpoints}
        handResults={training.handResults}
        currentHandId={training.currentHandId}
        currentAnswers={training.currentAnswers}
        currentPhase={training.phase}
        currentTargetRanks={training.targetRanks}
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
