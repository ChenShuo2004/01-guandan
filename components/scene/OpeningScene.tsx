"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SceneBackground } from "./SceneBackground";

export function OpeningScene() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#020a18] text-white">
      <SceneBackground variant="opening" />
      <section className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col items-center justify-center px-6 py-10 text-center sm:px-10">
        <motion.div animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl" initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <p className="text-sm font-semibold uppercase text-[#c9f3ff]/85 sm:text-base">GUANDAN MEMORY LAB</p>
          <motion.h1
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            className="mt-5 w-full whitespace-nowrap text-[clamp(2.4rem,10vw,7.4rem)] font-extrabold leading-[1.02] tracking-[-0.015em] text-white [text-shadow:0_3px_18px_rgba(2,10,24,0.62),0_0_38px_rgba(114,207,255,0.28)]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 54 }}
            transition={{ duration: 0.82, ease: "easeOut" }}
          >
            掼蛋记牌训练
          </motion.h1>
          <motion.p
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            className="mx-auto mt-6 w-full max-w-3xl whitespace-nowrap text-[clamp(0.56rem,2.1vw,1.5rem)] font-medium leading-[1.45] text-white/88 [text-shadow:0_2px_10px_rgba(2,10,24,0.78)]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
            transition={{ delay: 0.28, duration: 0.62, ease: "easeOut" }}
          >
            一小时，记住10张牌。让你的大脑像牌桌上的“雷达”，看穿对手每一次出牌。
          </motion.p>
        </motion.div>
        <motion.div animate={{ opacity: 1, y: 0 }} initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }} transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}>
          <Link
            className="mt-10 inline-flex min-h-16 min-w-64 items-center justify-center rounded-[22px] border border-[#ffe7a1]/60 bg-[#f6c65b] px-10 text-xl font-extrabold text-[#171101] shadow-[0_24px_80px_rgba(246,198,91,0.34)] transition hover:-translate-y-0.5 hover:bg-[#ffda75] hover:shadow-[0_30px_90px_rgba(246,198,91,0.42)] active:translate-y-0 sm:min-h-[72px] sm:min-w-80 sm:text-2xl"
            href="/practice"
          >
            开始记牌训练
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
