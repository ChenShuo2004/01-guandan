"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SceneBackground } from "@/components/scene/SceneBackground";
import { LanyardCard } from "@/components/practice/LanyardCard";

const battleFeatures = ["AI 对手模拟", "实时牌局", "出牌决策", "AI 教练复盘"];
const memoryFeatures = ["自动对局", "关键牌追踪", "记牌测试", "AI 教练反馈"];

export function BattleTrainingCard() {
  return <LanyardCard accent="cyan" description="真实模拟掼蛋牌局，训练出牌策略和临场判断。" features={battleFeatures} href="/training" icon="♠" label="LIVE ARENA" title="AI 实战训练" />;
}

export function MemoryTrainingCard() {
  return <LanyardCard accent="gold" description="专注训练掼蛋高手必备能力：观察、记忆、计算。" features={memoryFeatures} href="/practice/practice-when-to-bomb-001" icon="◉" label="MEMORY LAB" title="AI 记牌训练" />;
}

export function PracticeHome() {
  const shouldReduceMotion = useReducedMotion();
  return (
    <main className="practice-page relative min-h-[100dvh] overflow-x-hidden bg-[#020a18] px-5 py-8 text-white sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <SceneBackground variant="entry" />
      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1180px] flex-col justify-center sm:min-h-[calc(100dvh-6rem)] lg:min-h-[calc(100dvh-8rem)]">
        <motion.div animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }} initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-center">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.34em] text-[#7edfff]/75">Choose your training</p>
          <h1 className="text-4xl font-black tracking-[-0.04em] text-white drop-shadow-[0_0_28px_rgba(114,207,255,0.28)] sm:text-6xl lg:text-7xl">AI 掼蛋训练营</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-6 text-white/60 sm:text-base">拉住一张训练卡，开始今天的判断训练。</p>
        </motion.div>
        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-12 lg:mt-16 lg:gap-20"><BattleTrainingCard /><MemoryTrainingCard /></div>
      </section>
    </main>
  );
}
