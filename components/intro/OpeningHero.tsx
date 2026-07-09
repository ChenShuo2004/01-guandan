"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CoachReveal } from "./CoachReveal";
import { IntroTitle } from "./IntroTitle";

const introStorageKey = "guandan-training-intro-seen";
const autoEnterDelayMs = 3800;

const particles = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 100}%`,
  size: 2 + (index % 4),
  delay: (index % 8) * 0.18,
  duration: 3.4 + (index % 5) * 0.5
}));

export function OpeningHero() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  const enterTrainingCamp = useCallback(() => {
    try {
      window.localStorage.setItem(introStorageKey, "true");
    } catch {
      // localStorage can be unavailable in private or locked-down browser modes.
    }

    router.push("/practice");
  }, [router]);

  useEffect(() => {
    setMounted(true);
    const delay = shouldReduceMotion ? 900 : autoEnterDelayMs;
    const timer = window.setTimeout(() => {
      enterTrainingCamp();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [enterTrainingCamp, shouldReduceMotion]);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#030712] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(84,215,255,0.22),transparent_30%),radial-gradient(circle_at_74%_60%,rgba(246,198,91,0.18),transparent_34%),linear-gradient(140deg,#02040b_0%,#071426_45%,#090b12_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-25 [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <motion.div
        animate={shouldReduceMotion ? undefined : { opacity: [0.18, 0.38, 0.18], scale: [0.92, 1.08, 0.92] }}
        className="absolute left-1/2 top-[18%] h-52 w-52 -translate-x-1/2 rounded-full bg-[#54d7ff]/25 blur-3xl sm:h-72 sm:w-72"
        transition={{ duration: 3.8, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        animate={shouldReduceMotion ? undefined : { rotate: 360 }}
        className="absolute left-1/2 top-[12%] h-[22rem] w-[22rem] -translate-x-1/2 rounded-full border border-[#54d7ff]/15 sm:h-[32rem] sm:w-[32rem]"
        transition={{ duration: 24, ease: "linear", repeat: Infinity }}
      />
      <motion.div
        animate={shouldReduceMotion ? undefined : { rotate: -360 }}
        className="absolute left-1/2 top-[17%] h-[17rem] w-[17rem] -translate-x-1/2 rounded-full border border-dashed border-[#f6c65b]/18 sm:h-[25rem] sm:w-[25rem]"
        transition={{ duration: 34, ease: "linear", repeat: Infinity }}
      />

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: [0.1, 0.75, 0.1],
                  x: [0, particle.id % 2 === 0 ? 12 : -12, 0],
                  y: [0, -24, 0]
                }
          }
          className="pointer-events-none absolute rounded-full bg-[#bfe9ff] shadow-[0_0_18px_rgba(84,215,255,0.72)]"
          style={{
            height: particle.size,
            left: particle.left,
            top: particle.top,
            width: particle.size
          }}
          transition={{
            delay: particle.delay,
            duration: particle.duration,
            ease: "easeInOut",
            repeat: Infinity
          }}
        />
      ))}

      <button
        className="absolute right-4 top-4 z-50 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-xs font-black text-white/80 backdrop-blur-xl transition hover:border-[#54d7ff]/50 hover:text-white"
        onClick={enterTrainingCamp}
        type="button"
      >
        跳过
      </button>

      <section className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-5 py-8 text-center sm:px-8 [@media(orientation:landscape)_and_(max-height:600px)]:grid [@media(orientation:landscape)_and_(max-height:600px)]:grid-cols-[minmax(0,1fr)_minmax(8rem,16rem)] [@media(orientation:landscape)_and_(max-height:600px)]:gap-6 [@media(orientation:landscape)_and_(max-height:600px)]:px-8 [@media(orientation:landscape)_and_(max-height:600px)]:py-4">
        <div className="relative z-20 flex max-w-[min(100%,58rem)] flex-col items-center [@media(orientation:landscape)_and_(max-height:600px)]:items-start [@media(orientation:landscape)_and_(max-height:600px)]:text-left">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-2 text-[11px] font-black uppercase text-[#bfe9ff] shadow-[0_18px_60px_rgba(84,215,255,0.08)] backdrop-blur-xl sm:mb-5"
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.15, duration: 0.55 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#f6c65b] shadow-[0_0_18px_rgba(246,198,91,0.86)]" />
            Ace AI Training Space
          </motion.div>

          {mounted ? <IntroTitle text="AI 掼蛋训练营" startDelay={260} /> : null}

          <motion.p
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mx-auto mt-1 max-w-[min(32rem,calc(100vw-2rem))] text-base font-semibold leading-7 text-[#d8e9ff]/88 sm:max-w-2xl sm:text-lg [@media(orientation:landscape)_and_(max-height:600px)]:mx-0 [@media(orientation:landscape)_and_(max-height:600px)]:max-w-[34rem] [@media(orientation:landscape)_and_(max-height:600px)]:text-sm [@media(orientation:landscape)_and_(max-height:600px)]:leading-6"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ delay: 1.65, duration: 0.7, ease: "easeOut" }}
          >
            进入一个专业、安静、可反馈的掼蛋训练空间。AI Coach 会陪你完成判断、出牌、提示和复盘。
          </motion.p>

          <motion.button
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-6 inline-flex h-14 min-w-44 items-center justify-center rounded-2xl border border-[#f6c65b]/45 bg-[#f6c65b] px-7 text-base font-black text-[#171101] shadow-[0_22px_70px_rgba(246,198,91,0.28)] transition duration-200 hover:bg-[#ffd978] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#f6c65b]/25 [@media(orientation:landscape)_and_(max-height:600px)]:mt-4 [@media(orientation:landscape)_and_(max-height:600px)]:h-12 [@media(orientation:landscape)_and_(max-height:600px)]:rounded-xl [@media(orientation:landscape)_and_(max-height:600px)]:text-sm"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            onClick={enterTrainingCamp}
            transition={{ delay: 2.35, duration: 0.55, ease: "easeOut" }}
            type="button"
          >
            进入训练营
          </motion.button>
        </div>

        <div className="relative z-20 [@media(orientation:landscape)_and_(max-height:600px)]:justify-self-center">
          <CoachReveal />
        </div>
      </section>
    </main>
  );
}
