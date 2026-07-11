"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ActionToolbar } from "@/components/game/ActionToolbar";
import { buildCounterHint, CardCounter } from "@/components/game/CardCounter";
import { DealAnimation } from "@/components/game/DealAnimation";
import { GameTable } from "@/components/game/GameTable";
import { HandCards } from "@/components/game/HandCards";
import { useGameStore } from "@/store/gameStore";
import { getRankLabel, sortCardsAscending, type Card, type CardRank } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";
import { playArenaSound } from "@/lib/audio/arenaAudio";
import type { GameEngineState, TrainingPhase } from "@/lib/guandan/gameState";
import type { ArenaPlayer } from "@/types/game";

type DealStage = "dealing" | "sorting" | "ready";

interface ArenaSettings {
  sound: boolean;
  music: boolean;
  aiTips: boolean;
  aiThinkSeconds: number;
}

const defaultSettings: ArenaSettings = {
  sound: true,
  music: true,
  aiTips: true,
  aiThinkSeconds: 5
};

interface GameArenaProps {
  observerMode?: boolean;
  initialLevelRank?: CardRank;
  observerPaused?: boolean;
  fastForward?: boolean;
  onObserverStateChange?: (state: GameEngineState) => void;
  onDealComplete?: () => void;
  onObserverPauseChange?: (paused: boolean) => void;
  onObserverExit?: () => void;
  onObserverOpenReport?: () => void;
}

export function GameArena({
  observerMode = false,
  initialLevelRank = 15,
  observerPaused = false,
  fastForward = false,
  onObserverStateChange,
  onDealComplete,
  onObserverPauseChange,
  onObserverExit,
  onObserverOpenReport,
}: GameArenaProps) {
  const router = useRouter();
  const arenaRef = useRef<HTMLElement | null>(null);
  const [activePanel, setActivePanel] = useState<"coach" | "rules" | "settings" | null>(null);
  const [settings, setSettings] = useState<ArenaSettings>(defaultSettings);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showPortraitPrompt, setShowPortraitPrompt] = useState(false);
  const [arenaCardScale, setArenaCardScale] = useState(0.92);
  const [dealStage, setDealStage] = useState<DealStage>("dealing");
  const [dealRunId, setDealRunId] = useState(0);
  const [smartSortActive, setSmartSortActive] = useState(false);
  const [observerCounterVisible, setObserverCounterVisible] = useState(true);
  const [sortPulseKey, setSortPulseKey] = useState(0);
  const [restoreEnabled, setRestoreEnabled] = useState(false);
  const originalHandRef = useRef<Card[] | null>(null);
  const [aiCountdown, setAiCountdown] = useState<number | null>(null);
  const aiActionKeyRef = useRef<string | null>(null);
  const aiTimerRef = useRef<number | null>(null);
  const aiRemainingRef = useRef<number | null>(null);
  const aiPausedActionKeyRef = useRef<string | null>(null);
  const soundHistoryLengthRef = useRef(0);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const previousThinkSecondsRef = useRef(defaultSettings.aiThinkSeconds);
  const settingsHydratedRef = useRef(false);
  const userActionKeyRef = useRef<string | null>(null);
  const userTimerRef = useRef<number | null>(null);
  const {
    state,
    currentPlayer,
    userPlayer,
    selectedCardIds,
    isUserTurn,
    clearSelectedCards,
    continueTraining,
    selectCard,
    setSelectedCards,
    playSelectedCards,
    pass,
    requestTip,
    toggleCardCounter,
    showSolution,
    setTurnAction,
    clearRoundActions,
    runAIAction,
    restart,
    sortHand,
    restoreHand
  } = useGameStore(observerMode, initialLevelRank);

  const levelRankLabel = getRankLabel(state.levelRank);
  const cardCounterHint = useMemo(
    () => buildCounterHint(state.cardRemainingCount),
    [state.cardRemainingCount]
  );
  const isDealLocked = dealStage !== "ready";
  const totalCardCount = useMemo(
    () => state.players.reduce((sum, player) => sum + player.hand.length, 0),
    [state.players]
  );
  const displayedUserCards = useMemo(() => {
    const hand = userPlayer?.hand ?? [];
    return smartSortActive ? sortCardsAscending(hand) : hand;
  }, [smartSortActive, userPlayer?.hand]);

  const displayTurnAction = useMemo(() => {
    if (
      observerMode &&
      aiCountdown !== null &&
      state.turnAction.playerId === currentPlayer?.id &&
      (state.turnAction.status === "thinking" || state.turnAction.status === "waiting")
    ) {
      return { ...state.turnAction, remainingSeconds: aiCountdown };
    }
    return state.turnAction;
  }, [aiCountdown, currentPlayer?.id, observerMode, state.turnAction]);

  useEffect(() => {
    onObserverStateChange?.(state);
  }, [onObserverStateChange, state]);

  useEffect(() => {
    if (state.history.length <= soundHistoryLengthRef.current) return;
    const latest = state.history[state.history.length - 1];
    soundHistoryLengthRef.current = state.history.length;
    playArenaSound(latest.action === "pass" ? "pass" : "play", settings.sound);
  }, [settings.sound, state.history]);

  const restartDealAnimation = useCallback(() => {
    setDealStage("dealing");
    setSmartSortActive(false);
    setRestoreEnabled(false);
    originalHandRef.current = null;
    setSortPulseKey((current) => current + 1);
    setDealRunId((current) => current + 1);
  }, []);

  const completeDealAnimation = useCallback(() => {
    setDealStage("ready");
    setSmartSortActive(true);
    setSortPulseKey((current) => current + 1);
    onDealComplete?.();
  }, [onDealComplete]);

  const restartTraining = useCallback(() => {
    restart();
    restartDealAnimation();
  }, [restart, restartDealAnimation]);

  useEffect(() => {
    // Replace the deterministic hydration snapshot with a fresh deal after mount.
    restartTraining();
  }, [restartTraining]);

  const startTraining = useCallback(() => {
    continueTraining();
    restartDealAnimation();
  }, [continueTraining, restartDealAnimation]);

  const toggleSmartSort = useCallback(() => {
    if (isDealLocked) return;

    setSmartSortActive((active) => !active);
    setSortPulseKey((current) => current + 1);
  }, [isDealLocked]);

  const handleOrganizeHand = useCallback(() => {
    if (isDealLocked) return;

    const currentHand = userPlayer?.hand ?? [];
    if (currentHand.length === 0) return;

    originalHandRef.current = [...currentHand];
    setRestoreEnabled(true);
    sortHand();
    setSortPulseKey((current) => current + 1);
  }, [isDealLocked, sortHand, userPlayer?.hand]);

  const handleRestoreHand = useCallback(() => {
    if (isDealLocked || !originalHandRef.current) return;

    restoreHand(originalHandRef.current);
    originalHandRef.current = null;
    setRestoreEnabled(false);
    setSortPulseKey((current) => current + 1);
  }, [isDealLocked, restoreHand]);

  const completeAIAction = useCallback(() => {
    if (aiTimerRef.current) {
      window.clearInterval(aiTimerRef.current);
      aiTimerRef.current = null;
    }

    aiRemainingRef.current = null;
    aiPausedActionKeyRef.current = null;
    setAiCountdown(null);
    runAIAction();
  }, [runAIAction]);

  useEffect(() => {
    if (observerPaused || isPaused) {
      if (currentPlayer?.id && state.trainingPhase === "playing" && state.gameStatus === "playing") {
        aiPausedActionKeyRef.current = `${state.turnNumber}-${currentPlayer.id}`;
      }
      aiActionKeyRef.current = null;
      return;
    }

    if (isDealLocked || state.trainingPhase !== "playing" || state.gameStatus !== "playing" || (!observerMode && currentPlayer?.kind !== "ai")) return;

    const actionKey = `${state.turnNumber}-${currentPlayer.id}`;
    const thinkSecondsChanged = previousThinkSecondsRef.current !== settings.aiThinkSeconds;

    if (thinkSecondsChanged) {
      previousThinkSecondsRef.current = settings.aiThinkSeconds;
      if (aiTimerRef.current) {
        window.clearInterval(aiTimerRef.current);
        aiTimerRef.current = null;
      }
      aiActionKeyRef.current = null;
      aiRemainingRef.current = null;
      aiPausedActionKeyRef.current = null;
    }

    if (aiActionKeyRef.current === actionKey) return;

    aiActionKeyRef.current = actionKey;

    const shouldResume =
      aiPausedActionKeyRef.current === actionKey &&
      aiRemainingRef.current !== null &&
      aiRemainingRef.current > 0;
    const seconds = fastForward ? 0 : shouldResume ? aiRemainingRef.current! : settings.aiThinkSeconds;

    aiPausedActionKeyRef.current = null;
    aiRemainingRef.current = null;

    setTurnAction({
      playerId: currentPlayer.id,
      status: "thinking",
      label: `AI ${currentPlayer.role} 思考中`,
      remainingSeconds: seconds
    });

    setAiCountdown(seconds);
    let remaining = seconds;
    aiTimerRef.current = window.setInterval(() => {
      remaining -= 1;
      setAiCountdown(remaining);
      setTurnAction({
        playerId: currentPlayer.id,
        status: remaining > 0 ? "thinking" : "playing",
        label: remaining > 0 ? `AI ${currentPlayer.role} 思考中` : `${currentPlayer.role} 准备出牌`,
        remainingSeconds: Math.max(remaining, 0)
      });

      if (remaining <= 0) {
        completeAIAction();
      }
    }, 1000);

    return () => {
      if (aiTimerRef.current) {
        window.clearInterval(aiTimerRef.current);
        aiTimerRef.current = null;
        aiRemainingRef.current = remaining;
      }
    };
  }, [completeAIAction, currentPlayer?.id, currentPlayer?.kind, currentPlayer?.role, fastForward, isDealLocked, isPaused, observerMode, observerPaused, settings.aiThinkSeconds, setTurnAction, state.gameStatus, state.trainingPhase, state.turnNumber]);

  useEffect(() => {
    if (observerMode || isDealLocked || state.trainingPhase !== "playing" || state.gameStatus !== "playing" || currentPlayer?.id !== "player") return;
    if (isPaused) {
      userActionKeyRef.current = null;
      return;
    }

    const actionKey = `${state.turnNumber}-player`;
    if (userActionKeyRef.current === actionKey) return;

    userActionKeyRef.current = actionKey;
    let remaining = 15;

    setTurnAction({
      playerId: "player",
      status: "waiting",
      label: "轮到你出牌",
      remainingSeconds: remaining
    });

    userTimerRef.current = window.setInterval(() => {
      remaining -= 1;
      setTurnAction({
        playerId: "player",
        status: remaining > 0 ? "waiting" : "analyzing",
        label: remaining > 0 ? "轮到你出牌" : "时间到，Ace Coach 给出提示",
        remainingSeconds: Math.max(remaining, 0)
      });

      if (remaining <= 0) {
        if (userTimerRef.current) {
          window.clearInterval(userTimerRef.current);
          userTimerRef.current = null;
        }
        requestTip();
      }
    }, 1000);

    return () => {
      if (userTimerRef.current) {
        window.clearInterval(userTimerRef.current);
        userTimerRef.current = null;
      }
    };
  }, [currentPlayer?.id, isDealLocked, isPaused, observerMode, requestTip, setTurnAction, state.gameStatus, state.trainingPhase, state.turnNumber]);

  useEffect(() => {
    if (!state.roundComplete) return;

    const timer = window.setTimeout(clearRoundActions, 1200);
    return () => window.clearTimeout(timer);
  }, [clearRoundActions, state.roundClearKey, state.roundComplete]);

  useEffect(() => {
    const raw = window.localStorage.getItem("guandan-training-arena-settings");
    if (raw) {
      try {
        const stored = JSON.parse(raw) as Partial<ArenaSettings>;
        setSettings({
          ...defaultSettings,
          ...stored
        });
        if (typeof stored.aiThinkSeconds === "number") {
          previousThinkSecondsRef.current = stored.aiThinkSeconds;
        }
      } catch {
        setSettings(defaultSettings);
      }
    }

    settingsHydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!settingsHydratedRef.current) return;
    window.localStorage.setItem("guandan-training-arena-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;

    if (settings.music) {
      music.volume = 0.18;
      void music.play().catch(() => undefined);
      return;
    }

    music.pause();
    music.currentTime = 0;
  }, [settings.music]);

  useEffect(() => {
    function syncFullscreenState() {
      setIsFullscreen(Boolean(document.fullscreenElement));
      window.dispatchEvent(new Event("resize"));
    }

    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  useEffect(() => {
    function syncOrientationPrompt() {
      const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      setShowPortraitPrompt(isTouchDevice && isPortrait);
    }

    syncOrientationPrompt();
    window.addEventListener("resize", syncOrientationPrompt);
    window.addEventListener("orientationchange", syncOrientationPrompt);
    return () => {
      window.removeEventListener("resize", syncOrientationPrompt);
      window.removeEventListener("orientationchange", syncOrientationPrompt);
    };
  }, []);

  useEffect(() => {
    function syncArenaCardScale() {
      const isLandscapeTraining = window.matchMedia("(orientation: landscape) and (max-height: 600px)").matches;

      if (!isLandscapeTraining) {
        setArenaCardScale(1.02);
        return;
      }

      const targetCardHeight = window.innerHeight * 0.21;
      const nextScale = Math.min(0.82, Math.max(0.66, targetCardHeight / 124));
      setArenaCardScale(Number(nextScale.toFixed(2)));
    }

    syncArenaCardScale();
    window.addEventListener("resize", syncArenaCardScale);
    window.addEventListener("orientationchange", syncArenaCardScale);
    return () => {
      window.removeEventListener("resize", syncArenaCardScale);
      window.removeEventListener("orientationchange", syncArenaCardScale);
    };
  }, []);

  const arenaPlayers = useMemo(
    () =>
      state.players.map<ArenaPlayer>((player) => {
        const actionState = state.playerActionState[player.id];

        return {
          id: player.id,
          name: player.name,
          role: roleLabel(player.seat),
          position: player.seat,
          cardCount: player.hand.length,
          score: player.score,
          isUser: player.id === "player",
          status:
            state.gameStatus === "finished"
              ? "waiting"
              : actionState?.status === "thinking"
                ? "thinking"
                : currentPlayer?.id === player.id
                  ? player.kind === "ai"
                    ? "thinking"
                    : "active"
                  : player.passed
                    ? "passed"
                    : "waiting",
          countdown:
            actionState?.playerId === player.id
              ? actionState.remainingSeconds
              : displayTurnAction.playerId === player.id
                ? displayTurnAction.remainingSeconds
                : null
        };
      }),
    [
      currentPlayer?.id,
      state.gameStatus,
      state.playerActionState,
      state.players,
      displayTurnAction
    ]
  );

  const phase = state.trainingPhase;
  const roundStatus =
    phase === "analysis"
      ? "AI 正在分析这手牌..."
      : isUserTurn
        ? "轮到你出牌"
        : `${currentPlayer?.role ?? "对家"}出牌中...`;
  const goLobby = () => {
    if (observerMode && onObserverExit) {
      onObserverExit();
      return;
    }
    router.push("/practice");
  };
  const coachMood = state.coachFeedback.type === "mistake" ? "warning" : isUserTurn ? "teaching" : "thinking";

  function updateSettings(nextSettings: Partial<ArenaSettings>) {
    setSettings((current) => ({
      ...current,
      ...nextSettings
    }));
  }

  const isObserverAutoWait =
    observerMode &&
    Boolean(currentPlayer?.id) &&
    state.turnAction.playerId === currentPlayer.id &&
    typeof state.turnAction.remainingSeconds === "number" &&
    state.turnAction.remainingSeconds >= 0 &&
    (state.turnAction.status === "thinking" || state.turnAction.status === "waiting");

  const isAiThinkingWait =
    !observerMode &&
    currentPlayer?.kind === "ai" &&
    state.turnAction.status === "thinking";

  const isUserThinkingWait =
    !observerMode &&
    currentPlayer?.id === "player" &&
    state.turnAction.status === "waiting" &&
    typeof state.turnAction.remainingSeconds === "number" &&
    state.turnAction.remainingSeconds > 0;

  const canSkipTurnWait =
    state.trainingPhase === "playing" &&
    !isPaused &&
    !isDealLocked &&
    (isObserverAutoWait || isAiThinkingWait || isUserThinkingWait);

  function skipUserWait() {
    if (userTimerRef.current) {
      window.clearInterval(userTimerRef.current);
      userTimerRef.current = null;
    }

    userActionKeyRef.current = null;
    setTurnAction({
      playerId: "player",
      status: "waiting",
      label: "轮到你出牌",
      remainingSeconds: null
    });
  }

  function skipAIWait() {
    if (isPaused || isDealLocked || state.trainingPhase !== "playing") return;

    if (observerMode) {
      if (
        !currentPlayer ||
        state.gameStatus !== "playing" ||
        state.turnAction.playerId !== currentPlayer.id ||
        (state.turnAction.status !== "thinking" && state.turnAction.status !== "waiting")
      ) return;

      aiRemainingRef.current = null;
      aiPausedActionKeyRef.current = null;
      aiActionKeyRef.current = null;
      completeAIAction();
      return;
    }

    if (currentPlayer?.id === "player" && state.turnAction.status === "waiting") {
      skipUserWait();
      return;
    }

    if (currentPlayer?.kind !== "ai" || state.turnAction.status !== "thinking") return;

    aiRemainingRef.current = null;
    aiPausedActionKeyRef.current = null;
    aiActionKeyRef.current = null;
    completeAIAction();
  }

  function togglePause() {
    setIsPaused((paused) => {
      const next = !paused;
      onObserverPauseChange?.(next);
      return next;
    });
  }

  function updateMusic(music: boolean) {
    updateSettings({ music });
    const audio = musicRef.current;
    if (!audio) return;

    if (music) {
      audio.volume = 0.18;
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await (arenaRef.current ?? document.documentElement).requestFullscreen();
      }
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement));
    } finally {
      window.setTimeout(() => window.dispatchEvent(new Event("resize")), 120);
    }
  }, []);

  const enterLandscapeTraining = useCallback(async () => {
    try {
      await toggleFullscreen();
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (orientation: "landscape" | "portrait") => Promise<void>;
      };
      await orientation.lock?.("landscape");
    } catch {
      setShowPortraitPrompt(true);
    }
  }, [toggleFullscreen]);

  const coachTeachingText = state.cardCounterVisible
    ? `${formatCoachTeaching(
        state.coachFeedback.message,
        state.coachFeedback.reason,
        state.coachFeedback.suggestion
      )}\n记牌提示：${cardCounterHint}`
    : formatCoachTeaching(
        state.coachFeedback.message,
        state.coachFeedback.reason,
        state.coachFeedback.suggestion
      );

  return (
    <main
      className="training-arena relative h-[100dvh] min-h-[390px] overflow-hidden bg-[#72caff] text-[#12395a]"
      data-fullscreen={isFullscreen ? "true" : "false"}
      data-observer-mode={observerMode ? "true" : "false"}
      ref={arenaRef}
    >
      <audio loop preload="auto" ref={musicRef} src="/assets/audio/training-camp-circuit-smiles.mp3" />
      <ArenaBackground />
      <ArenaTopBar
          isFullscreen={isFullscreen}
          isPaused={isPaused}
          levelRank={levelRankLabel}
          observerMode={observerMode}
        onBackToLobby={goLobby}
        onOpenCoach={() => setActivePanel("coach")}
        onOpenRules={() => setActivePanel("rules")}
        onOpenReport={onObserverOpenReport}
          onOpenSettings={() => setActivePanel("settings")}
          onToggleFullscreen={toggleFullscreen}
          onTogglePause={togglePause}
          phase={phase}
      />

      {observerMode ? (
        <button
          aria-label="返回训练列表"
          className="training-observer-back absolute left-3 top-3 z-[92] hidden h-12 items-center gap-1.5 rounded-2xl border border-white/75 bg-white/88 px-4 text-sm font-black text-[#12395a] shadow-[0_12px_26px_rgba(28,109,172,0.18)] backdrop-blur-xl transition active:scale-[0.97]"
          onClick={goLobby}
          type="button"
        >
          <span className="material-symbols-outlined text-[21px]">arrow_back</span>
          返回
        </button>
      ) : null}

      <section className="training-arena-stage relative z-10 mx-auto h-full w-full max-w-[1680px] px-4 pb-3 pt-[84px] lg:px-5">
        {!observerMode ? (
          <FloatingArenaControls
            cardCounterVisible={state.cardCounterVisible}
            isFullscreen={isFullscreen}
            observerMode={observerMode}
            onOpenCoach={() => setActivePanel("coach")}
            onOpenRules={() => setActivePanel("rules")}
            onOpenSettings={() => setActivePanel("settings")}
            onToggleCardCounter={toggleCardCounter}
            onToggleFullscreen={toggleFullscreen}
            tipsEnabled={settings.aiTips}
          />
        ) : null}
        <GameTable
          levelRank={levelRankLabel}
          players={arenaPlayers}
          roundActions={state.currentRoundActions}
          showTurnStatus={!isDealLocked && (!observerMode || !observerPaused)}
          turnAction={displayTurnAction}
        />

        <CardCounter
          counts={state.cardRemainingCount}
          levelRank={levelRankLabel}
          myRemaining={userPlayer?.hand.length ?? 0}
          onHide={observerMode ? () => setObserverCounterVisible(false) : undefined}
          opponentRemaining={state.players.find((player) => player.role === "opponent")?.hand.length ?? 0}
          visible={!observerMode && state.cardCounterVisible}
        />

        {observerMode && !observerCounterVisible ? (
          <button
            aria-label="显示记牌器"
            className="absolute right-5 top-[94px] z-[66] flex h-10 items-center gap-1.5 rounded-xl border border-white/80 bg-white/90 px-3 text-xs font-black text-[#12395a] shadow-[0_10px_24px_rgba(25,92,148,0.18)] backdrop-blur-md transition hover:-translate-y-0.5 max-xl:right-3 max-lg:top-[86px]"
            onClick={() => setObserverCounterVisible(true)}
            title="显示记牌器"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">visibility</span>
            记牌
          </button>
        ) : null}

        {settings.aiTips && !observerMode ? (
          <motion.section
            animate={{ opacity: 1, x: 0 }}
            className="training-coach-tip absolute left-5 top-[190px] z-[62] flex max-h-[210px] w-[min(380px,28vw)] items-start gap-4 overflow-y-auto rounded-2xl bg-white px-5 py-4 text-left shadow-[0_22px_54px_rgba(42,132,196,0.24)] max-xl:top-[176px] max-xl:w-[330px] max-lg:left-3 max-lg:top-[96px] max-lg:max-h-[126px] max-lg:w-[300px] max-lg:gap-3 max-lg:px-4 max-lg:py-3"
            initial={{ opacity: 0, x: -18 }}
            key={state.coachFeedback.message}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/70 bg-white/62 shadow-[0_10px_24px_rgba(45,125,188,0.18)] max-lg:h-10 max-lg:w-10">
              <Image
                alt=""
                className="object-cover p-0.5"
                fill
                sizes="48px"
                src={coachMood === "warning" ? "/assets/coach/coach-analysis-mode.png" : "/assets/coach/coach-bubble-hologram.png"}
              />
            </span>
            <div className="min-w-0">
              <p className="text-lg font-black text-[#12395a] max-lg:text-base">Ace Coach 建议</p>
              <p className="mt-2 whitespace-pre-wrap text-base font-bold leading-7 text-[#244d68] max-lg:mt-1 max-lg:text-sm max-lg:leading-5">
                {coachTeachingText}
              </p>
            </div>
          </motion.section>
        ) : null}

        {!observerMode ? <div className="training-analysis-panel pointer-events-none absolute left-1/2 top-[61%] z-40 w-[min(560px,42vw)] -translate-x-1/2 text-center text-white drop-shadow-[0_3px_8px_rgba(34,92,146,0.42)] max-lg:top-[54%] max-lg:w-[360px]">
          <AnalysisPanel reason={state.coachFeedback.reason} status={roundStatus} />
        </div> : null}

        <section className={cn(
          "training-hand-dock absolute left-3 right-3 z-[70] min-w-0 lg:left-[120px] lg:right-[120px] 2xl:left-[150px] 2xl:right-[150px]",
          observerMode ? "bottom-[8%]" : "bottom-3"
        )}>
          {!isDealLocked ? (
            <>
              <HandCards
                cards={displayedUserCards}
                disabled={observerMode || !isUserTurn || isDealLocked}
                invalidCardIds={state.invalidCardIds}
                invalidPulseKey={state.invalidPulseKey}
                levelRank={levelRankLabel}
                onSelectionChange={setSelectedCards}
                onSelectCard={selectCard}
                selectedCardIds={selectedCardIds}
                cardScale={arenaCardScale}
                sortPulseKey={sortPulseKey}
                variant="arena"
              />
              {!observerMode ? <ActionToolbar
                canAct={isUserTurn && !isDealLocked}
                cardCounterVisible={state.cardCounterVisible}
                isAIThinking={canSkipTurnWait}
                onBackToLobby={goLobby}
                onContinue={continueTraining}
                onPass={pass}
                onPlay={playSelectedCards}
              onRestart={restartTraining}
              onShowSolution={showSolution}
              onSortHand={handleOrganizeHand}
              onStart={startTraining}
              onTip={requestTip}
              onToggleCardCounter={toggleCardCounter}
              onUndo={clearSelectedCards}
              onSkipAIWait={skipAIWait}
              onRestoreHand={handleRestoreHand}
              restoreEnabled={restoreEnabled}
                phase={phase}
                selectedCount={state.selectedCards.length}
              /> : null}
            </>
          ) : null}
        </section>
        {observerMode ? (
          <ObserverHandTools
            hasStraightFlush={hasStraightFlush(displayedUserCards)}
            isAIThinking={canSkipTurnWait}
            onOrganize={handleOrganizeHand}
            onSkipAIWait={skipAIWait}
            organized={restoreEnabled}
            onRestore={handleRestoreHand}
            restoreEnabled={restoreEnabled}
            skipLabel="跳过 AI"
          />
        ) : null}
        <DealAnimation
          active={isDealLocked}
          cardCount={totalCardCount}
          key={dealRunId}
          onComplete={completeDealAnimation}
          onStageChange={setDealStage}
        />
      </section>

      <ArenaModal onClose={() => setActivePanel(null)} open={activePanel === "coach"} title={observerMode ? "记牌训练说明" : "AI Coach"}>
        <CoachTeachingContent
          message={state.coachFeedback.message}
          reason={state.coachFeedback.reason}
          suggestion={state.coachFeedback.suggestion}
          observerMode={observerMode}
        />
      </ArenaModal>

      <ArenaModal onClose={() => setActivePanel(null)} open={activePanel === "rules"} title="训练规则">
        <div className="space-y-4 text-base font-bold leading-7 text-[#24557a]">
          <RuleBlock title="掼蛋基础规则" items={["四人两两组队，目标是尽快出完手牌。", "轮到你时必须出同牌型且更大的牌，炸弹可压普通牌型。", "一圈都不出时，牌权回到上一位出牌者。"]} />
          <RuleBlock title="牌型说明" items={["单牌、对子、三张、三带二、顺子是基础牌型。", "四张及以上同点数为炸弹，四王炸最大。", "顺子不包含 2 和大小王。"]} />
          <RuleBlock title="级牌说明" items={["本局级牌会在牌桌顶部显示。", "手牌中的级牌使用金色边框和“级”标签标出。", "做判断时先确认级牌能否改变牌权。"]} />
          <RuleBlock title="大小王说明" items={["小王使用蓝色主题，牌面显示 SMALL JOKER。", "大王使用红色主题，牌面显示 BIG JOKER。", "大小王尺寸略大于普通牌，便于第一眼识别。"]} />
          <RuleBlock title="训练规则" items={["选择等级后会生成一局训练牌局。", "先操作，再看 Ace Coach 的分析和推荐思路。", "每轮完成 学习 → 判断 → 反馈 → 成长。"]} />
        </div>
      </ArenaModal>

      <ArenaModal onClose={() => setActivePanel(null)} open={activePanel === "settings"} title="设置">
        <div className="space-y-4 text-[#12395a]">
          <SettingToggle checked={settings.sound} label="音效" onChange={(sound) => updateSettings({ sound })} />
          <SettingToggle checked={settings.music} label="音乐" onChange={updateMusic} />
          {!observerMode ? <SettingToggle checked={settings.aiTips} label="AI 提示" onChange={(aiTips) => updateSettings({ aiTips })} /> : null}
          <SettingRange
            label="AI 思考时间"
            max={10}
            min={1}
            onChange={(aiThinkSeconds) => updateSettings({ aiThinkSeconds })}
            value={settings.aiThinkSeconds}
          />
          <section className="rounded-2xl bg-[#f3f9ff] p-5 text-base font-bold leading-7 text-[#345f78]">
            AI 思考时间会立即作用到当前倒计时，并自动保存。暂停会保留当前行动，恢复后继续倒计时。牌面固定 100%，训练场不提供缩放。
          </section>
        </div>
      </ArenaModal>
      {showPortraitPrompt ? <PortraitTrainingPrompt onEnter={enterLandscapeTraining} /> : null}
    </main>
  );
}

function ArenaBackground() {
  return (
    <div aria-hidden className="absolute inset-0">
      <Image
        alt=""
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src="/assets/arena/sky-training-arena.png"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(59,170,244,0.10)_55%,rgba(44,139,214,0.22))]" />
    </div>
  );
}

function ObserverHandTools({
  hasStraightFlush: straightFlush,
  isAIThinking,
  onOrganize,
  onSkipAIWait,
  organized,
  onRestore,
  restoreEnabled,
  skipLabel = "跳过 AI"
}: {
  hasStraightFlush: boolean;
  isAIThinking: boolean;
  onOrganize: () => void;
  onSkipAIWait: () => void;
  organized: boolean;
  onRestore: () => void;
  restoreEnabled: boolean;
  skipLabel?: string;
}) {
  return (
    <div className="training-observer-tools absolute bottom-[1.8%] left-1/2 z-[115] flex w-[min(1080px,calc(100vw-2rem))] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-white/45 bg-[#083b42]/90 px-5 py-3 text-white shadow-[0_12px_30px_rgba(4,48,62,0.3)] backdrop-blur-xl max-lg:gap-2 max-lg:px-3 max-lg:py-2">
      <div className="flex min-w-[110px] items-center gap-3 border-r border-white/20 pr-5 max-lg:min-w-0 max-lg:gap-1.5 max-lg:pr-2">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#ff9d22] text-lg font-black text-white max-lg:h-8 max-lg:w-8 max-lg:text-sm">倍</span>
        <span className="text-2xl font-black max-lg:text-lg">1</span>
      </div>
      <div className="flex min-w-[300px] flex-1 items-center justify-center gap-3 border-r border-white/20 pr-5 text-base font-black max-lg:min-w-0 max-lg:gap-1 max-lg:pr-2 max-lg:text-xs">
        <span>同花顺</span>
        <span className="text-2xl text-white/85 max-lg:text-lg">♠</span>
        <span className="text-2xl text-[#ff7f8e] max-lg:text-lg">♥</span>
        <span className="text-2xl text-white/85 max-lg:text-lg">♣</span>
        <span className="text-2xl text-[#ff7f8e] max-lg:text-lg">♦</span>
        {straightFlush ? <span className="ml-1 text-[#8ff0c7]">已成</span> : null}
      </div>
      <button
        aria-label={restoreEnabled ? "恢复理牌前手牌" : "先点击理牌后再恢复"}
        className={cn(
          "flex min-w-[128px] items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-base font-black max-lg:min-w-0 max-lg:px-3 max-lg:py-2 max-lg:text-xs",
          restoreEnabled
            ? "bg-[#6676e8] text-white shadow-[0_6px_14px_rgba(69,77,190,0.3)] transition hover:-translate-y-0.5"
            : "cursor-not-allowed bg-[#6676e8]/75 text-white/80"
        )}
        disabled={!restoreEnabled}
        onClick={onRestore}
        title={restoreEnabled ? "恢复理牌前手牌" : "先点击理牌后再恢复"}
        type="button"
      >
        <span className="material-symbols-outlined text-[19px]">{restoreEnabled ? "undo" : "lock"}</span>
        恢复
      </button>
      <button
        className="min-w-[170px] rounded-xl bg-[#6676e8] px-6 py-3 text-base font-black shadow-[0_6px_14px_rgba(69,77,190,0.3)] transition hover:-translate-y-0.5 max-lg:min-w-0 max-lg:px-3 max-lg:py-2 max-lg:text-xs"
        onClick={onOrganize}
        type="button"
      >
        理牌
      </button>
      {isAIThinking && (
        <button
          className="min-w-[120px] rounded-xl border border-white/40 bg-white/15 px-5 py-3 text-base font-black text-white transition hover:bg-white/24 max-lg:min-w-0 max-lg:px-3 max-lg:py-2 max-lg:text-xs"
          onClick={onSkipAIWait}
          type="button"
        >
          {skipLabel}
        </button>
      )}
    </div>
  );
}

function hasStraightFlush(cards: Card[]) {
  const suitRanks = new Map<string, number[]>();

  for (const card of cards) {
    if (card.isJoker) continue;
    const ranks = suitRanks.get(card.suit) ?? [];
    if (!ranks.includes(card.rank)) ranks.push(card.rank);
    suitRanks.set(card.suit, ranks);
  }

  return [...suitRanks.values()].some((ranks) => {
    const sorted = ranks.sort((a, b) => a - b);
    let run = 1;
    for (let index = 1; index < sorted.length; index += 1) {
      run = sorted[index] === sorted[index - 1] + 1 ? run + 1 : 1;
      if (run >= 5) return true;
    }
    return false;
  });
}

function FloatingArenaControls({
  cardCounterVisible,
  isFullscreen,
  observerMode,
  onOpenCoach,
  onOpenRules,
  onOpenSettings,
  onToggleCardCounter,
  onToggleFullscreen,
  tipsEnabled
}: {
  cardCounterVisible: boolean;
  isFullscreen: boolean;
  observerMode: boolean;
  onOpenCoach: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onToggleCardCounter: () => void;
  onToggleFullscreen: () => void;
  tipsEnabled: boolean;
}) {
  return (
    <div className={cn("training-floating-controls absolute right-4 top-4 z-[92] hidden items-center gap-2", observerMode && "[&>button:first-child]:hidden")}>
      <FloatingControlButton active={tipsEnabled} icon="psychology" label="AI Coach" onClick={onOpenCoach} />
      <FloatingControlButton icon="menu_book" label="训练规则" onClick={onOpenRules} />
      <FloatingControlButton icon="settings" label="设置" onClick={onOpenSettings} />
      <FloatingControlButton active={cardCounterVisible} icon="casino" label="记牌器" onClick={onToggleCardCounter} />
      <FloatingControlButton
        active={isFullscreen}
        icon={isFullscreen ? "fullscreen_exit" : "fullscreen"}
        label={isFullscreen ? "退出全屏" : "进入全屏"}
        onClick={onToggleFullscreen}
      />
    </div>
  );
}

function FloatingControlButton({
  active = false,
  icon,
  label,
  onClick
}: {
  active?: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "grid h-12 w-12 place-items-center rounded-2xl border border-white/75 bg-white/82 text-[#12395a] shadow-[0_12px_26px_rgba(28,109,172,0.18)] backdrop-blur-xl transition active:scale-[0.97]",
        active && "bg-[#0f64ff] text-white ring-2 ring-white/70"
      )}
      onClick={onClick}
      title={label}
      type="button"
    >
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
    </button>
  );
}

function PortraitTrainingPrompt({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="fixed inset-0 z-[150] grid place-items-center bg-[#eef7fb]/96 p-6 text-center text-[#12395a] backdrop-blur-xl">
      <div className="w-full max-w-sm rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_24px_70px_rgba(42,132,196,0.20)]">
        <span className="material-symbols-outlined mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf5ff] text-[30px] text-[#0f64ff]">
          screen_rotation
        </span>
        <h2 className="mt-4 text-2xl font-black">请旋转手机横屏体验 AI 掼蛋训练</h2>
        <p className="mt-3 text-sm font-bold leading-6 text-[#47708a]">
          横屏会放大手牌、固定操作区，并让 Coach 提示不遮挡牌桌。
        </p>
        <button
          className="mt-5 min-h-12 w-full rounded-full bg-[#0f64ff] px-5 text-base font-black text-white shadow-[0_14px_30px_rgba(15,100,255,0.26)]"
          onClick={onEnter}
          type="button"
        >
          进入横屏训练
        </button>
      </div>
    </div>
  );
}

function ArenaTopBar({
  isFullscreen,
  isPaused,
  levelRank,
  observerMode,
  onBackToLobby,
  onOpenCoach,
  onOpenRules,
  onOpenReport,
  onOpenSettings,
  onToggleFullscreen,
  onTogglePause,
  phase
}: {
  isFullscreen: boolean;
  isPaused: boolean;
  levelRank: string;
  observerMode: boolean;
  onBackToLobby: () => void;
  onOpenCoach: () => void;
  onOpenRules: () => void;
  onOpenReport?: () => void;
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
  onTogglePause: () => void;
  phase: TrainingPhase;
}) {
  return (
    <header className="training-arena-topbar absolute inset-x-0 top-0 z-[80] h-[84px] border-b border-white/20 bg-[#d7f3ff]/28 shadow-[0_10px_32px_rgba(34,122,187,0.10)] backdrop-blur-md">
      <div className="training-desktop-hud flex h-full items-center justify-between gap-3 px-4 lg:px-7">
        <div className="relative flex h-[82px] w-[360px] shrink-0 items-center rounded-br-[28px] bg-white/76 pl-7 shadow-[0_10px_24px_rgba(37,126,191,0.14)] max-lg:w-[220px] max-lg:pl-4">
          <div>
            <p className="whitespace-nowrap text-[24px] font-black leading-7 text-[#f6b42d] max-lg:text-[18px]">
              Ace <span className="text-[#12395a]">掼蛋记牌训练空间</span>
            </p>
            <p className="mt-1 text-[10px] font-black text-[#255675] max-lg:line-clamp-2 max-lg:max-w-[185px]">
              AI Coach 陪你完成每一轮牌局决策。
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 rounded-full bg-white/34 px-3 py-2 text-base font-black text-[#12395a] shadow-[0_10px_24px_rgba(52,142,207,0.14)] backdrop-blur-xl md:flex max-lg:gap-1 max-lg:px-2">
          <LevelCardBadge levelRank={levelRank} />
          <span className="ml-2 rounded-full bg-[#12395a]/88 px-3 py-1 text-xs text-white max-lg:hidden">{observerMode ? "观察模式 · AI 自动行动" : phaseText[phase]}</span>
        </div>

        <nav className="flex min-w-0 items-center gap-3 max-lg:gap-2">
          {!observerMode && <HudButton icon="◉" label="AI Coach" onClick={onOpenCoach} />}
          {!observerMode && <HudButton icon="ⓘ" label="规则" onClick={onOpenRules} />}
          {observerMode && onOpenReport ? <HudButton icon="▤" label="复盘报告" onClick={onOpenReport} /> : null}
          <HudButton icon="⚙" label="设置" onClick={onOpenSettings} />
          <HudButton icon={isPaused ? "▶" : "Ⅱ"} label={isPaused ? "继续" : "暂停"} onClick={onTogglePause} />
          {!observerMode && (
            <button
              aria-label={isFullscreen ? "退出全屏" : "进入全屏"}
              className="grid h-12 w-12 place-items-center rounded-full bg-white/42 text-[#12395a] shadow-[0_10px_24px_rgba(52,142,207,0.14)] backdrop-blur-xl transition hover:-translate-y-0.5"
              onClick={onToggleFullscreen}
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">
                {isFullscreen ? "fullscreen_exit" : "fullscreen"}
              </span>
            </button>
          )}
          <button
            aria-label={observerMode ? "返回训练列表" : "退出房间"}
            className="flex h-12 items-center gap-1.5 rounded-full bg-[#0f64ff] px-6 text-base font-black text-white shadow-[0_14px_30px_rgba(15,100,255,0.28)] transition hover:-translate-y-0.5 max-lg:px-4"
            onClick={onBackToLobby}
            type="button"
          >
            <span className="material-symbols-outlined text-[21px]">arrow_back</span>
            <span>{observerMode ? "返回训练" : "退出房间"}</span>
          </button>
        </nav>
      </div>
      <div className="training-landscape-hud hidden h-full items-center justify-between gap-2">
        <button aria-label="返回训练列表" className="training-hud-icon" onClick={onBackToLobby} type="button">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="training-hud-stat">
          <span className="text-white/65">级牌</span>
          <strong>{levelRank}</strong>
        </div>
        <div className="training-hud-stat">
          <span className="text-white/65">局数</span>
          <strong>第 1 局</strong>
        </div>
        <div className="training-hud-status min-w-0 flex-1">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#77f2bd]" />
          <strong className="truncate">{observerMode ? "观察模式 · AI 自动行动" : phaseText[phase]}</strong>
        </div>
        <button aria-label={isPaused ? "继续" : "暂停"} className="training-hud-icon" onClick={onTogglePause} type="button">
          <span className="material-symbols-outlined">{isPaused ? "play_arrow" : "pause"}</span>
        </button>
        <button aria-label="设置" className="training-hud-icon" onClick={onOpenSettings} type="button">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
}

function LevelCardBadge({ levelRank }: { levelRank: string }) {
  return (
    <section className="mr-1 flex items-center gap-2 rounded-xl border-2 border-[#f2c24c]/90 bg-white/95 px-2.5 py-2 text-[#12395a] shadow-[0_10px_24px_rgba(164,105,0,0.22)] backdrop-blur">
      {[["我方", levelRank], ["对方", levelRank]].map(([label, rank]) => (
        <div className="flex items-center gap-1.5" key={label}>
          <p className="whitespace-nowrap text-xs font-black text-[#9a6800]">{label}</p>
          <div className="relative grid h-11 w-11 place-items-center rounded-lg border-2 border-[#f2c24c] bg-white text-2xl font-black text-[#0f172a] shadow-[0_5px_12px_rgba(164,105,0,0.16)]">
            {rank}
          </div>
        </div>
      ))}
    </section>
  );
}

const phaseText: Record<TrainingPhase, string> = {
  idle: "准备",
  playing: "训练中",
  analysis: "分析中",
  completed: "完成"
};

function HudButton({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <button
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/42 px-5 text-sm font-black text-[#12395a] shadow-[0_10px_24px_rgba(52,142,207,0.14)] backdrop-blur-xl transition hover:-translate-y-0.5 max-lg:w-11 max-lg:px-0"
      onClick={onClick}
      type="button"
    >
      <span>{icon}</span>
      <span className="max-lg:sr-only">{label}</span>
    </button>
  );
}

function AnalysisPanel({ reason, status }: { reason: string; status: string }) {
  return (
    <section className="rounded-[20px] border border-white/40 bg-[#236fa8]/40 px-5 py-3 shadow-[0_18px_42px_rgba(35,112,178,0.16)] backdrop-blur-xl">
      <p className="text-[20px] font-black">{status}</p>
      <p className="mt-1 line-clamp-2 text-sm font-bold text-white/86">{reason}</p>
    </section>
  );
}

function ArenaModal({
  children,
  onClose,
  open,
  title
}: {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
}) {
  if (!open) return null;

  return (
    <div className="training-arena-modal fixed inset-0 z-[120] grid place-items-center bg-[#08233d]/34 p-5 backdrop-blur-sm">
      <section className="training-arena-modal-panel max-h-[86vh] w-[min(640px,92vw)] overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_24px_70px_rgba(8,35,61,0.30)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#12395a]">{title}</h2>
          <button
            className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf5ff] text-xl font-black text-[#12395a]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function RuleBlock({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="rounded-2xl bg-[#f3f9ff] p-5">
      <h3 className="text-lg font-black text-[#12395a]">{title}</h3>
      <ul className="mt-3 space-y-2 text-base leading-7">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </section>
  );
}

function SettingToggle({
  checked,
  label,
  onChange
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#f3f9ff] p-5 text-lg font-black">
      {label}
      <button
        aria-pressed={checked}
        className={cn(
          "relative h-8 w-14 rounded-full transition",
          checked ? "bg-[#0f64ff]" : "bg-[#9fbfd2]"
        )}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span
          className={cn(
            "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
            checked ? "left-7" : "left-1"
          )}
        />
      </button>
    </div>
  );
}

function SettingRange({
  label,
  max,
  min,
  onChange,
  value
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="block rounded-2xl bg-[#f3f9ff] p-5">
      <span className="flex items-center justify-between text-lg font-black">
        <span>{label}</span>
        <span className="rounded-full bg-white px-3 py-1 text-base text-[#0f64ff]">{value} 秒</span>
      </span>
      <input
        aria-label={label}
        className="mt-4 w-full accent-[#0f64ff]"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
    </label>
  );
}

function CoachTeachingContent({
  message,
  reason,
  suggestion,
  observerMode = false
}: {
  message: string;
  reason: string;
  suggestion: string;
  observerMode?: boolean;
}) {
  return (
    <article className="space-y-5 text-[#12395a]">
      <section className="rounded-2xl bg-[#f3f9ff] p-5">
        <h3 className="text-xl font-black">Ace Coach 建议</h3>
        <p className="mt-3 whitespace-pre-wrap text-lg font-bold leading-8">{message}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-[#d8ecf8]">
        <h4 className="text-lg font-black">原因</h4>
        <p className="mt-2 whitespace-pre-wrap text-base font-bold leading-7 text-[#345f78]">{reason}</p>
      </section>
      <section className="rounded-2xl bg-[#fff8df] p-5">
        <h4 className="text-lg font-black text-[#8a6500]">下一步</h4>
        <p className="mt-2 whitespace-pre-wrap text-base font-bold leading-7 text-[#6d5300]">{suggestion}</p>
      </section>
    </article>
  );
}

function formatCoachTeaching(message: string, reason: string, suggestion: string) {
  return `${message}\n原因：${reason}\n建议：${suggestion}`;
}

function roleLabel(position: string) {
  if (position === "left") return "上家";
  if (position === "right") return "下家";
  if (position === "top") return "对家";
  return "我";
}
