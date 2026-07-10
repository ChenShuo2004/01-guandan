"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { TiltedCard } from "@/components/practice/TiltedCard";
import { SceneBackground } from "@/components/scene/SceneBackground";

export function PracticeHome() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#020a18] px-5 py-8 text-white sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <SceneBackground variant="entry" />
      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[760px] flex-col justify-center">
        <motion.div animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }} initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.34em] text-[#7edfff]/75">Memory training</p>
          <h1 className="font-serif text-4xl font-normal text-white sm:text-6xl">记牌训练场</h1>
        </motion.div>
        <motion.div
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="mt-10"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
        >
          <TiltedCard
            altText=""
            captionText="关键牌追踪 · 记牌训练"
            containerHeight="430px"
            displayOverlayContent
            imageHeight="100%"
            imageSrc="/assets/arena/sky-training-arena.png"
            imageWidth="100%"
            overlayContent={
              <div className="flex h-full flex-col rounded-[28px] border border-[#68d8ff]/35 bg-[#0a2037]/78 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#74dfff]">Memory lab</p>
                    <h2 className="mt-3 font-serif text-3xl font-normal text-white sm:text-4xl">关键牌追踪</h2>
                  </div>
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#f6c65b] text-2xl text-[#171101]">♠</div>
                </div>
                <ul className="mt-8 grid gap-3 text-sm font-bold text-[#d8efff] sm:grid-cols-3">
                  <li className="rounded-xl bg-white/[0.07] p-3">自动推进牌局</li>
                  <li className="rounded-xl bg-white/[0.07] p-3">追踪关键牌</li>
                  <li className="rounded-xl bg-white/[0.07] p-3">即时记牌测试</li>
                </ul>
                <Link className="mt-auto flex min-h-14 items-center justify-center rounded-2xl bg-[#0f64ff] text-base font-black shadow-lg transition hover:bg-[#2b7aff]" href="/practice/practice-when-to-bomb-001">开始训练</Link>
              </div>
            }
            rotateAmplitude={7}
            scaleOnHover={1.02}
            showMobileWarning={false}
          />
        </motion.div>
      </section>
    </main>
  );
}
