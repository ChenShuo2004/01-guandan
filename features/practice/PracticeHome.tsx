"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SceneBackground } from "@/components/scene/SceneBackground";

const battleFeatures = ["AI 对手模拟", "实时牌局", "出牌决策", "AI 教练复盘"];
const memoryFeatures = ["AI 自动对局", "关键牌追踪", "记牌测试", "AI 教练反馈"];

interface TrainingCardProps {
  accent: "cyan" | "gold";
  description: string;
  features: string[];
  href: string;
  icon: string;
  label: string;
  title: string;
}

function TrainingCard({
  accent,
  description,
  features,
  href,
  icon,
  label,
  title
}: TrainingCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const isGold = accent === "gold";
  const accentColor = isGold ? "#ffd36d" : "#7edfff";
  const cardClasses = isGold
    ? "border-[#ffd36d]/35 bg-[linear-gradient(145deg,rgba(57,42,18,0.84),rgba(10,26,44,0.82))] hover:border-[#ffd36d]/75 hover:shadow-[0_28px_90px_rgba(255,190,65,0.2)]"
    : "border-[#7edfff]/35 bg-[linear-gradient(145deg,rgba(13,54,79,0.86),rgba(8,22,43,0.84))] hover:border-[#7edfff]/75 hover:shadow-[0_28px_90px_rgba(64,188,255,0.22)]";

  return (
    <motion.div
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        aria-label={`进入${title}`}
        className={`group relative flex min-h-[280px] flex-col overflow-hidden rounded-[28px] border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd36d] focus-visible:ring-offset-4 focus-visible:ring-offset-[#020a18] sm:min-h-[310px] sm:p-8 ${cardClasses}`}
        href={href}
      >
        <span
          aria-hidden="true"
          className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10 bg-white/[0.04] blur-[1px] transition duration-500 group-hover:scale-125 group-hover:bg-white/[0.08]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-[-30%] top-1/2 h-24 -translate-y-1/2 rotate-[-12deg] bg-white/[0.06] blur-2xl transition duration-500 group-hover:bg-white/[0.12]"
        />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: accentColor }}>
              {label}
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h2>
          </div>
          <span
            aria-hidden="true"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border bg-white/[0.08] text-2xl shadow-[0_0_24px_rgba(126,223,255,0.18)] transition duration-300 group-hover:rotate-[-6deg] group-hover:scale-110"
            style={{ borderColor: `${accentColor}66`, color: accentColor }}
          >
            <span className="material-symbols-outlined text-[28px]">{icon}</span>
          </span>
        </div>

        <p className="relative mt-5 max-w-md text-sm font-medium leading-6 text-white/70 sm:text-base">{description}</p>

        <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {features.map((feature) => (
            <span
              className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-center text-xs font-bold text-white/78 transition duration-300 group-hover:border-white/20 group-hover:bg-white/[0.1]"
              key={feature}
            >
              {feature}
            </span>
          ))}
        </div>

        <span className="relative mt-auto flex items-center justify-between pt-7 text-sm font-black text-white">
          <span>开始训练</span>
          <span className="flex items-center gap-2" style={{ color: accentColor }}>
            进入训练空间
            <span aria-hidden="true" className="text-xl transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

export function BattleTrainingCard() {
  return (
    <TrainingCard
      accent="cyan"
      description="真实模拟掼蛋牌局，训练出牌策略和临场判断。"
      features={battleFeatures}
      href="/training"
      icon="sports_esports"
      label="LIVE ARENA"
      title="AI 实战训练"
    />
  );
}

export function MemoryTrainingCard() {
  return (
    <TrainingCard
      accent="gold"
      description="专注训练掼蛋高手必备能力：观察、记忆、计算。"
      features={memoryFeatures}
      href="/practice/practice-when-to-bomb-001"
      icon="visibility"
      label="MEMORY LAB"
      title="AI 记牌训练"
    />
  );
}

export function PracticeHome() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#020a18] px-5 py-8 text-white sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <SceneBackground variant="entry" />
      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1180px] flex-col justify-center sm:min-h-[calc(100dvh-6rem)] lg:min-h-[calc(100dvh-8rem)]">
        <motion.h1
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="text-center text-4xl font-black tracking-[-0.04em] text-white drop-shadow-[0_0_28px_rgba(114,207,255,0.28)] sm:text-6xl lg:text-7xl"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          AI 掼蛋训练营
        </motion.h1>

        <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6 lg:mt-14">
          <BattleTrainingCard />
          <MemoryTrainingCard />
        </div>
      </section>
    </main>
  );
}
