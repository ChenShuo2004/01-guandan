"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface TrainingCardProps {
  ability: string;
  coachTip: string;
  day: number;
  href: string;
  rewardExperience: number;
  theme: string;
  title: string;
}

export function TrainingCard({
  ability,
  coachTip,
  day,
  href,
  rewardExperience,
  theme,
  title
}: TrainingCardProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[24px] border border-white/80 bg-white/72 p-5 text-slate-950 shadow-[0_24px_70px_rgba(37,99,235,0.16)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.46, ease: "easeOut" }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-300 to-amber-300" />
      <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-amber-300/30 blur-3xl" />
      <div className="absolute -bottom-24 left-8 h-48 w-48 rounded-full bg-blue-400/18 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-blue-600">今日训练 Day {day}</p>
            <h2 className="mt-2 text-2xl font-black leading-8">{theme}</h2>
          </div>
          <div className="rounded-full border border-amber-300/70 bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
            +{rewardExperience} XP
          </div>
        </div>

        <p className="mt-4 text-sm font-bold leading-6 text-slate-700">{title}</p>

        <div className="mt-4 rounded-[20px] border border-blue-100 bg-blue-50/80 p-4">
          <p className="text-xs font-black text-blue-600">训练目标</p>
          <p className="mt-1 text-base font-black leading-7">{coachTip}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <TrainingMeta label="预计时间" value="5 分钟" />
          <TrainingMeta label="能力模块" value={formatAbility(ability)} />
        </div>

        <Button
          className="mt-5 min-h-12 w-full rounded-[18px] bg-blue-600 text-white shadow-[0_18px_44px_rgba(37,99,235,0.28)] hover:bg-blue-500"
          href={href}
        >
          开始今天训练
        </Button>
      </div>
    </motion.section>
  );
}

function TrainingMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/72 px-3 py-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function formatAbility(ability: string) {
  const labels: Record<string, string> = {
    "bomb-timing": "炸弹时机",
    "bomb-restraint": "炸弹克制",
    "partner-support": "队友配合",
    "defense-blocking": "防守拦截",
    "loose-hand-management": "散牌处理",
    "high-card-decision": "大牌取舍",
    "full-game-review": "整局复盘"
  };

  return labels[ability] ?? ability;
}
