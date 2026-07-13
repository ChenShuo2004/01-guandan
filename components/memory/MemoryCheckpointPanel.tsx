"use client";

import { useState } from "react";
import type { CardRank } from "@/lib/guandan/card";
import { getRankLabel } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";
import {
  getRankDisplayName,
  getAnswerOptions,
  getMaxPossibleCount,
} from "@/lib/memory/ObserverMemoryTraining";
import { PokerCard } from "@/components/cards/PokerCard";
import type { PokerCardData, PokerRank } from "@/types/poker";

function cardRankToPokerCard(rank: CardRank): PokerCardData {
  const rankMap: Record<number, PokerRank> = {
    16: "SJ", 17: "BJ", 14: "A", 15: "2", 11: "J", 12: "Q", 13: "K",
  };
  const pokerRank = rankMap[rank] ?? (String(rank) as PokerRank);
  const isJoker = rank >= 16;
  return { id: `cp-${rank}`, rank: pokerRank, ...(isJoker ? {} : { suit: "spade" }) };
}

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
    <div className="memory-checkpoint-overlay fixed inset-0 z-[180] grid place-items-center overflow-hidden bg-[#030318]/80 px-4 backdrop-blur-[10px] sm:px-6">
      <section
        className="memory-checkpoint-panel relative isolate min-w-0 w-full max-w-[520px] max-h-[86vh] overflow-x-hidden overflow-y-auto rounded-[30px] border border-[#765cff]/55 p-6 text-white shadow-[0_0_0_1px_rgba(130,102,255,0.12),0_28px_80px_rgba(0,0,0,0.58),0_0_48px_rgba(74,36,255,0.28),inset_0_1px_0_rgba(255,255,255,0.12)] sm:p-8"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(75, 40, 214, 0.34), transparent 38%), linear-gradient(145deg, rgba(21, 14, 74, 0.96), rgba(5, 8, 43, 0.94) 58%, rgba(19, 13, 71, 0.96))",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[10%] top-0 h-px bg-gradient-to-r from-transparent via-[#8d7bff] to-transparent shadow-[0_0_18px_4px_rgba(111,82,255,0.72)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 -z-10 h-52 w-52 rounded-full bg-[#3221c7]/20 blur-3xl"
        />
        <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#8de8ff]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8de8ff] shadow-[0_0_10px_2px_rgba(141,232,255,0.75)]" />
          MEMORY CHECKPOINT
        </p>
        <h2 className="mt-4 text-[22px] font-black leading-snug tracking-tight sm:text-[26px]">
          场上还有几张牌？（除去手牌）
        </h2>
        <div className="mt-5 space-y-4">
          {targetRanks.map((rank) => (
            <RankSelector
              key={rank}
              rank={rank}
              isLevel={rank === levelRank}
              levelRank={levelRank}
              value={answers[String(rank)] ?? 0}
              onChange={(v) => setAnswer(rank, v)}
            />
          ))}
        </div>
        <button
          className="mt-6 min-h-14 w-full rounded-2xl border border-white/20 bg-gradient-to-r from-[#285dff] via-[#5a44ff] to-[#714cff] text-base font-black shadow-[0_12px_30px_rgba(72,62,255,0.38),inset_0_1px_0_rgba(255,255,255,0.28)] transition hover:brightness-110 active:scale-[0.99]"
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
  levelRank,
  value,
  onChange,
}: {
  rank: CardRank;
  isLevel?: boolean;
  levelRank?: CardRank;
  value: number;
  onChange: (value: number) => void;
}) {
  const max = getMaxPossibleCount(rank);
  const options = getAnswerOptions(max);
  const isJoker = rank >= 16;
  const card = cardRankToPokerCard(rank);

  return (
    <div
      className={cn(
        "rounded-[20px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        isLevel
          ? "border-[#f6c65b]/40 bg-[#f6c65b]/10"
          : "border-[#8d7bff]/20 bg-[#080b2c]/55"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "relative h-11 w-11 shrink-0 overflow-hidden rounded-lg",
            isLevel && "ring-2 ring-[#f6c65b] shadow-[0_0_0_2px_rgba(246,198,91,0.50),0_0_16px_rgba(246,198,91,0.35)]"
          )}
        >
          <div
            className="absolute left-1/2 top-1/2"
            style={{ transform: "translate(-50%, -50%) scale(0.58)" }}
          >
            <PokerCard
              card={card}
              levelRank={levelRank ? getRankLabel(levelRank) : undefined}
              size="sm"
            />
          </div>
        </div>
        <p className={cn("text-sm font-black", isLevel ? "text-[#f6c65b]" : "text-white/70")}>
          {isJoker ? "大小王（合计）" : getRankDisplayName(rank)}
          {isLevel ? <span className="ml-2 text-xs text-[#f6c65b]/80">级牌</span> : null}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
        {options.map((option) => (
          <button
            className={`min-h-[44px] rounded-xl px-2 py-2 text-[18px] font-black transition ${
              value === option
                ? "bg-gradient-to-br from-[#2f6fff] to-[#6247ff] text-white shadow-[0_8px_18px_rgba(55,75,255,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]"
                : "border border-white/[0.06] bg-white/[0.07] text-white/70 hover:bg-white/[0.12]"
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
