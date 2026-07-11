"use client";

import type { CardRank } from "@/lib/guandan/card";
import type {
  MemoryCheckpointResult,
  MemoryRelevantEvent,
} from "@/lib/memory/ObserverMemoryTraining";
import { getRankDisplayName } from "@/lib/memory/ObserverMemoryTraining";

interface MemoryFeedbackPanelProps {
  checkpoint: MemoryCheckpointResult;
  errorEvents: MemoryRelevantEvent[];
  onContinue: () => void;
}

export function MemoryFeedbackPanel({
  checkpoint,
  errorEvents,
  onContinue,
}: MemoryFeedbackPanelProps) {
  const allCorrect = checkpoint.incorrectRanks.length === 0;

  return (
    <div className="fixed inset-0 z-[180] grid place-items-center bg-[#071426]/70 px-5 backdrop-blur-sm">
      <section className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-[28px] border border-[#74dfff]/45 bg-[#0e2944] p-6 text-white shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#74dfff]">
          CHECKPOINT RESULT
        </p>
        <h2 className="mt-4 text-xl font-black">
          {allCorrect
            ? "全部记对。"
            : `本局答对 ${checkpoint.correctCount}/${checkpoint.totalCount} 题。`}
        </h2>
        <div className="mt-5 space-y-3">
          {checkpoint.targetRanks.map((rank) => (
            <RankFeedbackItem
              correctAnswers={checkpoint.correctAnswers}
              incorrectRanks={checkpoint.incorrectRanks}
              key={rank}
              rank={rank}
              userAnswers={checkpoint.userAnswers}
            />
          ))}
        </div>
        {errorEvents.length > 0 ? (
          <div className="mt-5 rounded-2xl bg-white/[0.06] p-4">
            <p className="text-xs font-black text-[#ff7f8e]">错误回放</p>
            <div className="mt-3 space-y-2">
              {errorEvents.map((evt) => (
                <div className="text-sm text-white/70" key={evt.id}>
                  <span className="font-black text-white">
                    {evt.seat === "bottom" ? "你的手牌" : `${evt.seat}家`}
                  </span>
                  {evt.type === "INITIAL_VISIBLE_HAND"
                    ? ` 初始持有 ${evt.matchedTargetRanks.map(getRankDisplayName).join(", ")}`
                    : ` 打出 ${evt.matchedTargetRanks.map(getRankDisplayName).join(", ")}`}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <button
          className="mt-6 min-h-14 w-full rounded-2xl bg-[#0f64ff] text-base font-black shadow-lg"
          onClick={onContinue}
          type="button"
        >
          继续观察
        </button>
      </section>
    </div>
  );
}

function RankFeedbackItem({
  rank,
  correctAnswers,
  userAnswers,
  incorrectRanks,
}: {
  rank: CardRank;
  correctAnswers: Record<string, number>;
  userAnswers: Record<string, number>;
  incorrectRanks: CardRank[];
}) {
  const key = String(rank);
  const correct = correctAnswers[key] ?? 0;
  const user = userAnswers[key] ?? 0;
  const isCorrect = !incorrectRanks.includes(rank);

  return (
    <div
      className={`flex items-center justify-between rounded-xl p-3 ${
        isCorrect ? "bg-emerald-500/10" : "bg-red-500/10"
      }`}
    >
      <span className="text-sm font-black text-[#f6c65b]">
        {getRankDisplayName(rank)}
      </span>
      <span
        className={`text-sm font-black ${
          isCorrect ? "text-emerald-300" : "text-red-300"
        }`}
      >
        {isCorrect ? `回答 ${user} 正确` : `实际 ${correct}，你回答 ${user}`}
      </span>
    </div>
  );
}
