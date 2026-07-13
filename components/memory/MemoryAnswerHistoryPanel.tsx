"use client";

import { useEffect, useState } from "react";
import type { CardRank } from "@/lib/guandan/card";
import type { MemoryCheckpointResult, MemoryHandResult } from "@/lib/memory/ObserverMemoryTraining";
import { getRankDisplayName } from "@/lib/memory/ObserverMemoryTraining";
import { PokerCard } from "@/components/cards/PokerCard";
import type { PokerCardData, PokerRank } from "@/types/poker";
import { cn } from "@/lib/utils";

const placementLabels = ["头游", "二游", "三游", "四游"];

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
  handResults: MemoryHandResult[];
  currentHandId: string;
  currentPhase: string;
  currentTargetRanks: CardRank[];
  currentAnswers: Record<string, number>;
  visible: boolean;
}

export function MemoryAnswerHistoryPanel({
  checkpoints,
  handResults,
  currentHandId,
  currentPhase,
  currentTargetRanks,
  currentAnswers,
  visible,
}: MemoryAnswerHistoryPanelProps) {
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncExpandedWithViewport = () => setExpanded(!mediaQuery.matches);

    syncExpandedWithViewport();
    mediaQuery.addEventListener("change", syncExpandedWithViewport);
    return () => mediaQuery.removeEventListener("change", syncExpandedWithViewport);
  }, []);

  if (!visible) return null;

  const isAnswering = currentPhase === "ANSWERING";
  const currentHandCheckpoints = checkpoints.filter((checkpoint) => checkpoint.handId === currentHandId);
  const latestCheckpointHandId = checkpoints[checkpoints.length - 1]?.handId ?? currentHandId;
  const displayHandId = currentHandCheckpoints.length > 0 ? currentHandId : latestCheckpointHandId;
  const displayCheckpoints = checkpoints.filter((checkpoint) => checkpoint.handId === displayHandId);
  const displayingCurrentHand = displayHandId === currentHandId;
  const displayAnsweredQuestionCount = displayCheckpoints.reduce(
    (total, checkpoint) => total + checkpoint.totalCount,
    0
  );
  const displayCorrectQuestionCount = displayCheckpoints.reduce(
    (total, checkpoint) => total + checkpoint.correctCount,
    0
  );
  const displayAccuracy =
    displayAnsweredQuestionCount > 0
      ? displayCorrectQuestionCount / displayAnsweredQuestionCount
      : 0;
  const latestHandResult = handResults[handResults.length - 1] ?? null;

  return (
    <div className="memory-answer-history pointer-events-auto fixed right-3 top-[152px] z-[100] w-[min(280px,26vw)] max-lg:w-[220px] sm:right-4 sm:top-[104px]">
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
        <div className="memory-answer-history-scroll max-h-[min(420px,50vh)] overflow-y-auto rounded-2xl border border-[#74dfff]/40 bg-[#0e2944]/95 p-4 text-white shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-black text-[#74dfff]">
              {isAnswering
                ? "当前回答"
                : `${displayingCurrentHand ? "本局" : "上一局"}问题记录 ${displayCheckpoints.length} 题`}
            </p>
            {!isAnswering && displayCheckpoints.length > 0 ? (
              <span className="text-xs font-black text-[#8ff0c7]">
                {displayingCurrentHand ? "本局" : "上一局"}胜率 {Math.round(displayAccuracy * 100)}%
              </span>
            ) : null}
          </div>

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

          {!isAnswering && displayCheckpoints.length > 0 ? (
            <div className="mt-3 space-y-2">
              {displayCheckpoints.map((checkpoint, index) => (
                <div
                  className={cn(
                    "rounded-xl p-2.5",
                    checkpoint.accuracy >= 0.8
                      ? "bg-emerald-500/10"
                      : checkpoint.accuracy >= 0.6
                        ? "bg-yellow-500/10"
                        : "bg-red-500/10"
                  )}
                  key={checkpoint.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-white/80">
                      问题 {index + 1}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-black",
                        checkpoint.accuracy >= 0.8
                          ? "text-emerald-300"
                          : checkpoint.accuracy >= 0.6
                            ? "text-yellow-300"
                            : "text-red-300"
                      )}
                    >
                      正确率 {Math.round(checkpoint.accuracy * 100)}%
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-white/55">
                    已答 {checkpoint.correctCount}/{checkpoint.totalCount} 题
                  </p>
                  {checkpoint.incorrectRanks.length > 0 ? (
                    <p className="mt-1 text-[10px] text-red-300/80">
                      漏记: {checkpoint.incorrectRanks.map(getRankDisplayName).join(", ")}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {!isAnswering && displayCheckpoints.length === 0 ? (
            <p className="mt-3 text-xs text-white/40">本局暂无已回答问题</p>
          ) : null}

          {!isAnswering && latestHandResult ? (
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-[10px] font-black text-[#74dfff]">
                {latestHandResult.handId === displayHandId ? "本局出完牌顺序" : "上一局出完牌顺序"}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] font-bold text-white/75">
                {latestHandResult.placements.map((placement, placementIndex) => (
                  <span key={placement.playerId}>
                    {placementLabels[placementIndex]} · {placement.playerName}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
