"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TrainingFeedback } from "@/types/training-session";

interface CoachFeedbackProps {
  feedback: TrainingFeedback | null;
}

const feedbackStyles: Record<TrainingFeedback["level"], string> = {
  correct: "border-emerald-300/55 bg-emerald-400/12 text-emerald-50",
  normal: "border-amber-300/55 bg-amber-300/12 text-amber-50",
  wrong: "border-rose-300/55 bg-rose-400/12 text-rose-50"
};

const levelLabel: Record<TrainingFeedback["level"], string> = {
  correct: "判断优秀",
  normal: "方向正确",
  wrong: "需要调整"
};

export function CoachFeedback({ feedback }: CoachFeedbackProps) {
  if (!feedback) {
    return (
      <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-5 text-white shadow-[0_20px_70px_rgba(15,23,42,0.28)] backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#77d7ff]">Ace Feedback</p>
        <p className="mt-3 text-xl font-black">等待你的判断</p>
        <p className="mt-2 text-sm leading-6 text-white/68">
          先观察场景和手牌结构，再选择出牌、不出或等待。
        </p>
      </div>
    );
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-3xl border p-5 shadow-[0_20px_70px_rgba(15,23,42,0.28)] backdrop-blur-xl",
        feedbackStyles[feedback.level]
      )}
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/58">Ace Feedback</p>
        <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-black">
          {levelLabel[feedback.level]}
        </span>
      </div>
      <p className="mt-4 text-xl font-black">{feedback.title}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-white/90">{feedback.message}</p>
      <div className="mt-4 space-y-3 text-sm leading-6 text-white/76">
        <p>
          <span className="font-black text-white">原因：</span>
          {feedback.reason}
        </p>
        <p>
          <span className="font-black text-white">建议：</span>
          {feedback.suggestion}
        </p>
      </div>
    </motion.section>
  );
}
