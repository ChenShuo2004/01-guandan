"use client";

import { useState, useEffect } from "react";
import type { CardRank } from "@/lib/guandan/card";
import { getRankDisplayName } from "@/lib/memory/ObserverMemoryTraining";
import { PokerCard } from "@/components/cards/PokerCard";
import type { PokerCardData, PokerRank } from "@/types/poker";

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
    id: `target-${rank}`,
    rank: pokerRank,
    ...(isJoker ? {} : { suit: "spade" }),
  };
}

interface MemoryTargetPanelProps {
  targetRanks: CardRank[];
  currentTargetCount: number;
  visible: boolean;
}

export function MemoryTargetPanel({
  targetRanks,
  currentTargetCount,
  visible,
}: MemoryTargetPanelProps) {
  if (!visible || targetRanks.length === 0) return null;

  return (
    <div className="memory-target-panel pointer-events-none fixed left-4 top-[104px] z-[100] max-lg:left-3 max-lg:top-[90px]">
      <div className="memory-target-panel-card rounded-2xl border border-[#74dfff]/40 bg-[#0e2944]/95 px-4 py-3 text-white shadow-2xl backdrop-blur-xl">
        <p className="text-base font-black text-[#74dfff] max-lg:text-sm">当前需要记牌</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {targetRanks.map((rank) => (
            <PokerCard
              card={cardRankToPokerCard(rank)}
              key={rank}
              size={rank >= 16 ? "joker" : "md"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface MemoryTargetOverlayProps {
  targetRanks: CardRank[];
  currentTargetCount: number;
  observationTimeMs: number;
  onObservationComplete: () => void;
  visible: boolean;
}

export function MemoryTargetOverlay({
  targetRanks,
  currentTargetCount,
  observationTimeMs,
  onObservationComplete,
  visible,
}: MemoryTargetOverlayProps) {
  if (!visible) return null;

  return (
    <div className="memory-target-overlay fixed inset-0 z-[200] grid place-items-center bg-[#071426]/88 px-4 py-4 backdrop-blur-lg sm:px-8">
      <section
        className="memory-target-overlay-panel relative flex min-h-[min(720px,82dvh)] w-full max-w-5xl flex-col overflow-hidden rounded-[34px] border border-[#8fe9ff]/45 bg-[radial-gradient(circle_at_22%_52%,rgba(232,65,255,0.24),transparent_34%),radial-gradient(circle_at_72%_28%,rgba(20,101,255,0.24),transparent_38%),linear-gradient(135deg,#10243b_0%,#09192d_58%,#101d31_100%)] px-6 py-6 text-white shadow-[0_35px_100px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] sm:px-10 sm:py-8"
      >
        <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(120deg,transparent_28%,rgba(47,111,255,0.35)_29%,transparent_30%),linear-gradient(60deg,transparent_62%,rgba(237,63,255,0.28)_63%,transparent_64%)] [background-size:160px_140px]" />
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#6ee7ff] sm:text-sm">
            MEMORY · OBSERVATION PHASE
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            记住这 {currentTargetCount} 种牌
          </h2>
          <p className="mt-3 text-sm font-bold text-white/65 sm:text-base">
            观察手牌中这些牌的数量
          </p>
        </div>
        <div className="memory-target-cards relative z-10 flex flex-1 flex-wrap items-center justify-center gap-7 py-5 sm:gap-10">
          {targetRanks.map((rank, index) => (
            <div
              className="rounded-[18px] shadow-[0_0_0_4px_rgba(238,93,255,0.72),0_0_42px_rgba(223,55,255,0.75),0_28px_50px_rgba(0,0,0,0.42)]"
              key={rank}
              style={{ transform: `rotate(${index % 2 === 0 ? -5 : 5}deg)` }}
            >
              <PokerCard
                card={cardRankToPokerCard(rank)}
                size="hero"
                variant="played"
              />
            </div>
          ))}
        </div>
        <div className="relative z-10 mx-auto w-full max-w-2xl">
          <ObservationTimer
            durationMs={observationTimeMs}
            onComplete={onObservationComplete}
          />
        </div>
      </section>
    </div>
  );
}

function ObservationTimer({
  durationMs,
  onComplete,
}: {
  durationMs: number;
  onComplete: () => void;
}) {
  const [remaining, setRemaining] = useState(durationMs);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, durationMs - elapsed);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        onComplete();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [durationMs, onComplete]);

  const seconds = Math.ceil(remaining / 1000);
  const progress = 1 - remaining / durationMs;

  return (
    <div className="mt-4">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#0f64ff] transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="mt-2 text-center text-xs font-black text-white/40">
        {seconds}s
      </p>
    </div>
  );
}
