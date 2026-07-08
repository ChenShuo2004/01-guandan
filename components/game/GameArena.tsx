"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ActionButtons } from "@/components/game/ActionButtons";
import { CardSortButton } from "@/components/game/CardSort";
import { CoachAvatar } from "@/components/game/CoachAvatar";
import { CoachBubble } from "@/components/game/CoachBubble";
import { GameTable } from "@/components/game/GameTable";
import { HandCards } from "@/components/game/HandCards";
import { ScorePanel } from "@/components/game/ScorePanel";
import { useGameStore } from "@/store/gameStore";
import type { TrainingPhase } from "@/lib/guandan/gameState";
import type { ArenaPlayer } from "@/types/game";

export function GameArena() {
  const router = useRouter();
  const [showGoal, setShowGoal] = useState(false);
  const {
    state,
    currentPlayer,
    userPlayer,
    selectedCardIds,
    isUserTurn,
    startTraining,
    continueTraining,
    selectCard,
    setSelectedCards,
    sortHand,
    playSelectedCards,
    pass,
    requestTip,
    showSolution,
    runAIAction,
    restart
  } = useGameStore();

  useEffect(() => {
    if (state.trainingPhase !== "playing" || state.gameStatus !== "playing" || currentPlayer?.kind !== "ai") return;

    const timer = window.setTimeout(() => {
      runAIAction();
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [currentPlayer?.id, currentPlayer?.kind, runAIAction, state.gameStatus, state.trainingPhase, state.turnNumber]);

  const arenaPlayers = useMemo(
    () =>
      state.players.map<ArenaPlayer>((player) => ({
        id: player.id,
        name: player.name,
        role: player.role,
        position: player.seat,
        cardCount: player.hand.length,
        score: player.score,
        isUser: player.id === "player",
        status:
          state.gameStatus === "finished"
            ? "waiting"
            : currentPlayer?.id === player.id
              ? player.kind === "ai"
                ? "thinking"
                : "active"
              : player.passed
                ? "passed"
                : "waiting"
      })),
    [currentPlayer?.id, state.gameStatus, state.players]
  );

  const phase = state.trainingPhase;
  const winner = state.winner ? state.players.find((player) => player.id === state.winner) : null;
  const roundLabel = winner ? `${winner.role} 率先出完` : `第 ${state.turnNumber} 手 · ${currentPlayer?.role ?? "等待"}`;
  const goLobby = () => router.push("/");

  return (
    <main className="training-arena relative min-h-screen overflow-hidden bg-[#eaf8ff] text-[#12395a]">
      <ArenaBackdrop />

      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="training-arena-shell relative z-10 mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-4 py-3 lg:px-7"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <ArenaHeader
          onBackToLobby={goLobby}
          onRestart={restart}
          onShowGoal={() => setShowGoal((current) => !current)}
          phase={phase}
          roundLabel={roundLabel}
        />

        <div className="relative flex flex-1 gap-4 pb-[154px] pt-3 lg:pb-[166px]">
          <section className="training-arena-stage relative min-h-[610px] flex-1 lg:min-h-[710px]">
            <GameTable players={arenaPlayers} tableCards={state.lastPlayedCards} />

            <AnimatePresence>
              {phase === "idle" || showGoal ? (
                <TrainingGoalPanel
                  onClose={phase === "idle" ? undefined : () => setShowGoal(false)}
                  onStart={startTraining}
                  phase={phase}
                />
              ) : null}
            </AnimatePresence>

            <div className="absolute bottom-[16%] left-1/2 z-40 flex -translate-x-1/2 items-end gap-3">
              <CoachAvatar mood={state.coachFeedback.type === "mistake" ? "warning" : isUserTurn ? "teaching" : "thinking"} />
              <CoachBubble feedback={state.coachFeedback} />
            </div>
          </section>

          <aside className="hidden w-[196px] shrink-0 flex-col gap-4 xl:flex">
            <ScorePanel players={state.players} turnNumber={state.turnNumber} />
            <ActionButtons
              canAct={isUserTurn}
              onBackToLobby={goLobby}
              onContinue={continueTraining}
              onPass={pass}
              onPlay={playSelectedCards}
              onRestart={restart}
              onShowSolution={showSolution}
              onSortHand={sortHand}
              onStart={startTraining}
              onTip={requestTip}
              phase={phase}
              selectedCount={state.selectedCards.length}
            />
          </aside>
        </div>

        <section className="training-hand-dock fixed inset-x-3 bottom-3 z-50 mx-auto max-w-[1080px] lg:bottom-4">
          <div className="mb-2 flex items-center justify-center gap-3 text-sm font-black text-[#11476c]">
            <span className="rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-[0_10px_28px_rgba(42,132,196,0.16)] backdrop-blur">
              我 · 剩余 {userPlayer?.hand.length ?? 0} 张
            </span>
            <span className="hidden rounded-full border border-[#8ddcff]/80 bg-white/55 px-4 py-2 shadow-inner backdrop-blur sm:inline-flex">
              {phase === "idle"
                ? "先开始训练"
                : phase === "analysis"
                  ? "查看分析后继续"
                  : isUserTurn
                    ? "本轮可出牌"
                    : `等待 ${currentPlayer?.role ?? "AI"}`}
            </span>
            {phase === "playing" ? (
              <CardSortButton disabled={!isUserTurn || !userPlayer?.hand.length} onClick={sortHand} />
            ) : null}
          </div>
          <HandCards
            cards={userPlayer?.hand ?? []}
            disabled={!isUserTurn}
            invalidCardIds={state.invalidCardIds}
            invalidPulseKey={state.invalidPulseKey}
            onSelectionChange={setSelectedCards}
            onSelectCard={selectCard}
            selectedCardIds={selectedCardIds}
          />
          <AnimatePresence>
            {isUserTurn && selectedCardIds.length > 0 ? (
              <motion.button
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute bottom-[calc(100%+10px)] left-1/2 z-[70] flex h-14 min-w-[154px] -translate-x-1/2 items-center justify-center rounded-full border border-[#ffe891]/90 bg-[#ffd84d] px-6 py-3 text-base font-black text-[#684900] shadow-[0_0_24px_rgba(255,216,77,0.58),0_18px_38px_rgba(0,0,0,0.28)] transition active:scale-[0.98]"
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                onClick={playSelectedCards}
                type="button"
              >
                提交出牌 {selectedCardIds.length}
              </motion.button>
            ) : null}
          </AnimatePresence>
        </section>

        {phase !== "idle" ? (
          <div className="training-action-dock fixed bottom-4 right-3 z-[60] flex w-[150px] flex-col gap-3 xl:hidden">
            <ActionButtons
              canAct={isUserTurn}
              compact
              onBackToLobby={goLobby}
              onContinue={continueTraining}
              onPass={pass}
              onPlay={playSelectedCards}
              onRestart={restart}
              onShowSolution={showSolution}
              onSortHand={sortHand}
              onStart={startTraining}
              onTip={requestTip}
              phase={phase}
              selectedCount={state.selectedCards.length}
            />
          </div>
        ) : null}
      </motion.section>
    </main>
  );
}

function ArenaHeader({
  onBackToLobby,
  onRestart,
  onShowGoal,
  phase,
  roundLabel
}: {
  onBackToLobby: () => void;
  onRestart: () => void;
  onShowGoal: () => void;
  phase: TrainingPhase;
  roundLabel: string;
}) {
  return (
    <header className="relative z-30 flex items-center justify-between gap-3 rounded-[30px] border border-white/65 bg-white/48 px-4 py-3 shadow-[0_18px_45px_rgba(48,150,220,0.16)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffd84d] via-[#ffeb8c] to-[#4bb8ff] text-xl font-black text-white shadow-[0_10px_26px_rgba(75,184,255,0.35)]">
          Ace
        </div>
        <div>
          <h1 className="text-lg font-black leading-tight text-[#12395a]">掼蛋训练空间</h1>
          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#47799b]">AI Guandan Training Arena</p>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/48 px-5 py-2 text-sm font-black text-[#225b81] shadow-inner md:flex">
        <span>{phaseLabel[phase]}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#4bb8ff]" />
        <span>{roundLabel}</span>
      </div>

      <nav className="flex items-center gap-2">
        <HeaderButton label="训练目标" onClick={onShowGoal} />
        <HeaderButton label="重新训练" onClick={onRestart} />
        <button
          className="rounded-full bg-[#0f64ff] px-5 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,100,255,0.28)] transition hover:-translate-y-0.5"
          onClick={onBackToLobby}
          type="button"
        >
          返回大厅
        </button>
      </nav>
    </header>
  );
}

const phaseLabel: Record<TrainingPhase, string> = {
  idle: "准备开始",
  playing: "训练中",
  analysis: "AI 分析",
  completed: "训练完成"
};

function HeaderButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      className="rounded-full border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-black text-[#17496d] shadow-[0_8px_20px_rgba(76,155,205,0.14)] transition hover:-translate-y-0.5 hover:bg-white/85"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function TrainingGoalPanel({
  onClose,
  onStart,
  phase
}: {
  onClose?: () => void;
  onStart: () => void;
  phase: TrainingPhase;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed left-1/2 top-[12%] z-[90] w-[min(92vw,520px)] -translate-x-1/2 rounded-[28px] border border-white/70 bg-[#12395a]/88 p-6 text-white shadow-[0_24px_70px_rgba(6,31,48,0.35)] backdrop-blur-xl"
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#ffd84d]">Daily Training</p>
      <h2 className="mt-2 text-2xl font-black">今日目标：完成一次真实牌权判断</h2>
      <p className="mt-3 text-sm font-bold leading-6 text-white/82">
        先看当前牌局，再选择出牌、不出或查看提示。提交后进入 AI 分析，确认这手选择是否影响后续牌型。
      </p>
      <div className="mt-5 grid gap-3 text-sm font-bold text-white/86 sm:grid-cols-3">
        <Step index="1" text="选择操作" />
        <Step index="2" text="提交判断" />
        <Step index="3" text="查看分析" />
      </div>
      <div className="mt-6 flex gap-3">
        {phase === "idle" ? (
          <button
            className="h-12 flex-1 rounded-2xl bg-[#ffd84d] px-5 text-sm font-black text-[#684900] shadow-[0_0_22px_rgba(255,216,77,0.35)]"
            onClick={onStart}
            type="button"
          >
            开始训练
          </button>
        ) : null}
        {onClose ? (
          <button
            className="h-12 flex-1 rounded-2xl border border-white/55 bg-white/12 px-5 text-sm font-black text-white"
            onClick={onClose}
            type="button"
          >
            回到牌桌
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}

function Step({ index, text }: { index: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/16 bg-white/10 px-3 py-3">
      <span className="text-[#ffd84d]">{index}</span>
      <p className="mt-1">{text}</p>
    </div>
  );
}

function ArenaBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#72caff_0%,#c9f0ff_38%,#eaf8ff_100%)]" />
      <div className="absolute left-0 right-0 top-0 h-[40%] bg-[radial-gradient(circle_at_14%_35%,rgba(255,255,255,0.94),transparent_18%),radial-gradient(circle_at_38%_18%,rgba(255,255,255,0.78),transparent_16%),radial-gradient(circle_at_72%_26%,rgba(255,255,255,0.82),transparent_19%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.70),transparent_15%)]" />
      <div className="absolute bottom-[36%] left-[6%] h-40 w-20 rounded-t-[48px] border border-white/45 bg-white/28 backdrop-blur-sm" />
      <div className="absolute bottom-[33%] left-[14%] h-64 w-28 rounded-t-[60px] border border-white/35 bg-[#b7ebff]/34 backdrop-blur" />
      <div className="absolute bottom-[35%] left-[24%] h-52 w-24 rounded-t-[56px] border border-white/30 bg-white/20 backdrop-blur-sm" />
      <div className="absolute bottom-[34%] right-[7%] h-64 w-28 rounded-t-[60px] border border-white/35 bg-white/24 backdrop-blur" />
      <div className="absolute bottom-[31%] right-[18%] h-52 w-24 rounded-t-[54px] border border-white/30 bg-[#8ddcff]/30 backdrop-blur" />
      <div className="absolute bottom-[28%] right-[30%] h-44 w-20 rounded-t-[46px] border border-white/30 bg-white/18 backdrop-blur-sm" />
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(190,233,255,0.82)_58%,rgba(131,201,244,0.30)_100%)]" />
      <div className="absolute inset-x-[-8%] bottom-[18%] h-[180px] rounded-[50%] border border-white/40 bg-white/22 shadow-[0_0_70px_rgba(255,255,255,0.34)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.20)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:76px_76px] opacity-24" />
    </div>
  );
}
