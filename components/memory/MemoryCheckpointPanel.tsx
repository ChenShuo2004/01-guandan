"use client";

import { useState } from "react";
import type { CardRank } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";
import {
  getRankDisplayName,
  getAnswerOptions,
  getMaxPossibleCount,
} from "@/lib/memory/ObserverMemoryTraining";

interface MemoryCheckpointPanelProps {
  targetRanks: CardRank[];
  currentTargetCount: number;
  levelRank?: CardRank;
  onSubmit: (answers: Record<string, number>) => void;
}

export function MemoryCheckpointPanel({
  targetRanks,
  currentTargetCount,
  levelRank,
  onSubmit,
}: MemoryCheckpointPanelProps) {
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const rank of targetRanks) {
      initial[String(rank)] = 0;
    }
    return initial;
  });

  function setAnswer(rank: CardRank, value: number) {
    setAnswers((prev) => ({ ...prev, [String(rank)]: value }));
  }

  function handleSubmit() {
    onSubmit(answers);
  }

  return (
    <div className="fixed inset-0 z-[180] grid place-items-center bg-[#071426]/70 px-5 backdrop-blur-sm">
      <section className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-[28px] border border-[#74dfff]/45 bg-[#0e2944] p-6 text-white shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#74dfff]">
          MEMORY CHECKPOINT
        </p>
        <h2 className="mt-4 text-xl font-black">
          每种目标牌已确认出现几张？
        </h2>
        <p className="mt-2 text-sm font-bold text-white/50">
          追踪 {currentTargetCount} 种牌
        </p>
        <div className="mt-5 space-y-4">
          {targetRanks.map((rank) => (
            <RankSelector
              key={rank}
              rank={rank}
              isLevel={rank === levelRank}
              value={answers[String(rank)] ?? 0}
              onChange={(v) => setAnswer(rank, v)}
            />
          ))}
        </div>
        <button
          className="mt-6 min-h-14 w-full rounded-2xl bg-[#0f64ff] text-base font-black shadow-lg"
          onClick={handleSubmit}
          type="button"
        >
          提交答案
        </button>
      </section>
    </div>
  );
}

function RankSelector({
  rank,
  isLevel = false,
  value,
  onChange,
}: {
  rank: CardRank;
  isLevel?: boolean;
  value: number;
  onChange: (value: number) => void;
}) {
  const max = getMaxPossibleCount(rank);
  const options = getAnswerOptions(max);

  return (
    <div className={cn("rounded-2xl p-4", isLevel ? "bg-[#f6c65b]/10 ring-1 ring-[#f6c65b]/40" : "bg-white/[0.06]")}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-lg border-2 text-2xl font-black shadow-[0_5px_12px_rgba(164,105,0,0.16)]",
            isLevel
              ? "border-[#f6c65b] bg-white text-[#0f172a] shadow-[0_0_0_2px_rgba(246,198,91,0.50),0_0_16px_rgba(246,198,91,0.35),0_5px_12px_rgba(164,105,0,0.16)]"
              : "border-white/40 bg-white/90 text-[#0f172a]"
          )}
        >
          {getRankDisplayName(rank).replace("小王", "SJ").replace("大王", "BJ")}
        </div>
        <p className={cn("text-sm font-black", isLevel ? "text-[#f6c65b]" : "text-white/70")}>
          {getRankDisplayName(rank)}
          {isLevel ? <span className="ml-2 text-xs text-[#f6c65b]/80">级牌</span> : null}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            className={`min-w-[40px] rounded-xl px-3 py-2 text-sm font-black transition ${
              value === option
                ? "bg-[#0f64ff] text-white"
                : "bg-white/10 text-white/70 hover:bg-white/15"
            }`}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
