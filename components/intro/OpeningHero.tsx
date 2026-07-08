"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CoachReveal } from "./CoachReveal";
import { IntroTitle } from "./IntroTitle";

const introStorageKey = "visited_intro";

const particles = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 100}%`,
  size: 2 + (index % 4),
  delay: (index % 8) * 0.22,
  duration: 4.2 + (index % 5) * 0.7
}));

interface OpeningHeroProps {
  children: ReactNode;
}

export function OpeningHero({ children }: OpeningHeroProps) {
  const [hasVisitedIntro, setHasVisitedIntro] = useState<boolean | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    try {
      setHasVisitedIntro(window.localStorage.getItem(introStorageKey) === "true");
    } catch {
      setHasVisitedIntro(false);
    }
  }, []);

  function enterTrainingHome() {
    try {
      window.localStorage.setItem(introStorageKey, "true");
    } catch {
      // localStorage can be unavailable in private or locked-down browser modes.
    }

    setHasVisitedIntro(true);
  }

  if (hasVisitedIntro) {
    return children;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(84,215,255,0.2),transparent_28%),radial-gradient(circle_at_72%_62%,rgba(246,198,91,0.18),transparent_34%),linear-gradient(140deg,#02040b_0%,#071426_46%,#090b12_100%)]" />
      <motion.div
        animate={shouldReduceMotion ? undefined : { opacity: [0.18, 0.36, 0.18], scale: [0.92, 1.08, 0.92] }}
        className="absolute left-1/2 top-[18%] h-44 w-44 -translate-x-1/2 rounded-full bg-[#54d7ff]/24 blur-3xl sm:h-64 sm:w-64"
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        animate={shouldReduceMotion ? undefined : { rotate: 360 }}
        className="absolute left-1/2 top-[14%] h-[21rem] w-[21rem] -translate-x-1/2 rounded-full border border-[#54d7ff]/15 sm:h-[30rem] sm:w-[30rem]"
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-25 [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: [0.12, 0.7, 0.12],
                  y: [0, -26, 0],
                  x: [0, particle.id % 2 === 0 ? 12 : -12, 0]
                }
          }
          className="absolute rounded-full bg-[#bfe9ff] shadow-[0_0_18px_rgba(84,215,255,0.72)]"
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

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-8 text-center sm:px-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-2 text-[11px] font-black uppercase text-[#bfe9ff] shadow-[0_18px_60px_rgba(84,215,255,0.08)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#f6c65b] shadow-[0_0_18px_rgba(246,198,91,0.86)]" />
          Ace AI Training Space
        </motion.div>

        <IntroTitle text="明明会玩，却总是输在关键一步？" />

        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-1 max-w-[18rem] text-base font-semibold leading-7 text-[#d8e9ff]/88 sm:max-w-2xl sm:text-lg"
          initial={{ opacity: 0, y: 18 }}
          transition={{ delay: 2.5, duration: 0.9, ease: "easeOut" }}
        >
          AI 教练陪你训练，从规则理解到牌局决策。
        </motion.p>

        <CoachReveal />

        <motion.button
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 inline-flex h-14 min-w-44 items-center justify-center rounded-2xl border border-[#f6c65b]/45 bg-[#f6c65b] px-7 text-base font-black text-[#171101] shadow-[0_22px_70px_rgba(246,198,91,0.28)] transition duration-200 hover:bg-[#ffd978] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#f6c65b]/25"
          initial={{ opacity: 0, y: 16 }}
          onClick={enterTrainingHome}
          transition={{ delay: 4.5, duration: 0.75, ease: "easeOut" }}
          type="button"
        >
          开始训练
        </motion.button>
      </section>
    </main>
  );
}
