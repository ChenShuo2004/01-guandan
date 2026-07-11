"use client";

import { useState } from "react";
import type { CardRank } from "@/lib/guandan/card";
import type { MemoryCheckpointResult } from "@/lib/memory/ObserverMemoryTraining";
import { getRankDisplayName } from "@/lib/memory/ObserverMemoryTraining";
import { PokerCard } from "@/components/cards/PokerCard";
import type { PokerCardData, PokerRank } from "@/types/poker";
import { cn } from "@/lib/utils";

function cardRankToPokerCard(rank: CardRank): PokerCardData {
  const rankMap: Record<number, PokerRank> = {
    16: "SJ",
    17: "BJ",
    14: "A",
    15: "2",
    11: "J",
    12: "Q",
    13: "K",
  };
  const pokerRank = rankMap[rank] ?? (String(rank) as PokerRank);
  const isJoker = rank >= 16;
  return {
    id: `hist-${rank}`,
    rank: pokerRank,
    ...(isJoker ? {} : { suit: "spade" }),
  };
}

interface MemoryAnswerHistoryPanelProps {
  checkpoints: MemoryCheckpointResult[];
  currentPhase: string;
  currentTargetRanks: CardRank[];
  currentAnswers: Record<string, number>;
  visible: boolean;
}

export function MemoryAnswerHistoryPanel({
  checkpoints,
  currentPhase,
  currentTargetRanks,
  currentAnswers,
  visible,
}: MemoryAnswerHistoryPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (!visible) return null;

  const isAnswering = currentPhase === "ANSWERING";
  const lastCheckpoint = checkpoints[checkpoints.length - 1] ?? null;

  return (
    <div className="memory-answer-history pointer-events-auto fixed right-4 top-[104px] z-[100] w-[min(280px,26vw)] max-lg:right-3 max-lg:top-[90px] max-lg:w-[220px]">
      <button
        aria-label={expanded ? "隐藏回答记录" : "显示回答记录"}
        className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-white/75 bg-white/88 text-[#12395a] shadow-[0_12px_26px_rgba(28,109,172,0.18)] backdrop-blur-xl transition active:scale-[0.97]"
        onClick={() => setExpanded((v) => !v)}
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">
          {expanded ? "visibility_off" : "visibility"}
        </span>
      </button>

      {expanded ? (
        <div className="max-h-[min(420px,50vh)] overflow-y-auto rounded-2xl border border-[#74dfff]/40 bg-[#0e2944]/95 p-4 text-white shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-black text-[#74dfff]">
            {isAnswering ? "当前回答" : `回答记录 ${checkpoints.length} 次`}
          </p>

          {isAnswering ? (
            <div className="mt-3 space-y-2">
              {currentTargetRanks.map((rank) => {
                const key = String(rank);
                const answered = currentAnswers[key];
                return (
                  <div className="flex items-center gap-2" key={rank}>
                    <PokerCard card={cardRankToPokerCard(rank)} compact size="sm" />
                    <span
                      className={cn(
                        "text-sm font-black",
                        answered !== undefined ? "text-[#8ff0c7]" : "text-white/40"
                      )}
                    >
                      {answered !== undefined ? `${answered} 张` : "未答"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}

          {!isAnswering && checkpoints.length > 0 ? (
            <div className="mt-3 space-y-2">
              {[...checkpoints].reverse().map((cp, idx) => (
                <div
                  className={cn(
                    "rounded-xl p-2.5",
                    cp.accuracy >= 0.8
                      ? "bg-emerald-500/10"
                      : cp.accuracy >= 0.6
                        ? "bg-yellow-500/10"
                        : "bg-red-500/10"
                  )}
                  key={cp.id ?? idx}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">
                      本局 {cp.correctCount}/{cp.totalCount} 题
                    </span>
                    <span
                      className={cn(
                        "text-xs font-black",
                        cp.accuracy >= 0.8
                          ? "text-emerald-300"
                          : cp.accuracy >= 0.6
                            ? "text-yellow-300"
                            : "text-red-300"
                      )}
                    >
                      {Math.round(cp.accuracy * 100)}%
                    </span>
                  </div>
                  {cp.incorrectRanks.length > 0 ? (
                    <p className="mt-1 text-[10px] text-red-300/80">
                      漏记: {cp.incorrectRanks.map(getRankDisplayName).join(", ")}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {!isAnswering && checkpoints.length === 0 ? (
            <p className="mt-3 text-xs text-white/40">暂无回答记录</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
