"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SceneBackground } from "@/components/scene/SceneBackground";

export function PracticeHome() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#020a18] px-5 py-8 text-white sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <SceneBackground variant="entry" />
      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[760px] flex-col justify-center">
        <motion.div animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }} initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.34em] text-[#7edfff]/75">Memory training</p>
          <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">记牌训练场</h1>
          <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-white/65 sm:text-base">一边观察自动进行的牌局，一边记住已经出现的关键牌，在测试点检验自己的记忆。</p>
        </motion.div>
        <motion.div animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }} className="mt-10 rounded-[28px] border border-[#68d8ff]/25 bg-[#0e2944]/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8" initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }} transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}>
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#74dfff]">Memory lab</p>
              <h2 className="mt-3 text-2xl font-black sm:text-3xl">关键牌追踪</h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-[#b8cde0]">自动牌局会持续推进。你需要记住炸弹、A 和大小王等关键牌的出现情况，系统会在中途发起记牌测试。</p>
            </div>
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#f6c65b] text-2xl text-[#171101]">♠</div>
          </div>
          <ul className="mt-6 grid gap-3 text-sm font-bold text-[#d8efff] sm:grid-cols-3">
            <li className="rounded-xl bg-white/[0.07] p-3">自动推进牌局</li>
            <li className="rounded-xl bg-white/[0.07] p-3">追踪关键牌</li>
            <li className="rounded-xl bg-white/[0.07] p-3">即时记牌测试</li>
          </ul>
          <Link className="mt-7 flex min-h-14 items-center justify-center rounded-2xl bg-[#0f64ff] text-base font-black shadow-lg transition hover:bg-[#2b7aff]" href="/practice/practice-when-to-bomb-001">开始一轮训练</Link>
        </motion.div>
      </section>
    </main>
  );
}
