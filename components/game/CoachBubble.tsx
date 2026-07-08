"use client";

import { motion } from "framer-motion";
import type { CoachFeedback } from "@/lib/coach/coachTypes";
import { cn } from "@/lib/utils";

interface CoachBubbleProps {
  feedback: CoachFeedback;
}

const typeLabel: Record<CoachFeedback["type"], string> = {
  tip: "提示",
  mistake: "纠错",
  praise: "鼓励",
  replay: "复盘"
};

export function CoachBubble({ feedback }: CoachBubbleProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "max-w-[360px] rounded-3xl border px-5 py-4 text-sm font-bold leading-6 text-white shadow-[0_14px_34px_rgba(18,82,123,0.24)] backdrop-blur-xl",
        feedback.type === "mistake"
          ? "border-[#ffd84d]/80 bg-[#17496d]/82"
          : "border-white/70 bg-[#14527b]/76"
      )}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, delay: 0.2 }}
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="text-xs font-black text-[#ffd84d]">Ace Coach · {typeLabel[feedback.type]}</p>
        {feedback.score ? (
          <span className="rounded-full bg-white/18 px-2 py-0.5 text-xs font-black text-white">
            {feedback.score} 分
          </span>
        ) : null}
      </div>
      <p className="text-[15px] font-black">{feedback.message}</p>
      <p className="mt-2 text-xs leading-5 text-white/82">{feedback.reason}</p>
      <p className="mt-1 text-xs leading-5 text-[#d8f4ff]">{feedback.suggestion}</p>
      {feedback.strengths && feedback.weaknesses ? (
        <div className="mt-3 grid gap-2 text-xs leading-5 text-white/85">
          <p>优势：{feedback.strengths[0]}</p>
          <p>下一练：{feedback.nextTraining}</p>
        </div>
      ) : null}
    </motion.div>
  );
}
