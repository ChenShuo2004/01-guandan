"use client";

import { motion } from "framer-motion";
import { PlayedCards } from "@/components/game/PlayedCards";
import { PlayerSeat } from "@/components/game/PlayerSeat";
import type { PlayerRoundAction, TurnActionState } from "@/lib/guandan/gameState";
import type { PlayerId } from "@/lib/guandan/player";
import type { ArenaPlayer } from "@/types/game";

interface GameTableProps {
  levelRank: string;
  players: ArenaPlayer[];
  roundActions: Partial<Record<PlayerId, PlayerRoundAction>>;
  turnAction: TurnActionState;
}

export function GameTable({ levelRank, players, roundActions, turnAction }: GameTableProps) {
  return (
    <div className="absolute inset-0">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-x-[4%] bottom-[8%] top-[15%] rounded-[50%] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(222,239,255,0.62)_18%,rgba(138,210,255,0.38)_100%)] p-[16px] shadow-[0_40px_70px_rgba(54,128,190,0.28),0_0_0_1px_rgba(255,255,255,0.72),inset_0_0_22px_rgba(255,255,255,0.9)]"
        initial={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
      >
        <div className="absolute inset-[2%] rounded-[50%] border border-[#d7f4ff]/90 shadow-[inset_0_0_26px_rgba(75,184,255,0.30)]" />
        <div className="relative h-full rounded-[50%] border border-white/76 bg-[radial-gradient(circle_at_50%_35%,rgba(235,250,255,0.82),rgba(75,184,255,0.46)_38%,rgba(59,168,235,0.62)_100%)] shadow-[inset_0_0_95px_rgba(255,255,255,0.45),inset_0_-38px_70px_rgba(33,112,184,0.18),0_0_56px_rgba(75,184,255,0.48)]">
          <div className="absolute inset-[8%] rounded-[50%] border border-white/30" />
          <div className="absolute inset-[15%] rounded-[50%] border border-dashed border-white/30" />
          <TurnStatusLabel turnAction={turnAction} />
          <div className="absolute inset-0 rounded-[50%] bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.22)_46%,transparent_54%)] opacity-70" />
        </div>
      </motion.div>

      <RoundActionZone action={roundActions.enemyAI2} className="left-[24%] top-[42%]" levelRank={levelRank} />
      <RoundActionZone action={roundActions.partnerAI} className="left-1/2 top-[24%] -translate-x-1/2" levelRank={levelRank} />
      <RoundActionZone action={roundActions.enemyAI1} className="right-[21%] top-[42%]" levelRank={levelRank} />
      <RoundActionZone action={roundActions.player} className="left-1/2 bottom-[24%] -translate-x-1/2" levelRank={levelRank} />

      {players.map((player) => (
        <PlayerSeat key={player.id} player={player} />
      ))}
    </div>
  );
}

function TurnStatusLabel({ turnAction }: { turnAction: TurnActionState }) {
  return (
    <div className="absolute left-1/2 top-[30%] z-20 -translate-x-1/2 rounded-full border border-white/70 bg-white/80 px-5 py-2 text-center text-[#12395a] shadow-[0_12px_28px_rgba(43,127,191,0.16)] backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#34749c]">当前行动</p>
      <p className="text-base font-black">{turnAction.label}</p>
      {typeof turnAction.remainingSeconds === "number" ? (
        <p className="text-sm font-black text-[#d27b00]">{turnAction.remainingSeconds} 秒</p>
      ) : null}
    </div>
  );
}

function RoundActionZone({
  action,
  className,
  levelRank
}: {
  action?: PlayerRoundAction;
  className: string;
  levelRank: string;
}) {
  if (!action) return null;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`absolute z-[35] ${className}`}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.85, ease: "easeOut" }}
    >
      <div className="min-w-[150px] rounded-2xl border border-white/70 bg-white/86 px-3 py-2 text-[#12395a] shadow-[0_18px_42px_rgba(35,112,178,0.20)] backdrop-blur">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-sm font-black">【{action.role}】</span>
          <span className="rounded-full bg-[#dff4ff] px-2 py-0.5 text-xs font-black text-[#0f64a0]">
            {action.action === "pass" ? "不出" : patternLabel(action.result)}
          </span>
        </div>
        {action.action === "pass" ? (
          <div className="grid h-12 place-items-center rounded-xl border border-[#b8dcf0] bg-[#eef9ff] text-base font-black text-[#557b93]">
            Pass
          </div>
        ) : (
          <PlayedCards cards={action.cards} compact levelRank={levelRank} />
        )}
      </div>
    </motion.div>
  );
}

function patternLabel(type: string) {
  const labels: Record<string, string> = {
    single: "单牌",
    pair: "对子",
    triple: "三张",
    tripleWithPair: "三带二",
    straight: "顺子",
    bomb: "炸弹",
    fourJokers: "四王炸"
  };

  return labels[type] ?? type;
}
