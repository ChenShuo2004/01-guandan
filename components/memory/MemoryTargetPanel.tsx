"use client";

import { useState, useEffect } from "react";
import type { CardRank } from "@/lib/guandan/card";
import { getRankDisplayName } from "@/lib/memory/ObserverMemoryTraining";
import type { Card } from "@/lib/guandan/card";

interface MemoryTargetPanelProps {
  targetRanks: CardRank[];
  currentTargetCount: number;
  allCardsById: Record<string, Card>;
  visible: boolean;
}

export function MemoryTargetPanel({
  targetRanks,
  currentTargetCount,
  allCardsById,
  visible,
}: MemoryTargetPanelProps) {
  if (!visible || targetRanks.length === 0) return null;

  return (
    <div className="pointer-events-none fixed left-4 top-[104px] z-[100] w-[min(220px,22vw)] rounded-2xl border border-[#74dfff]/40 bg-[#0e2944]/95 p-4 text-white shadow-2xl backdrop-blur-xl max-lg:left-3 max-lg:top-[90px] max-lg:w-[180px]">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#74dfff]">
        TRACKING {currentTargetCount} TYPES
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {targetRanks.map((rank) => (
          <div
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1"
            key={rank}
          >
            <span className="text-sm font-black text-[#f6c65b]">
              {getRankDisplayName(rank)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] font-bold text-white/50">
        记住已确认出现的数量
      </p>
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
    <div className="fixed inset-0 z-[200] grid place-items-center bg-[#071426]/85 px-5 backdrop-blur-md">
      <section className="w-full max-w-md rounded-[28px] border border-[#74dfff]/45 bg-[#0e2944] p-6 text-white shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#74dfff]">
          OBSERVATION PHASE
        </p>
        <h2 className="mt-4 text-xl font-black">
          记住这 {currentTargetCount} 种牌
        </h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {targetRanks.map((rank) => (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-[#f6c65b]/60 bg-[#f6c65b]/15 text-2xl font-black text-[#f6c65b]"
              key={rank}
            >
              {getRankDisplayName(rank)}
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-sm font-bold text-white/60">
          观察手牌中这些牌的数量
        </p>
        <ObservationTimer
          durationMs={observationTimeMs}
          onComplete={onObservationComplete}
        />
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

