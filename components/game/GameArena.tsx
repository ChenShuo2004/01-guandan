"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ActionButtons } from "@/components/game/ActionButtons";
import { CoachAvatar } from "@/components/game/CoachAvatar";
import { CoachBubble } from "@/components/game/CoachBubble";
import { GameTable } from "@/components/game/GameTable";
import { HandCards } from "@/components/game/HandCards";
import { ScorePanel } from "@/components/game/ScorePanel";
import { useGameStore } from "@/store/gameStore";
import type { ArenaPlayer } from "@/types/game";

export function GameArena() {
  const {
    state,
    currentPlayer,
    userPlayer,
    selectedCardIds,
    isUserTurn,
    selectCard,
    playSelectedCards,
    pass,
    requestTip,
    runAIAction,
    restart
  } = useGameStore();

  useEffect(() => {
    if (state.gameStatus !== "playing" || currentPlayer?.kind !== "ai") return;

    const timer = window.setTimeout(() => {
      runAIAction();
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [currentPlayer?.id, currentPlayer?.kind, runAIAction, state.gameStatus, state.turnNumber]);

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

  const winner = state.winner ? state.players.find((player) => player.id === state.winner) : null;
  const roundLabel = winner ? `${winner.role} 率先出完` : `第 ${state.turnNumber} 手 · ${currentPlayer?.role ?? "等待"}`;

  return (
    <main className="training-arena relative min-h-screen overflow-hidden bg-[#eaf8ff] text-[#12395a]">
      <ArenaBackdrop />

      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="training-arena-shell relative z-10 mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-4 py-3 lg:px-7"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <ArenaHeader onRestart={restart} roundLabel={roundLabel} />

        <div className="relative flex flex-1 gap-4 pb-[154px] pt-3 lg:pb-[166px]">
          <ArenaChat />

          <section className="training-arena-stage relative min-h-[610px] flex-1 lg:min-h-[710px]">
            <GameTable players={arenaPlayers} tableCards={state.lastPlayedCards} />

            <div className="absolute bottom-[16%] left-1/2 z-40 flex -translate-x-1/2 items-end gap-3">
              <CoachAvatar mood={state.coachFeedback.type === "mistake" ? "warning" : isUserTurn ? "teaching" : "thinking"} />
              <CoachBubble feedback={state.coachFeedback} />
            </div>
          </section>

          <aside className="hidden w-[196px] shrink-0 flex-col gap-4 xl:flex">
            <ScorePanel players={state.players} turnNumber={state.turnNumber} />
            <ActionButtons
              canAct={isUserTurn}
              onPass={pass}
              onPlay={playSelectedCards}
              onTip={requestTip}
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
              {isUserTurn ? "本轮可出牌" : `等待 ${currentPlayer?.role ?? "AI"}`}
            </span>
          </div>
          <HandCards
            cards={userPlayer?.hand ?? []}
            disabled={!isUserTurn}
            onSelectCard={selectCard}
            selectedCardIds={selectedCardIds}
          />
        </section>

        <div className="training-action-dock fixed bottom-4 right-3 z-[60] flex w-[150px] flex-col gap-3 xl:hidden">
          <ActionButtons
            canAct={isUserTurn}
            compact
            onPass={pass}
            onPlay={playSelectedCards}
            onTip={requestTip}
            selectedCount={state.selectedCards.length}
          />
        </div>
      </motion.section>
    </main>
  );
}

function ArenaHeader({ onRestart, roundLabel }: { onRestart: () => void; roundLabel: string }) {
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
        <span>新手练习房</span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#4bb8ff]" />
        <span>{roundLabel}</span>
      </div>

      <nav className="flex items-center gap-2">
        <HeaderButton label="规则" />
        <HeaderButton label="设置" onClick={onRestart} />
        <button
          className="rounded-full bg-[#0f64ff] px-5 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,100,255,0.28)] transition hover:-translate-y-0.5"
          type="button"
        >
          退出房间
        </button>
      </nav>
    </header>
  );
}

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

function ArenaChat() {
  return (
    <aside className="absolute bottom-40 left-4 z-50 hidden w-[250px] rounded-[22px] border border-white/55 bg-[#2f78b8]/58 p-4 text-white shadow-[0_18px_45px_rgba(35,107,174,0.2)] backdrop-blur-xl 2xl:block">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-black">聊天</p>
        <span className="text-white/55">×</span>
      </div>
      <div className="space-y-2 text-xs font-bold leading-5 text-white/88">
        <p>上家：好牌！</p>
        <p>你：稳住，我们能赢！</p>
        <p>下家：加油加油！</p>
        <p>对家：🙂</p>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="flex-1 rounded-xl bg-white/16 px-3 py-2 text-xs text-white/75">输入消息...</div>
        <button className="rounded-xl bg-[#4bb8ff] px-3 text-xs font-black text-white" type="button">
          发
        </button>
      </div>
    </aside>
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
