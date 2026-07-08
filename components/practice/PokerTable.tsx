"use client";

import { motion } from "framer-motion";
import { PokerHand } from "@/components/cards/PokerHand";
import type { PracticeCase } from "@/types/practice";
import type { PokerCardData } from "@/types/poker";

interface PokerTableProps {
  aiHint?: string;
  onCardClick?: (card: PokerCardData) => void;
  practiceCase: PracticeCase;
  selectedCardIds?: string[];
}

export function PokerTable({
  aiHint = "先观察谁快走完，再决定要不要抢牌权。",
  onCardClick,
  practiceCase,
  selectedCardIds = []
}: PokerTableProps) {
  const partner = practiceCase.players.find((player) => player.position === "top");
  const rightOpponent = practiceCase.players.find((player) => player.position === "right");
  const me = practiceCase.players.find((player) => player.position === "bottom");
  const leftOpponent = practiceCase.players.find((player) => player.position === "left");
  const latestMove = practiceCase.history[practiceCase.history.length - 1];

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/58 p-4 text-slate-950 shadow-[0_30px_90px_rgba(37,99,235,0.15)] backdrop-blur-2xl lg:p-6"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
    >
      <div className="absolute -left-16 top-20 h-56 w-56 rounded-full bg-cyan-300/22 blur-3xl" />
      <div className="absolute -right-20 bottom-16 h-64 w-64 rounded-full bg-blue-500/18 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-blue-600">AI 训练桌</p>
            <h2 className="mt-1 text-xl font-black leading-7">当前局面判断</h2>
          </div>
          <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
            {practiceCase.experience} XP
          </div>
        </div>

        <div className="relative mx-auto min-h-[320px] max-w-3xl rounded-[36px] border border-blue-200/80 bg-gradient-to-br from-blue-100 via-sky-100 to-blue-200 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8),0_22px_70px_rgba(37,99,235,0.18)] lg:min-h-[430px] lg:p-6">
          <div className="absolute inset-5 rounded-[32px] border border-white/55 bg-gradient-to-br from-blue-500/74 via-blue-500/64 to-cyan-400/58 shadow-[inset_0_20px_80px_rgba(255,255,255,0.18)]" />

          {partner ? <PlayerSeat className="left-1/2 top-4 -translate-x-1/2" player={partner.name} remaining={partner.remainingCards} /> : null}
          {leftOpponent ? <PlayerSeat className="left-3 top-1/2 -translate-y-1/2" player={leftOpponent.name} remaining={leftOpponent.remainingCards} /> : null}
          {rightOpponent ? <PlayerSeat className="right-3 top-1/2 -translate-y-1/2" player={rightOpponent.name} remaining={rightOpponent.remainingCards} /> : null}
          {me ? <PlayerSeat className="bottom-4 left-1/2 -translate-x-1/2" player={me.name} remaining={me.remainingCards} active /> : null}

          <div className="absolute left-1/2 top-1/2 w-[72%] -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-xs font-black uppercase text-white/72">Latest Move</p>
            <p className="mt-1 text-lg font-black text-white drop-shadow-sm">
              {latestMove?.label ?? "等待出牌"}
            </p>
            {latestMove ? (
              <div className="mt-4 flex justify-center">
                <PokerHand cards={latestMove.cards} compact />
              </div>
            ) : null}
          </div>
        </div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-auto -mt-10 max-w-2xl rounded-[22px] border border-blue-100 bg-white/88 p-4 shadow-[0_18px_54px_rgba(15,23,42,0.16)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 16 }}
          transition={{ delay: 0.12, duration: 0.36 }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-blue-600 px-2 py-1 text-xs font-black text-white">
              AI
            </div>
            <div>
              <p className="text-xs font-black text-blue-600">Ace Strategy Insight</p>
              <p className="mt-1 text-sm font-bold leading-6 text-slate-700">{aiHint}</p>
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 mt-4 rounded-[24px] border border-white/70 bg-white/70 p-4 shadow-[0_18px_60px_rgba(37,99,235,0.12)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-blue-600">我的手牌</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                点击牌面，先选出你认为关键的牌。
              </p>
            </div>
            {selectedCardIds.length > 0 ? (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                已选 {selectedCardIds.length}
              </span>
            ) : null}
          </div>
          <PokerHand
            cards={practiceCase.myHand}
            onCardClick={onCardClick}
            selectedIds={selectedCardIds}
          />
        </div>
      </div>
    </motion.section>
  );
}

function PlayerSeat({
  active = false,
  className,
  player,
  remaining
}: {
  active?: boolean;
  className: string;
  player: string;
  remaining: number;
}) {
  return (
    <div
      className={[
        "absolute z-10 rounded-2xl border px-3 py-2 text-center text-xs font-black shadow-[0_14px_34px_rgba(15,23,42,0.16)] backdrop-blur-xl",
        active
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-white/80 bg-white/78 text-slate-700",
        className
      ].join(" ")}
    >
      <p>{player}</p>
      <p className="mt-0.5 text-[11px] font-bold opacity-75">剩 {remaining} 张</p>
    </div>
  );
}
