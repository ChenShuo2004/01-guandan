"use client";

import type { MemorySessionSummary } from "@/lib/memory/ObserverMemoryTraining";

interface MemorySessionSummaryProps {
  summary: MemorySessionSummary;
  onRestart: () => void;
  onExit: () => void;
}

export function MemorySessionSummaryPanel({
  summary,
  onRestart,
  onExit,
}: MemorySessionSummaryProps) {
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-[#071426]/90 px-5 backdrop-blur-md">
      <section className="w-full max-w-lg rounded-[28px] border border-[#74dfff]/45 bg-[#0e2944] p-6 text-white shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#74dfff]">
          TRAINING COMPLETE
        </p>
        <h2 className="mt-4 text-2xl font-black">记牌训练完成</h2>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatCard label="训练时间" value={`${summary.durationMinutes}分钟`} />
          <StatCard label="观察牌局" value={`${summary.handsCompleted} 副`} />
          <StatCard label="完成检查" value={`${summary.checkpointsCompleted} 次`} />
          <StatCard label="开始目标" value={`${summary.startTargetCount} 种牌`} />
          <StatCard label="最高目标" value={`${summary.bestTargetCount} 种牌`} />
          <StatCard label="总体准确率" value={`${summary.overallAccuracy}%`} />
          {summary.bestTenRankResult > 0 ? (
            <StatCard label="10 种牌最好成绩" value={`${summary.bestTenRankResult}/10`} />
          ) : null}
          {summary.mostMissedRank ? (
            <StatCard label="最容易漏记" value={summary.mostMissedRank} />
          ) : null}
        </div>
        <div className="mt-6 rounded-2xl bg-white/[0.06] p-4 text-center">
          <p className="text-sm font-bold text-white/70">
            {summary.bestTargetCount >= 8
              ? "你已经能够在第一视角 AI 牌局中，同时追踪 8 种以上牌。"
              : summary.bestTargetCount >= 5
              ? "你已经能够在第一视角 AI 牌局中，同时追踪 5 种牌。"
              : "继续训练，逐步提升同时追踪的牌种数量。"}
          </p>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            className="min-h-12 flex-1 rounded-2xl bg-white/10 text-sm font-black"
            onClick={onExit}
            type="button"
          >
            返回大厅
          </button>
          <button
            className="min-h-12 flex-1 rounded-2xl bg-[#0f64ff] text-sm font-black shadow-lg"
            onClick={onRestart}
            type="button"
          >
            重新开始
          </button>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.06] p-3 text-center">
      <p className="text-[10px] font-black text-white/50">{label}</p>
      <p className="mt-1 text-lg font-black text-[#74dfff]">{value}</p>
    </div>
  );
}
