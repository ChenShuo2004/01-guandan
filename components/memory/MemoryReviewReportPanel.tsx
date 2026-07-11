"use client";

import type { MemoryCheckpointResult, MemorySessionSummary } from "@/lib/memory/ObserverMemoryTraining";

interface MemoryReviewReportPanelProps {
  checkpoints: MemoryCheckpointResult[];
  summary: MemorySessionSummary;
  canResume: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export function MemoryReviewReportPanel({
  checkpoints,
  summary,
  canResume,
  onResume,
  onRestart,
  onExit,
}: MemoryReviewReportPanelProps) {
  return (
    <div className="fixed inset-0 z-[220] grid place-items-center bg-[#071426]/88 px-5 backdrop-blur-md">
      <section className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[#74dfff]/45 bg-[#0e2944] p-6 text-white shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#74dfff]">REVIEW REPORT</p>
        <h2 className="mt-3 text-2xl font-black">记牌训练复盘报告</h2>
        <p className="mt-2 text-sm font-bold text-white/60">本报告按答对题数 ÷ 总题数计算胜率。</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ReportStat label="可记录牌种" value={`${summary.bestTargetCount} 种`} />
          <ReportStat label="总体胜率" value={`${summary.overallAccuracy}%`} />
          <ReportStat label="答题局数" value={`${summary.checkpointsCompleted} 局`} />
          <ReportStat label="训练时长" value={`${summary.durationMinutes} 分钟`} />
        </div>

        <div className="mt-6 rounded-2xl bg-white/[0.06] p-4">
          <p className="text-sm font-black text-[#8de8ff]">当前能力判断</p>
          <p className="mt-2 text-sm font-bold leading-6 text-white/75">
            {summary.bestTargetCount >= 10
              ? "当前可以稳定记录 10 种以上关键牌。"
              : summary.bestTargetCount >= 5
                ? `当前可以记录约 ${summary.bestTargetCount} 种关键牌，继续提高连续答对率。`
                : `当前建议先稳定记录 ${Math.max(2, summary.bestTargetCount)} 种关键牌，再逐步增加目标。`}
          </p>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-[#8de8ff]">逐局记录</p>
            <span className="text-xs font-bold text-white/45">最近 {Math.min(8, checkpoints.length)} 局</span>
          </div>
          <div className="mt-3 space-y-2">
            {checkpoints.length > 0 ? [...checkpoints].slice(-8).reverse().map((checkpoint, index) => (
              <div className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3 py-2.5" key={checkpoint.id ?? index}>
                <span className="text-sm font-bold text-white/70">第 {checkpoints.length - index} 局</span>
                <span className="text-sm font-black text-[#8ff0c7]">
                  {checkpoint.correctCount}/{checkpoint.totalCount} 题 · {Math.round(checkpoint.accuracy * 100)}%
                </span>
              </div>
            )) : <p className="text-sm text-white/45">还没有完成检查点。</p>}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {canResume ? (
            <button className="min-h-12 flex-1 rounded-2xl bg-white/10 px-4 text-sm font-black" onClick={onResume} type="button">
              返回训练
            </button>
          ) : null}
          <button className="min-h-12 flex-1 rounded-2xl bg-white/10 px-4 text-sm font-black" onClick={onExit} type="button">
            退出训练
          </button>
          <button className="min-h-12 flex-1 rounded-2xl bg-[#0f64ff] px-4 text-sm font-black shadow-lg" onClick={onRestart} type="button">
            重新开始
          </button>
        </div>
      </section>
    </div>
  );
}

function ReportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.06] p-3 text-center">
      <p className="text-[10px] font-black text-white/50">{label}</p>
      <p className="mt-1 text-lg font-black text-[#74dfff]">{value}</p>
    </div>
  );
}
