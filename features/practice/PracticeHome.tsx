"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MemoryLabFeatureCard } from "@/components/practice/MemoryLabFeatureCard";
import { TiltedCard } from "@/components/practice/TiltedCard";
import { SceneBackground } from "@/components/scene/SceneBackground";

export function PracticeHome() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#020a18] px-5 py-6 text-white sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <SceneBackground variant="entry" />
      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-[760px] flex-col justify-center">
        <motion.div animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }} initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.34em] text-[#7edfff]/75">Memory training</p>
          <h1 className="text-[clamp(2.4rem,8vw,3.75rem)] font-black leading-tight text-white">记牌训练场</h1>
        </motion.div>
        <motion.div
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="mt-8 sm:mt-10"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
        >
          <TiltedCard
            className="practice-home-card"
            containerHeight="clamp(360px, 62dvh, 460px)"
            displayOverlayContent
            hideImage
            imageHeight="100%"
            overlayContent={<MemoryLabFeatureCard href="/practice/practice-when-to-bomb-001" />}
            rotateAmplitude={6}
            scaleOnHover={1.015}
            showMobileWarning={false}
            showTooltip={false}
          />
        </motion.div>
      </section>
    </main>
  );
}
