"use client";

import { motion } from "framer-motion";
import type { CardRemainingCount } from "@/lib/guandan/gameState";
import { cn } from "@/lib/utils";

interface CardCounterProps {
  counts: CardRemainingCount;
  levelRank?: string;
  visible: boolean;
}

const rankGroups = [
  ["A", "K", "Q", "J", "10"],
  ["9", "8", "7", "6", "5"],
  ["4", "3", "2"]
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

export function CardCounter({ counts, levelRank = "10", visible }: CardCounterProps) {
  if (!visible) return null;

  return (
    <motion.aside
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className="absolute left-5 top-[104px] z-[66] w-[252px] rounded-[22px] border border-[#d8e3fb] bg-white p-4 text-[#12395a] shadow-[0_22px_58px_rgba(25,92,148,0.22)] max-xl:left-auto max-xl:right-5 max-xl:top-[142px] max-lg:top-[92px] max-lg:w-[218px] max-lg:p-3"
      initial={{ opacity: 0, x: -16, scale: 0.96 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#e7eef8] pb-3">
        <div>
          <p className="text-xs font-black text-[#0f64ff]">记牌器</p>
          <h2 className="mt-1 text-lg font-black leading-6">剩余牌统计</h2>
        </div>
        <span className="material-symbols-outlined rounded-xl bg-[#eef6ff] p-2 text-[20px] text-[#0f64ff]">
          data_usage
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {rankGroups.map((group) => (
          <div className="grid grid-cols-5 gap-2" key={group.join("-")}>
            {group.map((rank) => (
              <RankCell count={counts[rank] ?? 0} isLevel={rank === levelRank} key={rank} rank={rank} />
            ))}
          </div>
        ))}
      </div>

      <section className="mt-3 rounded-2xl bg-[#f3f9ff] p-3">
        <p className="text-xs font-black text-[#346d92]">大小王</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <JokerCell count={counts.SJ ?? 0} label="小王" />
          <JokerCell count={counts.BJ ?? 0} label="大王" />
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-[#d8e3fb] bg-[#fbfdff] p-3">
        <p className="text-xs font-black text-[#0f64ff]">Ace Coach 记牌提示</p>
        <p className="mt-1 text-xs font-bold leading-5 text-[#42657c]">{buildCounterHint(counts)}</p>
      </section>
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
        "rounded-xl border px-2 py-2 text-center",
        count === 0 ? "border-[#ffd8d8] bg-[#fff3f3]" : "border-[#d8e3fb] bg-white",
        isLevel && "border-[#f2c24c] bg-[#fff8dc] shadow-[0_0_0_1px_rgba(242,194,76,0.45)]"
      )}
    >
      <p className="text-sm font-black">
        {rank}
        {isLevel ? <span className="ml-1 text-[10px] text-[#9a6800]">级</span> : null}
      </p>
      <p className={cn("mt-0.5 text-xs font-bold", count === 0 ? "text-[#ba1a1a]" : "text-[#346d92]")}>
        剩余 {count}
      </p>
    </div>
  );
}

function JokerCell({ count, label }: { count: number; label: string }) {
  return (
    <div className="rounded-xl border border-[#d8e3fb] bg-white px-3 py-2">
      <p className="text-xs font-black text-[#346d92]">{label}</p>
      <p className="mt-1 text-xl font-black text-[#12395a]">{count}</p>
    </div>
  );
}
