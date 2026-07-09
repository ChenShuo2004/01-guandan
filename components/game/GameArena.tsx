"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ActionToolbar } from "@/components/game/ActionToolbar";
import { buildCounterHint, CardCounter } from "@/components/game/CardCounter";
import { DealAnimation } from "@/components/game/DealAnimation";
import { GameTable } from "@/components/game/GameTable";
import { HandCards } from "@/components/game/HandCards";
import { useGameStore } from "@/store/gameStore";
import { smartSortCardsForGuandan } from "@/lib/cards/smartSort";
import { getRankLabel } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";
import type { AIAnalysisStatus, AIHint, TrainingPlan, TrainingReview } from "@/lib/coach/coachTypes";
import type { TrainingPhase } from "@/lib/guandan/gameState";
import type { ArenaPlayer } from "@/types/game";

type TrainingLevel = "beginner" | "intermediate" | "advanced";

interface ArenaSettings {
  aiTips: boolean;
}

type DealStage = "dealing" | "sorting" | "ready";

const trainingLevels: Array<{
  id: TrainingLevel;
  label: string;
  title: string;
}> = [
  { id: "beginner", label: "初级", title: "基础判断训练" },
  { id: "intermediate", label: "中级", title: "牌权与配合训练" },
  { id: "advanced", label: "高级", title: "残局决策训练" }
];

const defaultSettings: ArenaSettings = {
  aiTips: true
};

export function GameArena() {
  const router = useRouter();
  const [activeLevel, setActiveLevel] = useState<TrainingLevel>("beginner");
  const [dealStage, setDealStage] = useState<DealStage>("dealing");
  const [dealRunId, setDealRunId] = useState(0);
  const [settings, setSettings] = useState<ArenaSettings>(defaultSettings);
  const [smartSortActive, setSmartSortActive] = useState(false);
  const [sortPulseKey, setSortPulseKey] = useState(0);
  const [trainingGoalOpen, setTrainingGoalOpen] = useState(false);
  const [, setAiCountdown] = useState<number | null>(null);
  const aiActionKeyRef = useRef<string | null>(null);
  const aiTimerRef = useRef<number | null>(null);
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
    restart
  } = useGameStore();

  const activeTrainingLevel = useMemo(
    () => trainingLevels.find((level) => level.id === activeLevel) ?? trainingLevels[0],
    [activeLevel]
  );
  const levelRankLabel = getRankLabel(state.levelRank);
  const isDealing = dealStage !== "ready";
  const displayedUserCards = useMemo(
    () =>
      smartSortActive
        ? smartSortCardsForGuandan(userPlayer?.hand ?? [], levelRankLabel)
        : (userPlayer?.hand ?? []),
    [levelRankLabel, smartSortActive, userPlayer?.hand]
  );
  const cardCounterHint = useMemo(
    () => buildCounterHint(state.cardRemainingCount),
    [state.cardRemainingCount]
  );

  const completeAIAction = useCallback(() => {
    if (aiTimerRef.current) {
      window.clearInterval(aiTimerRef.current);
      aiTimerRef.current = null;
    }

    setAiCountdown(null);
    runAIAction();
  }, [runAIAction]);

  useEffect(() => {
    if (isDealing) return;
    if (state.trainingPhase !== "playing" || state.gameStatus !== "playing" || currentPlayer?.kind !== "ai") return;

    const actionKey = `${state.turnNumber}-${currentPlayer.id}`;
    if (aiActionKeyRef.current === actionKey) return;

    aiActionKeyRef.current = actionKey;
    const seconds = 5;
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

      if (remaining <= 0) completeAIAction();
    }, 1000);

    return () => {
      if (aiTimerRef.current) {
        window.clearInterval(aiTimerRef.current);
        aiTimerRef.current = null;
      }
    };
  }, [completeAIAction, currentPlayer?.id, currentPlayer?.kind, currentPlayer?.role, isDealing, setTurnAction, state.gameStatus, state.trainingPhase, state.turnNumber]);

  useEffect(() => {
    if (isDealing) return;
    if (state.trainingPhase !== "playing" || state.gameStatus !== "playing" || currentPlayer?.id !== "player") return;

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
  }, [currentPlayer?.id, isDealing, requestTip, setTurnAction, state.gameStatus, state.trainingPhase, state.turnNumber]);

  useEffect(() => {
    if (!state.roundComplete) return;
    const timer = window.setTimeout(clearRoundActions, 1200);
    return () => window.clearTimeout(timer);
  }, [clearRoundActions, state.roundClearKey, state.roundComplete]);

  useEffect(() => {
    const raw = window.localStorage.getItem("guandan-training-arena-settings");
    if (!raw) return;

    try {
      setSettings({
        ...defaultSettings,
        ...(JSON.parse(raw) as Partial<ArenaSettings>)
      });
    } catch {
      setSettings(defaultSettings);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("guandan-training-arena-settings", JSON.stringify(settings));
  }, [settings]);

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
              : state.turnAction.playerId === player.id
                ? state.turnAction.remainingSeconds
                : null
        };
      }),
    [
      currentPlayer?.id,
      state.gameStatus,
      state.playerActionState,
      state.players,
      state.turnAction.playerId,
      state.turnAction.remainingSeconds
    ]
  );

  const phase = state.trainingPhase;
  const analysisStatus = getCoachStatus(phase, state.coachFeedback.level, isUserTurn, currentPlayer?.kind);
  const goLobby = () => router.push("/");
  const skipAIWait = () => {
    if (currentPlayer?.kind !== "ai" || state.trainingPhase !== "playing") return;
    completeAIAction();
  };
  const restartDeal = useCallback(() => {
    restart();
    setDealStage("dealing");
    setDealRunId((value) => value + 1);
    setSmartSortActive(false);
    setSortPulseKey((value) => value + 1);
  }, [restart]);
  const completeDealAnimation = useCallback(() => {
    setDealStage("ready");
    setSmartSortActive(true);
    setSortPulseKey((value) => value + 1);
  }, []);
  const toggleSmartSort = useCallback(() => {
    if (isDealing) return;
    setSmartSortActive((active) => !active);
    setSortPulseKey((value) => value + 1);
  }, [isDealing]);
  const changeLevel = (level: TrainingLevel) => {
    setActiveLevel(level);
    restartDeal();
  };

  return (
    <main className="training-arena relative h-[100dvh] min-h-[390px] overflow-hidden bg-[#eef7fb] text-[#12395a]">
      <ArenaBackground />
      <section className="relative z-10 grid h-full grid-cols-[360px_minmax(0,1fr)] gap-4 p-4 max-lg:grid-cols-[320px_minmax(0,1fr)] max-md:grid-cols-1 max-md:overflow-y-auto">
        <CoachPanel
          activeHint={settings.aiTips ? state.activeHint : null}
          activeLevel={activeLevel}
          analysisStatus={analysisStatus}
          cardCounterHint={state.cardCounterVisible ? cardCounterHint : null}
          coachMessage={state.coachFeedback.message}
          levelRank={levelRankLabel}
          levelTitle={activeTrainingLevel.title}
          trainingGoalOpen={trainingGoalOpen}
          onBackToLobby={goLobby}
          onSelectLevel={changeLevel}
          onToggleTrainingGoal={() => setTrainingGoalOpen((open) => !open)}
          onToggleTips={() => setSettings((current) => ({ ...current, aiTips: !current.aiTips }))}
          phase={phase}
          plan={state.trainingPlan}
          review={state.trainingReview ?? state.coachFeedback.review ?? null}
          tipsEnabled={settings.aiTips}
        />

        <section className="relative min-h-0 overflow-hidden rounded-[28px] border border-white/70 bg-white/32 shadow-[0_24px_70px_rgba(42,132,196,0.22)] backdrop-blur-xl">
          <GameTable
            levelRank={levelRankLabel}
            players={arenaPlayers}
            roundActions={state.currentRoundActions}
            showTurnStatus={!isDealing}
            turnAction={state.turnAction}
          />

          <CardCounter counts={state.cardRemainingCount} levelRank={levelRankLabel} visible={state.cardCounterVisible} />

          <section className="training-hand-dock absolute bottom-1 left-1 right-1 z-[60] min-w-0 lg:left-3 lg:right-3">
            {!isDealing ? (
              <ActionToolbar
              canAct={isUserTurn}
              cardCounterVisible={state.cardCounterVisible}
              isAIThinking={currentPlayer?.kind === "ai" && state.trainingPhase === "playing"}
              onBackToLobby={goLobby}
              onContinue={continueTraining}
              onPass={pass}
              onPlay={playSelectedCards}
              onRestart={restartDeal}
              onShowSolution={showSolution}
              onStart={continueTraining}
              onTip={requestTip}
              onToggleCardCounter={toggleCardCounter}
              onUndo={clearSelectedCards}
              onSkipAIWait={skipAIWait}
              phase={phase}
              selectedCount={state.selectedCards.length}
              />
            ) : null}
            {!isDealing ? (
              <HandCards
              cards={displayedUserCards}
              disabled={!isUserTurn || isDealing}
              invalidCardIds={state.invalidCardIds}
              invalidPulseKey={state.invalidPulseKey}
              levelRank={levelRankLabel}
              onSelectionChange={setSelectedCards}
              onSelectCard={selectCard}
              selectedCardIds={selectedCardIds}
              sortPulseKey={sortPulseKey}
              variant="arena"
              />
            ) : null}
          </section>

          <SmartSortButton active={smartSortActive} disabled={isDealing} onClick={toggleSmartSort} />
          <DealAnimation
            active={isDealing}
            cardCount={state.players.reduce((count, player) => count + player.hand.length, 0)}
            key={dealRunId}
            onComplete={completeDealAnimation}
            onStageChange={setDealStage}
          />
        </section>
      </section>
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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.40),rgba(210,239,255,0.24)_48%,rgba(37,130,205,0.16))]" />
    </div>
  );
}

function activeLevelLabel(levelId: TrainingLevel) {
  return trainingLevels.find((level) => level.id === levelId)?.label ?? "当前";
}

function CoachPanel({
  activeHint,
  activeLevel,
  analysisStatus,
  cardCounterHint,
  coachMessage,
  levelRank,
  levelTitle,
  trainingGoalOpen,
  onBackToLobby,
  onSelectLevel,
  onToggleTrainingGoal,
  onToggleTips,
  phase,
  plan,
  review,
  tipsEnabled
}: {
  activeHint: AIHint | null;
  activeLevel: TrainingLevel;
  analysisStatus: AIAnalysisStatus;
  cardCounterHint: string | null;
  coachMessage: string;
  levelRank: string;
  levelTitle: string;
  trainingGoalOpen: boolean;
  onBackToLobby: () => void;
  onSelectLevel: (level: TrainingLevel) => void;
  onToggleTrainingGoal: () => void;
  onToggleTips: () => void;
  phase: TrainingPhase;
  plan: TrainingPlan;
  review: TrainingReview | null;
  tipsEnabled: boolean;
}) {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white/78 shadow-[0_24px_70px_rgba(42,132,196,0.18)] backdrop-blur-xl">
      <div className="border-b border-[#d9edf8] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#34749c]">AI Coach Training</p>
            <h1 className="mt-1 text-2xl font-black text-[#12395a]">掼蛋训练场</h1>
            <div className="mt-2 flex items-center gap-3">
              <p className="text-sm font-bold text-[#47708a]">{levelTitle}</p>
              <LevelRankPill levelRank={levelRank} />
            </div>
          </div>
          <button
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eaf5ff] text-[#12395a] shadow-sm transition hover:-translate-y-0.5"
            onClick={onBackToLobby}
            title="返回"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {trainingLevels.map((level) => (
            <button
              className={cn(
                "h-9 flex-1 rounded-full text-sm font-black transition",
                activeLevel === level.id
                  ? "bg-[#0f64ff] text-white shadow-[0_10px_24px_rgba(15,100,255,0.22)]"
                  : "bg-[#eaf5ff] text-[#255675] hover:bg-white"
              )}
              key={level.id}
              onClick={() => onSelectLevel(level.id)}
              type="button"
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <section className="flex items-center gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#eaf5ff] shadow-[0_12px_28px_rgba(42,132,196,0.16)]">
            <Image
              alt="Ace Coach"
              className="object-cover p-1"
              fill
              sizes="64px"
              src={analysisStatus === "warning" ? "/assets/coach/coach-analysis-mode.png" : "/assets/coach/coach-bubble-hologram.png"}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-[#12395a]">Ace Coach</p>
            <StatusPill status={analysisStatus} />
            <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-[#47708a]">{coachMessage}</p>
          </div>
        </section>

        {trainingGoalOpen ? (
          <TrainingPlanCard onCollapse={onToggleTrainingGoal} plan={plan} />
        ) : (
          <button
            className="flex h-12 w-full items-center justify-between rounded-2xl border border-[#d8ecf8] bg-[#f6fbff] px-4 text-sm font-black text-[#12395a] shadow-sm transition hover:-translate-y-0.5"
            onClick={onToggleTrainingGoal}
            type="button"
          >
            {activeLevelLabel(activeLevel)}训练目的
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
        )}

        <HintCard activeHint={activeHint} tipsEnabled={tipsEnabled} />

        {cardCounterHint ? (
          <section className="rounded-2xl bg-[#f6fbff] p-4 ring-1 ring-[#d8ecf8]">
            <p className="text-sm font-black text-[#12395a]">记牌提醒</p>
            <p className="mt-2 text-sm font-bold leading-6 text-[#47708a]">{cardCounterHint}</p>
          </section>
        ) : null}

        {phase === "completed" && review ? <ReviewCard review={review} /> : null}
      </div>

      <div className="border-t border-[#d9edf8] p-4">
        <button
          aria-pressed={tipsEnabled}
          className="flex h-11 w-full items-center justify-between rounded-full bg-[#eaf5ff] px-4 text-sm font-black text-[#12395a]"
          onClick={onToggleTips}
          type="button"
        >
          AI 关键提醒
          <span className={cn("h-6 w-11 rounded-full p-1 transition", tipsEnabled ? "bg-[#0f64ff]" : "bg-[#9fbfd2]")}>
            <span className={cn("block h-4 w-4 rounded-full bg-white transition", tipsEnabled ? "translate-x-5" : "translate-x-0")} />
          </span>
        </button>
      </div>
    </aside>
  );
}

function LevelRankPill({ levelRank }: { levelRank: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#f2c24c]/90 bg-white px-3 py-1.5 text-[#12395a] shadow-[0_8px_18px_rgba(164,105,0,0.14)]">
      <span className="text-xs font-black text-[#9a6800]">本局级牌</span>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl border-2 border-[#f2c24c] bg-white text-xl font-black text-[#0f172a]">
        {levelRank}
        <span className="absolute -right-1.5 -top-1.5 rounded bg-[#ffd76a] px-1 text-[9px] leading-4 text-[#7a4a00]">
          级
        </span>
      </span>
    </span>
  );
}

function TrainingPlanCard({
  onCollapse,
  plan
}: {
  onCollapse: () => void;
  plan: TrainingPlan;
}) {
  return (
    <section className="rounded-2xl bg-[#12395a] p-4 text-white shadow-[0_16px_32px_rgba(18,57,90,0.20)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-white/62">今日训练目标</p>
        <button
          className="rounded-full bg-white/14 px-2.5 py-1 text-xs font-black text-white"
          onClick={onCollapse}
          type="button"
        >
          隐藏
        </button>
      </div>
      <span className="mt-3 inline-flex rounded-full bg-white/14 px-2.5 py-1 text-xs font-black">
        {plan.estimatedMinutes} 分钟
      </span>
      <h2 className="mt-3 text-xl font-black leading-7">{plan.goal}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {plan.recommendedContent.map((item) => (
          <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-black" key={item}>
            {item}
          </span>
        ))}
      </div>
      <ul className="mt-3 space-y-2 text-sm font-bold leading-6 text-white/82">
        {plan.focusProblems.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </section>
  );
}

function HintCard({ activeHint, tipsEnabled }: { activeHint: AIHint | null; tipsEnabled: boolean }) {
  if (!tipsEnabled) {
    return (
      <section className="rounded-2xl bg-[#f6fbff] p-4 text-sm font-bold leading-6 text-[#47708a] ring-1 ring-[#d8ecf8]">
        AI 关键提醒已关闭。牌桌仍会记录你的训练动作。
      </section>
    );
  }

  if (!activeHint) {
    return (
      <section className="rounded-2xl bg-[#f6fbff] p-4 text-sm font-bold leading-6 text-[#47708a] ring-1 ring-[#d8ecf8]">
        Ace Coach 正在观察牌局，只在关键节点提醒。
      </section>
    );
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-4 shadow-[0_16px_34px_rgba(42,132,196,0.16)] ring-1",
        activeHint.type === "warning" && "bg-[#fff4e5] ring-[#ffd7a3]",
        activeHint.type === "suggestion" && "bg-[#f1f7ff] ring-[#cfe5ff]",
        activeHint.type === "analysis" && "bg-[#f6fbff] ring-[#d8ecf8]",
        activeHint.type === "encourage" && "bg-[#eefbf4] ring-[#c7efd7]"
      )}
      initial={{ opacity: 0, y: 10 }}
      key={activeHint.id}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-full text-white",
            activeHint.type === "warning" && "bg-[#f59e0b]",
            activeHint.type === "suggestion" && "bg-[#0f64ff]",
            activeHint.type === "analysis" && "bg-[#12395a]",
            activeHint.type === "encourage" && "bg-[#16a34a]"
          )}
        >
          <span className="material-symbols-outlined text-[19px]">{hintIcon[activeHint.type]}</span>
        </span>
        <div className="min-w-0">
          <p className="text-base font-black text-[#12395a]">{activeHint.title}</p>
          <p className="mt-2 text-sm font-bold leading-6 text-[#345f78]">{activeHint.content}</p>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-[#6b8aa0]">为什么</p>
          <p className="mt-1 text-sm font-bold leading-6 text-[#47708a]">{activeHint.reason}</p>
          {activeHint.action ? (
            <p className="mt-3 rounded-xl bg-white/72 px-3 py-2 text-sm font-black leading-6 text-[#12395a]">
              {activeHint.action}
            </p>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}

function ReviewCard({ review }: { review: TrainingReview }) {
  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-[#d8ecf8]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-[#12395a]">本局复盘</p>
        <span className="rounded-full bg-[#0f64ff] px-3 py-1 text-sm font-black text-white">{review.score} 分</span>
      </div>
      <p className="mt-2 text-sm font-bold leading-6 text-[#47708a]">{review.summary}</p>
      <ReviewList title="正确操作" items={review.correctMoves} />
      <ReviewList title="错误操作" items={review.mistakes} />
      <ReviewList title="下一阶段" items={review.nextPlan} />
    </section>
  );
}

function ReviewList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="mt-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#6b8aa0]">{title}</p>
      <ul className="mt-1 space-y-1 text-sm font-bold leading-6 text-[#47708a]">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}

function StatusPill({ status }: { status: AIAnalysisStatus }) {
  return (
    <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ff] px-2.5 py-1 text-xs font-black text-[#0f64a0]">
      <span className={cn("h-2 w-2 rounded-full", status === "warning" ? "bg-[#f59e0b]" : "bg-[#0f64ff]")} />
      {statusLabel[status]}
    </span>
  );
}

function SmartSortButton({
  active,
  disabled,
  onClick
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "absolute bottom-6 right-6 z-[88] inline-flex h-16 min-w-36 items-center justify-center gap-2 rounded-2xl border px-5 text-base font-black shadow-[0_18px_38px_rgba(15,100,255,0.26)] backdrop-blur-xl transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 max-lg:bottom-4 max-lg:right-4 max-lg:h-14 max-lg:min-w-0 max-lg:px-4",
        active
          ? "border-[#ffd36d] bg-[#ffe08a]/95 text-[#755000]"
          : "border-white/72 bg-[#0f64ff]/92 text-white"
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="material-symbols-outlined text-[22px]">sort</span>
      <span className="max-lg:hidden">{active ? "恢复原序" : "智能理牌"}</span>
    </button>
  );
}

function getCoachStatus(
  phase: TrainingPhase,
  level: "low" | "medium" | "high",
  isUserTurn: boolean,
  currentKind?: "human" | "ai"
): AIAnalysisStatus {
  if (phase === "completed") return "reviewing";
  if (level === "high") return "warning";
  if (isUserTurn) return "thinking";
  if (currentKind === "ai") return "watching";
  return "planning";
}

function roleLabel(position: string) {
  if (position === "left") return "上家";
  if (position === "right") return "下家";
  if (position === "top") return "对家";
  return "我方";
}

const statusLabel: Record<AIAnalysisStatus, string> = {
  idle: "待命",
  planning: "规划中",
  watching: "观察牌局",
  thinking: "分析出牌",
  warning: "关键提醒",
  reviewing: "复盘中"
};

const hintIcon: Record<AIHint["type"], string> = {
  warning: "warning",
  suggestion: "tips_and_updates",
  analysis: "psychology",
  encourage: "check_circle"
};
