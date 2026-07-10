"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CoachSceneImage } from "@/components/coach/CoachSceneImage";
import { SceneBackground } from "./SceneBackground";

export function OpeningScene() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#020a18] text-white">
      <SceneBackground variant="opening" />

      <section className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col items-center justify-center px-5 py-8 text-center sm:px-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative aspect-square h-[min(34dvh,18rem)]"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut" }}
        >
          <div className="absolute inset-[12%] rounded-full bg-[#7ecfff]/[0.24] blur-3xl" />
          <motion.div
            animate={shouldReduceMotion ? undefined : { scale: [1, 1.018, 1], y: [0, -8, 0] }}
            className="relative h-full w-full drop-shadow-[0_20px_38px_rgba(0,12,38,0.58)]"
            transition={{ duration: 4.6, ease: "easeInOut", repeat: Infinity }}
          >
            <CoachSceneImage
              assetId="coach-victory-celebration"
              className="!overflow-visible"
              imageClassName="!object-contain"
              priority
              sizes="(max-width: 600px) 220px, 360px"
            />
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 max-w-xl"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.2, duration: shouldReduceMotion ? 0 : 0.7, ease: "easeOut" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[#bfeeff]/[0.78] sm:text-xs">
            Ace AI Training Space
          </p>
          <h1 className="mt-4 text-[clamp(2rem,6vw,4rem)] font-black leading-tight tracking-[-0.03em] text-white drop-shadow-[0_0_28px_rgba(114,207,255,0.32)]">
            一小时学会记11张牌
          </h1>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.45, duration: shouldReduceMotion ? 0 : 0.7, ease: "easeOut" }}
        >
          <Link
            className="mt-8 inline-flex h-14 min-w-52 items-center justify-center rounded-2xl border border-[#f6c65b]/45 bg-[#f6c65b] px-7 text-base font-black text-[#171101] shadow-[0_22px_70px_rgba(246,198,91,0.28)] transition hover:bg-[#ffd978] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f6c65b]/25"
            href="/training"
          >
            开始今日训练
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
