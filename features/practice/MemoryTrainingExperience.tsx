"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GameArena } from "@/components/game/GameArena";
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

interface TributeNotice {
  tributeCard: Card | null;
  returnCard: Card | null;
  tributeFrom: string;
  tributeTo: string;
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
  const [showTargetOverlay, setShowTargetOverlay] = useState(false);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [tributeNotice, setTributeNotice] = useState<TributeNotice | null>(null);
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
      : { ...initial, phase: "SHOWING_TARGETS" as const, targetRanks: createTargetRanks(initial.currentTargetCount, initial.levelRank), handCount: 1 };
    setTraining(next);
    setShowTargetOverlay(next.phase === "SHOWING_TARGETS" || next.phase === "OBSERVING_INITIAL_HAND");
    setShowCheckpoint(next.phase === "ANSWERING");
    setShowFeedback(next.phase === "SHOWING_FEEDBACK" && Boolean(next.pendingCheckpoint));
    setShowReport(next.phase === "SESSION_FINISHED" || next.sessionTimeExpired);
    const observationTimer = observationTimerRef.current;
    const sessionTimer = sessionTimerRef.current;
    const checkpointTransitionTimer = checkpointTransitionTimerRef.current;
    const handSettlementTimer = handSettlementTimerRef.current;

    return () => {
      if (observationTimer) window.clearTimeout(observationTimer);
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
      tributeFrom: tributeDonor.name,
      tributeTo: returnDonor?.name ?? winner.name,
      resisted,
    } : null);
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
      setTributeNotice(null);
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
      playersPlayedSinceCheckpoint: new Set(),
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

      {tributeNotice ? <TributeNoticePanel notice={tributeNotice} /> : null}

      <MemoryAnswerHistoryPanel
        checkpoints={training.checkpoints}
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

function TributeNoticePanel({ notice }: { notice: TributeNotice }) {
  return (
    <div className="fixed inset-0 z-[210] grid place-items-center bg-[#071426]/45 px-5 backdrop-blur-[2px]">
      <section className="w-full max-w-sm rounded-3xl border border-[#74dfff]/45 bg-[#0e2944]/95 p-6 text-white shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#74dfff]">HAND SETTLEMENT</p>
        <h2 className="mt-3 text-2xl font-black">{notice.resisted ? "抗贡成功" : "自动进贡与还贡"}</h2>
        {notice.resisted ? (
          <p className="mt-3 text-sm font-bold leading-6 text-white/75">
            {notice.tributeFrom} 一方拥有两张大王，本局不交换牌，直接进入下一局。
          </p>
        ) : (
          <div className="mt-4 space-y-3 text-sm font-bold text-white/75">
            <p>
              上贡：{notice.tributeFrom} → {notice.tributeTo}
              {notice.tributeCard ? `，${formatTributeCard(notice.tributeCard)}` : ""}
            </p>
            <p>
              还贡：{notice.tributeTo} → {notice.tributeFrom}
              {notice.returnCard ? `，${formatTributeCard(notice.returnCard)}` : ""}
            </p>
          </div>
        )}
        <p className="mt-5 text-center text-xs font-bold text-[#8de8ff]">交换完成，准备下一局</p>
      </section>
    </div>
  );
}

function formatTributeCard(card: Card): string {
  if (card.isJoker) return getRankLabel(card.rank);
  const suitLabels: Record<Card["suit"], string> = {
    spade: "♠",
    heart: "♥",
    club: "♣",
    diamond: "♦",
    joker: "",
  };
  return `${getRankLabel(card.rank)}${suitLabels[card.suit]}`;
}
