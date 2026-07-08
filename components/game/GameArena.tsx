"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ActionButtons } from "@/components/game/ActionButtons";
import { CoachAvatar } from "@/components/game/CoachAvatar";
import { CoachBubble } from "@/components/game/CoachBubble";
import { GameTable } from "@/components/game/GameTable";
import { HandCards } from "@/components/game/HandCards";
import { useGameStore } from "@/store/gameStore";
import type { Card } from "@/lib/guandan/card";
import type { TrainingPhase } from "@/lib/guandan/gameState";
import type { ArenaPlayer } from "@/types/game";

const showcaseCards: Card[] = [
  { id: "show-heart-8", suit: "heart", rank: 8, isJoker: false, deckIndex: 1 },
  { id: "show-diamond-8", suit: "diamond", rank: 8, isJoker: false, deckIndex: 1 },
  { id: "show-spade-q", suit: "spade", rank: 12, isJoker: false, deckIndex: 1 },
  { id: "show-club-q", suit: "club", rank: 12, isJoker: false, deckIndex: 1 }
];

export function GameArena() {
  const router = useRouter();
  const {
    state,
    currentPlayer,
    userPlayer,
    selectedCardIds,
    isUserTurn,
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
    }, 900);

    return () => window.clearTimeout(timer);
  }, [currentPlayer?.id, currentPlayer?.kind, runAIAction, state.gameStatus, state.trainingPhase, state.turnNumber]);

  const arenaPlayers = useMemo(
    () =>
      state.players.map<ArenaPlayer>((player) => ({
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
  const tableCards = state.lastPlayedCards.length > 0 ? state.lastPlayedCards : showcaseCards;
  const roundStatus =
    phase === "analysis"
      ? "AI 正在分析这手牌..."
      : isUserTurn
        ? "轮到你出牌"
        : `${currentPlayer?.role ?? "对家"}出牌中...`;
  const goLobby = () => router.push("/");

  return (
    <main className="training-arena relative h-screen min-h-[720px] overflow-hidden bg-[#72caff] text-[#12395a]">
      <ArenaBackground />
      <ArenaTopBar onBackToLobby={goLobby} onRestart={restart} phase={phase} />

      <section className="relative z-10 mx-auto h-full w-full max-w-[1680px] px-5 pb-5 pt-[72px]">
        <GameTable players={arenaPlayers} tableCards={tableCards} />

        <div className="pointer-events-none absolute left-1/2 top-[55%] z-40 -translate-x-1/2 text-center text-white drop-shadow-[0_3px_8px_rgba(34,92,146,0.42)]">
          <p className="text-[22px] font-black">{roundStatus}</p>
        </div>

        <div className="absolute right-7 top-[86px] z-50 hidden w-[238px] xl:block">
          <PerformancePanel phase={phase} />
        </div>

        <div className="absolute bottom-[26px] left-6 z-50 hidden w-[270px] xl:block">
          <ChatPanel />
        </div>

        <div className="absolute bottom-[204px] left-1/2 z-[70] flex -translate-x-1/2 items-end gap-3">
          <CoachAvatar mood={state.coachFeedback.type === "mistake" ? "warning" : isUserTurn ? "teaching" : "thinking"} />
          <CoachBubble feedback={state.coachFeedback} />
        </div>

        <section className="training-hand-dock absolute inset-x-[300px] bottom-[34px] z-[60] min-w-0 2xl:inset-x-[310px]">
          <HandCards
            cards={userPlayer?.hand ?? []}
            compact
            disabled={!isUserTurn}
            invalidCardIds={state.invalidCardIds}
            invalidPulseKey={state.invalidPulseKey}
            onSelectionChange={setSelectedCards}
            onSelectCard={selectCard}
            selectedCardIds={selectedCardIds}
            variant="arena"
          />
          <div className="mt-1 text-center">
            <button
              className="rounded-full bg-white/42 px-6 py-1.5 text-sm font-black text-[#24557a] shadow-[0_10px_24px_rgba(31,99,154,0.16)] backdrop-blur"
              onClick={sortHand}
              type="button"
            >
              牌型提示 ^
            </button>
          </div>
          <AnimatePresence>
            {isUserTurn && selectedCardIds.length > 0 ? (
              <motion.button
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute bottom-[calc(100%+12px)] left-1/2 z-[70] flex h-14 min-w-[154px] -translate-x-1/2 items-center justify-center rounded-full border border-[#ffe891]/90 bg-[#ffd84d] px-6 py-3 text-base font-black text-[#684900] shadow-[0_0_24px_rgba(255,216,77,0.58),0_18px_38px_rgba(0,0,0,0.28)] transition active:scale-[0.98]"
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                onClick={playSelectedCards}
                type="button"
              >
                出牌 {selectedCardIds.length}
              </motion.button>
            ) : null}
          </AnimatePresence>
        </section>

        <aside className="absolute bottom-[96px] right-7 z-[60] w-[188px]">
          <div className="mb-3 rounded-[24px] border border-white/42 bg-[#6db8e8]/36 px-4 py-3 text-base font-black text-[#143d5d] shadow-[0_18px_45px_rgba(38,126,190,0.18)] backdrop-blur-xl">
            <span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#1ee271]" />
            本轮可出牌
          </div>
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
            onStart={continueTraining}
            onTip={requestTip}
            phase={phase}
            selectedCount={state.selectedCards.length}
          />
        </aside>
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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(59,170,244,0.10)_55%,rgba(44,139,214,0.22))]" />
    </div>
  );
}

function ArenaTopBar({
  onBackToLobby,
  onRestart,
  phase
}: {
  onBackToLobby: () => void;
  onRestart: () => void;
  phase: TrainingPhase;
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-[80] h-[72px] border-b border-white/20 bg-[#d7f3ff]/28 shadow-[0_10px_32px_rgba(34,122,187,0.10)] backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-7">
        <div className="relative flex h-[70px] w-[300px] items-center rounded-br-[28px] bg-white/76 pl-7 shadow-[0_10px_24px_rgba(37,126,191,0.14)]">
          <div>
            <p className="whitespace-nowrap text-[24px] font-black leading-7 text-[#f6b42d]">
              Ace <span className="text-[#12395a]">掼蛋训练空间</span>
            </p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#255675]">
              AI Guandan Training Arena
            </p>
          </div>
        </div>

        <div className="hidden items-center rounded-full bg-white/34 px-7 py-3 text-base font-black text-[#12395a] shadow-[0_10px_24px_rgba(52,142,207,0.14)] backdrop-blur-xl md:flex">
          <span>初段场 · 新手练习房</span>
          <span className="mx-4 h-5 w-px bg-white/64" />
          <span>底分：100</span>
          <span className="ml-4 rounded-full bg-[#0f64ff] px-3 py-1 text-xs text-white">{phaseText[phase]}</span>
        </div>

        <nav className="flex items-center gap-4">
          <HudButton icon="ⓘ" label="规则" />
          <HudButton icon="⚙" label="设置" onClick={onRestart} />
          <HudButton icon="▣" label="反馈" />
          <button
            className="h-12 rounded-full bg-[#0f64ff] px-7 text-base font-black text-white shadow-[0_14px_30px_rgba(15,100,255,0.28)] transition hover:-translate-y-0.5"
            onClick={onBackToLobby}
            type="button"
          >
            退出房间
          </button>
        </nav>
      </div>
    </header>
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
      className="inline-flex h-11 items-center gap-2 rounded-full bg-white/42 px-5 text-sm font-black text-[#12395a] shadow-[0_10px_24px_rgba(52,142,207,0.14)] backdrop-blur-xl transition hover:-translate-y-0.5"
      onClick={onClick}
      type="button"
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function PerformancePanel({ phase }: { phase: TrainingPhase }) {
  return (
    <section className="rounded-[12px] border border-white/62 bg-white/68 p-4 text-[#12395a] shadow-[0_20px_45px_rgba(42,132,196,0.20)] backdrop-blur-xl">
      <h2 className="text-base font-black">本局战绩</h2>
      <div className="mt-3 grid grid-cols-3 border-b border-[#8ecded]/60 pb-2 text-center text-sm font-bold text-[#346d92]">
        <span>玩家</span>
        <span>得分</span>
        <span>总计</span>
      </div>
      <div className="grid grid-cols-3 py-2 text-center text-sm font-black text-[#0f64a0]">
        <span>我方</span>
        <span>{phase === "completed" ? "20" : "--"}</span>
        <span>--</span>
      </div>
      <div className="grid grid-cols-3 py-1 text-center text-sm font-bold text-[#346d92]">
        <span>对方</span>
        <span>--</span>
        <span>--</span>
      </div>
    </section>
  );
}

function ChatPanel() {
  return (
    <section className="rounded-[12px] border border-white/38 bg-[#2f78b8]/68 p-4 text-white shadow-[0_20px_48px_rgba(37,108,174,0.24)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-base font-black">聊天</p>
        <span className="text-white/45">×</span>
      </div>
      <div className="space-y-2 text-sm font-bold leading-5 text-white/90">
        <p>上家：好运！</p>
        <p>你：稳住，我们能赢！</p>
        <p>下家：加油加油！</p>
        <p>对家：🙂</p>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="flex h-10 flex-1 items-center rounded-lg bg-[#1f5f99]/56 px-3 text-sm text-white/76">
          输入消息...
        </div>
        <button
          className="grid h-10 w-12 place-items-center rounded-lg bg-[#4bb8ff] text-lg font-black text-white"
          type="button"
        >
          ➤
        </button>
      </div>
    </section>
  );
}

function roleLabel(position: string) {
  if (position === "left") return "上家";
  if (position === "right") return "下家";
  if (position === "top") return "对家";
  return "我";
}
