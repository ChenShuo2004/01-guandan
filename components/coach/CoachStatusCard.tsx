"use client";

import { motion } from "framer-motion";
import type { CoachAction } from "@/types/coach";
import { CoachAvatar } from "./CoachAvatar";

interface CoachStatusCardProps {
  action?: CoachAction;
  caption?: string;
  message: string;
  title?: string;
}

const statusCopy: Record<CoachAction, string> = {
  idle: "待命",
  wave: "欢迎",
  thinking: "分析中",
  point: "教学",
  warning: "提醒",
  happy: "鼓励",
  correct: "判断正确",
  wrong: "需要修正",
  celebrate: "训练完成"
};

const statusClasses: Partial<Record<CoachAction, string>> = {
  thinking: "border-blue-300/80 bg-blue-50 text-blue-700",
  warning: "border-amber-300/80 bg-amber-50 text-amber-700",
  wrong: "border-rose-300/80 bg-rose-50 text-rose-700",
  correct: "border-emerald-300/80 bg-emerald-50 text-emerald-700",
  celebrate: "border-amber-300/80 bg-amber-50 text-amber-700",
  point: "border-amber-300/80 bg-amber-50 text-amber-700"
};

export function CoachStatusCard({
  action = "wave",
  caption,
  message,
  title = "Ace AI Coach"
}: CoachStatusCardProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[24px] border border-white/75 bg-white/64 p-4 text-slate-950 shadow-[0_24px_70px_rgba(37,99,235,0.14)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
    >
      <div className="absolute -right-12 -top-16 h-36 w-36 rounded-full bg-amber-300/35 blur-3xl" />
      <div className="absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-cyan-300/24 blur-3xl" />

      <div className="relative flex gap-4">
        <motion.div
          animate={
            action === "thinking"
              ? { y: [0, -4, 0], rotate: [0, 1.5, 0] }
              : { y: [0, -3, 0] }
          }
          transition={{ duration: action === "thinking" ? 1.2 : 2.4, repeat: Infinity }}
        >
          <CoachAvatar action={action} />
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-blue-700">{title}</p>
            <span
              className={[
                "rounded-full border px-2 py-0.5 text-[11px] font-black",
                statusClasses[action] ?? "border-blue-200 bg-blue-50 text-blue-700"
              ].join(" ")}
            >
              {statusCopy[action]}
            </span>
          </div>
          <p className="mt-2 text-lg font-black leading-7">{message}</p>
          {caption ? (
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{caption}</p>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}
