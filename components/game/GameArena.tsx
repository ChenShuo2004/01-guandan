"use client";

import { motion } from "framer-motion";
import { ActionButtons } from "@/components/game/ActionButtons";
import { CoachAvatar } from "@/components/game/CoachAvatar";
import { CoachBubble } from "@/components/game/CoachBubble";
import { GameTable } from "@/components/game/GameTable";
import { HandCards } from "@/components/game/HandCards";
import { ScorePanel } from "@/components/game/ScorePanel";
import { phaseOneArenaState } from "@/store/gameStore";

export function GameArena() {
  const state = phaseOneArenaState;
  const user = state.players.find((player) => player.isUser);

  return (
    <main className="training-arena relative min-h-screen overflow-hidden bg-[#eaf8ff] text-slate-900">
      <ArenaBackdrop />

      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="training-arena-shell relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 lg:px-6"
        initial={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <ArenaHeader mode={state.mode} roundLabel={state.roundLabel} />

        <div className="relative flex flex-1 items-center gap-4 pb-[150px] pt-3 lg:pb-[168px]">
          <div className="training-arena-stage relative min-h-[590px] flex-1 lg:min-h-[680px]">
            <GameTable players={state.players} tableCards={state.tableCards} />

            <div className="training-coach-dock absolute bottom-10 left-1/2 z-30 flex -translate-x-1/2 items-end gap-3">
              <CoachAvatar mood={state.coach.mood} />
              <CoachBubble message={state.coach.message} />
            </div>
          </div>

          <aside className="hidden w-[180px] shrink-0 flex-col gap-4 xl:flex">
            <ScorePanel />
            <ActionButtons />
          </aside>
        </div>

        <section className="training-hand-dock absolute inset-x-4 bottom-4 z-40 mx-auto max-w-[1050px] lg:bottom-5">
          <div className="mb-3 flex items-center justify-center gap-3 text-sm font-bold text-[#0f4774]">
            <span className="rounded-full bg-white/75 px-4 py-2 shadow-[0_10px_30px_rgba(30,125,190,0.16)] backdrop-blur">
              {user?.name ?? "我"} · 剩余 {user?.cardCount ?? state.handCards.length} 张
            </span>
            <span className="hidden rounded-full border border-[#85d8ff]/70 bg-white/55 px-4 py-2 backdrop-blur sm:inline-flex">
              AI Coach 已就位
            </span>
          </div>
          <HandCards cards={state.handCards} />
        </section>

        <div className="training-action-dock absolute bottom-5 right-4 z-50 flex w-[152px] flex-col gap-3 xl:hidden">
          <ActionButtons compact />
        </div>
      </motion.section>
    </main>
  );
}

function ArenaHeader({ mode, roundLabel }: { mode: string; roundLabel: string }) {
  return (
    <header className="training-arena-header relative z-20 flex items-center justify-between gap-3 rounded-[28px] border border-white/55 bg-white/45 px-4 py-3 shadow-[0_14px_40px_rgba(51,156,220,0.18)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffd84d] to-[#4bb8ff] text-xl font-black text-white shadow-[0_10px_26px_rgba(75,184,255,0.35)]">
          A
        </div>
        <div>
          <p className="text-lg font-black leading-tight text-[#12395a]">Ace 掼蛋训练空间</p>
          <p className="text-xs font-bold uppercase text-[#47799b]">AI Guandan Training Arena</p>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-white/60 bg-white/45 px-4 py-2 text-sm font-bold text-[#225b81] shadow-inner md:flex">
        <span>{mode}</span>
        <span className="h-1 w-1 rounded-full bg-[#4bb8ff]" />
        <span>{roundLabel}</span>
      </div>

      <nav className="flex items-center gap-2">
        {["规则", "设置", "退出"].map((item) => (
          <button
            className="rounded-full border border-white/65 bg-white/55 px-4 py-2 text-sm font-bold text-[#17496d] shadow-[0_8px_20px_rgba(76,155,205,0.14)] transition hover:-translate-y-0.5 hover:bg-white/80"
            key={item}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>
    </header>
  );
}

function ArenaBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#8ddcff_0%,#eaf8ff_42%,#d7f2ff_100%)]" />
      <div className="absolute left-0 right-0 top-0 h-[42%] bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.94),transparent_18%),radial-gradient(circle_at_42%_18%,rgba(255,255,255,0.72),transparent_16%),radial-gradient(circle_at_72%_22%,rgba(255,255,255,0.76),transparent_18%)]" />
      <div className="absolute bottom-[34%] left-[6%] h-44 w-20 rounded-t-[48px] border border-white/35 bg-white/24 backdrop-blur-sm" />
      <div className="absolute bottom-[31%] left-[14%] h-60 w-28 rounded-t-[56px] border border-white/30 bg-[#b7ebff]/30 backdrop-blur" />
      <div className="absolute bottom-[32%] right-[8%] h-64 w-28 rounded-t-[60px] border border-white/30 bg-white/22 backdrop-blur" />
      <div className="absolute bottom-[29%] right-[18%] h-48 w-20 rounded-t-[48px] border border-white/30 bg-[#8ddcff]/28 backdrop-blur" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(191,234,255,0.78))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
    </div>
  );
}
