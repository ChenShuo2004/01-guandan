"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { CardRemainingCount } from "@/lib/guandan/gameState";
import { cn } from "@/lib/utils";

interface CardCounterProps {
  counts: CardRemainingCount;
  levelRank?: string;
  myRemaining?: number;
  onHide?: () => void;
  opponentRemaining?: number;
  visible: boolean;
}

const rankRows = [
  ["A", "K", "Q", "J", "10"],
  ["9", "8", "7", "6", "5", "4", "3", "2"]
];

const rankTotal: Record<string, number> = {
  A: 8,
  K: 8,
  Q: 8,
  J: 8,
  "10": 8,
  "9": 8,
  "8": 8,
  "7": 8,
  "6": 8,
  "5": 8,
  "4": 8,
  "3": 8,
  "2": 8,
  SJ: 2,
  BJ: 2
};

export function CardCounter({
  counts,
  levelRank = "10",
  myRemaining = 0,
  onHide,
  opponentRemaining = 0,
  visible
}: CardCounterProps) {
  if (!visible) return null;

  return (
    <motion.aside
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className="training-card-counter absolute right-5 top-[94px] z-[66] w-[370px] overflow-hidden rounded-[10px] border border-white/80 bg-white/92 text-[#12395a] shadow-[0_14px_32px_rgba(25,92,148,0.20)] backdrop-blur-md max-xl:right-3 max-lg:top-[86px] max-lg:w-[312px] max-lg:scale-[0.82] max-lg:origin-top-right"
      initial={{ opacity: 0, x: -10, scale: 0.98 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="flex items-center gap-1 border-b border-[#d6e4ef] bg-[#eef8ff] px-2 py-1.5">
        <div className="flex items-center gap-1 rounded-md bg-white/80 px-1.5 py-1">
          <span className="text-[10px] font-black text-[#345f78]">我方</span>
          <span className="text-sm font-black text-[#12395a]">{myRemaining}</span>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-white/80 px-1.5 py-1">
          <span className="text-[10px] font-black text-[#a64646]">对方</span>
          <span className="text-sm font-black text-[#c61922]">{opponentRemaining}</span>
        </div>
        <div className="relative ml-auto h-7 w-6 overflow-hidden rounded-[4px] border border-[#78a8d1] shadow-sm">
          <Image alt="" className="object-cover" fill sizes="24px" src="/assets/poker-cards/backs/ai-training-card-back.png" />
        </div>
        <span className="text-[10px] font-black tracking-[0.12em] text-[#0f64ff]">记牌</span>
        {onHide ? (
          <button
            aria-label="隐藏记牌器"
            className="ml-1 grid h-12 w-12 place-items-center rounded-md text-[#345f78] transition hover:bg-[#dcefff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f64ff]"
            onClick={onHide}
            title="隐藏记牌器"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">visibility_off</span>
          </button>
        ) : null}
      </div>
      <div className="space-y-1 px-2 py-1.5">
        <div className="grid grid-cols-[repeat(7,38px)] gap-1 max-lg:grid-cols-[repeat(7,32px)]">
          <JokerCell count={counts.SJ ?? 0} label="小王" tone="small" />
          <JokerCell count={counts.BJ ?? 0} label="大王" tone="big" />
          {rankRows[0].map((rank) => (
            <RankCell count={counts[rank] ?? 0} isLevel={rank === levelRank} key={rank} rank={rank} />
          ))}
        </div>
        <div className="grid grid-cols-[repeat(8,38px)] gap-1 max-lg:grid-cols-[repeat(8,32px)]">
          {rankRows[1].map((rank) => (
            <RankCell count={counts[rank] ?? 0} isLevel={rank === levelRank} key={rank} rank={rank} />
          ))}
        </div>
      </div>
    </motion.aside>
  );
}

export function buildCounterHint(counts: CardRemainingCount) {
  const aRemaining = counts.A ?? 0;
  const aAppeared = Math.max(0, rankTotal.A - aRemaining);

  if (aRemaining <= 2) {
    return `当前 A 已出现 ${aAppeared} 张，剩余 A 较少，可以更积极地控制牌权。`;
  }

  if ((counts.BJ ?? 0) === 0 && (counts.SJ ?? 0) === 0) {
    return "大小王都已经出现，后续炸弹和主牌价值会上升。";
  }

  return `当前 A 已出现 ${aAppeared} 张，剩余 ${aRemaining} 张。先记大牌，再判断是否抢牌权。`;
}

function RankCell({ count, isLevel, rank }: { count: number; isLevel?: boolean; rank: string }) {
  return (
    <div
      className={cn(
        "h-[40px] rounded-[5px] border px-1 text-center leading-none",
        count === 0 ? "border-[#ffd8d8] bg-[#fff3f3]" : "border-[#d8e3fb] bg-white",
        isLevel && "border-[#f2c24c] bg-[#fff8dc] shadow-[0_0_0_1px_rgba(242,194,76,0.48),0_0_10px_rgba(242,194,76,0.36)]"
      )}
    >
      <p className="pt-1 text-[17px] font-black leading-4">
        {rank}
        {isLevel ? <span className="ml-0.5 align-top text-[9px] text-[#9a6800]">级</span> : null}
      </p>
      <p className={cn("mt-0.5 text-[15px] font-black leading-4", count === 0 ? "text-[#ba1a1a]" : "text-[#c61922]")}>
        {count}
      </p>
    </div>
  );
}

function JokerCell({
  count,
  label,
  tone
}: {
  count: number;
  label: string;
  tone: "big" | "small";
}) {
  return (
    <div
      className={cn(
        "h-[40px] rounded-[5px] border px-1 text-center leading-none",
        tone === "big"
          ? "border-[#ffd0d0] bg-[#fff2f2] text-[#c61922]"
          : "border-[#cfe0ff] bg-[#f2f7ff] text-[#1267d8]"
      )}
    >
      <p className="pt-1 text-[10px] font-black leading-4">{label}</p>
      <p className="mt-0.5 text-[15px] font-black leading-4">{count}</p>
    </div>
  );
}
