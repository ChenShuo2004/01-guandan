"use client";

import { trainingChallenges } from "@/training";

export function TrainingModePanel() {
  const decision = trainingChallenges.find((challenge) => challenge.mode === "decision");

  return (
    <section className="rounded-[28px] border border-white/65 bg-white/45 p-4 shadow-[0_18px_45px_rgba(38,126,190,0.18)] backdrop-blur-xl">
      <p className="mb-3 text-sm font-black text-[#12395a]">训练模式</p>
      <div className="grid gap-2 text-xs font-black text-[#17496d]">
        <button className="rounded-2xl bg-white/70 px-3 py-2 text-left" type="button">
          AI 陪练
        </button>
        <button className="rounded-2xl bg-[#ffd84d]/90 px-3 py-2 text-left text-[#5a4100]" type="button">
          关键决策
        </button>
        <button className="rounded-2xl bg-white/45 px-3 py-2 text-left" type="button">
          残局挑战
        </button>
      </div>
      {decision ? (
        <div className="mt-3 rounded-2xl bg-white/50 p-3 text-xs font-bold leading-5 text-[#225b81]">
          <p className="font-black text-[#12395a]">{decision.title}</p>
          <p className="mt-1">{decision.prompt}</p>
        </div>
      ) : null}
    </section>
  );
}
