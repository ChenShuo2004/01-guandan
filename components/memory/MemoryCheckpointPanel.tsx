"use client";

import { useState } from "react";
import type { CardRank } from "@/lib/guandan/card";
import {
  getRankDisplayName,
  getAnswerOptions,
  getMaxPossibleCount,
} from "@/lib/memory/ObserverMemoryTraining";

interface MemoryCheckpointPanelProps {
  targetRanks: CardRank[];
  currentTargetCount: number;
  onSubmit: (answers: Record<string, number>) => void;
}

export function MemoryCheckpointPanel({
  targetRanks,
  currentTargetCount,
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
  value,
  onChange,
}: {
  rank: CardRank;
  value: number;
  onChange: (value: number) => void;
}) {
  const max = getMaxPossibleCount(rank);
  const options = getAnswerOptions(max);

  return (
    <div className="rounded-2xl bg-white/[0.06] p-4">
      <p className="text-sm font-black text-[#f6c65b]">
        {getRankDisplayName(rank)}
      </p>
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
