"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BackButton } from "@/components/layout/BackButton";
import { OpeningHeroTagline } from "./OpeningHeroTagline";
import "./OpeningHeroTagline.css";
import { SceneBackground } from "./SceneBackground";

export function OpeningScene() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#020a18] text-white">
      <SceneBackground variant="opening" />
      <BackButton />
      <section className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-[min(100%,1200px)] flex-col items-center justify-center px-4 py-10 text-center sm:px-8">
        <div className="w-full max-w-3xl">
          <motion.p
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            className="text-sm font-semibold uppercase tracking-[0.28em] text-[#c9f3ff]/85 sm:text-base"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            GUANDAN MEMORY LAB
          </motion.p>
          <motion.h1
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            className="mt-5 w-full text-[clamp(2.4rem,10vw,7.4rem)] font-extrabold leading-[1.02] tracking-[-0.015em] text-white [text-shadow:0_3px_18px_rgba(2,10,24,0.62),0_0_38px_rgba(114,207,255,0.28)]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 54 }}
            transition={{ duration: 0.82, ease: "easeOut" }}
          >
            掼蛋记牌训练
          </motion.h1>
        </div>

        <OpeningHeroTagline />

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
        >
          <Link className="opening-hero-cta mt-10" href="/practice">
            <span className="opening-hero-cta__label">开始记牌训练</span>
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
