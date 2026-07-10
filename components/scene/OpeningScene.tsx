"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SceneBackground } from "./SceneBackground";

export function OpeningScene() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#020a18] text-white">
      <SceneBackground variant="opening" />
      <section className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col items-center justify-center px-5 py-8 text-center sm:px-8">
        <motion.div animate={{ opacity: 1, y: 0 }} className="max-w-xl" initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[#bfeeff]/[0.78] sm:text-xs">GUANDAN MEMORY LAB</p>
          <h1 className="mt-4 text-[clamp(2.2rem,8vw,4.5rem)] font-black leading-tight tracking-[-0.04em] text-white drop-shadow-[0_0_28px_rgba(114,207,255,0.32)]">掼蛋记牌训练</h1>
          <p className="mx-auto mt-5 max-w-md text-base font-medium leading-7 text-white/70 sm:text-lg">观察牌局变化，记住关键牌，逐步提高你的记牌准确率。</p>
        </motion.div>
        <motion.div animate={{ opacity: 1, y: 0 }} initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }} transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}>
          <Link className="mt-8 inline-flex h-14 min-w-52 items-center justify-center rounded-2xl border border-[#f6c65b]/45 bg-[#f6c65b] px-7 text-base font-black text-[#171101] shadow-[0_22px_70px_rgba(246,198,91,0.28)] transition hover:bg-[#ffd978]" href="/practice">开始记牌训练</Link>
        </motion.div>
      </section>
    </main>
  );
}
