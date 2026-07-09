"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

type DealStage = "dealing" | "sorting" | "ready";

interface DealAnimationProps {
  active: boolean;
  cardCount: number;
  onStageChange?: (stage: DealStage) => void;
  onComplete: () => void;
}

const playerTargets = [
  { x: 0, y: 300, rotate: -7 },
  { x: -480, y: 18, rotate: -86 },
  { x: 0, y: -280, rotate: 5 },
  { x: 480, y: 18, rotate: 86 }
];

export function DealAnimation({
  active,
  cardCount,
  onComplete,
  onStageChange
}: DealAnimationProps) {
  useEffect(() => {
    if (!active) return;

    onStageChange?.("dealing");
    const dealDuration = Math.min(4200, Math.max(3000, cardCount * 32 + 520));
    const sortingTimer = window.setTimeout(() => onStageChange?.("sorting"), dealDuration - 620);
    const completeTimer = window.setTimeout(() => {
      onStageChange?.("ready");
      onComplete();
    }, dealDuration);

    return () => {
      window.clearTimeout(sortingTimer);
      window.clearTimeout(completeTimer);
    };
  }, [active, cardCount, onComplete, onStageChange]);

  if (!active) return null;

  const flyCards = Array.from({ length: Math.min(cardCount, 108) }, (_, index) => index);

  return (
    <div className="pointer-events-auto absolute inset-0 z-[95] overflow-hidden">
      <div className="absolute inset-0 bg-[#1a78bb]/10 backdrop-blur-[1px]" />

      <motion.div
        animate={{ y: [0, -8, 0], scale: [1, 1.03, 1] }}
        className="absolute left-1/2 top-1/2 z-20 grid h-28 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-white/50 bg-[linear-gradient(145deg,#1f58c9,#173f96)] shadow-[0_0_34px_rgba(100,168,254,0.72),0_24px_48px_rgba(19,57,90,0.35)]"
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute -inset-8 rounded-full bg-[#64a8fe]/24 blur-2xl" />
        <div className="relative h-24 w-16 rounded-xl border border-white/35 bg-[linear-gradient(135deg,#2368e8,#0e3c98)] shadow-[inset_0_0_18px_rgba(255,255,255,0.22)]">
          <div className="absolute inset-3 rounded-lg border border-white/28" />
          <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40" />
        </div>
      </motion.div>

      {flyCards.map((cardIndex) => {
        const target = playerTargets[cardIndex % playerTargets.length];
        const delay = cardIndex * 0.032;

        return (
          <motion.div
            animate={{
              opacity: [0, 1, 1, 0],
              rotate: [0, target.rotate, target.rotate + 5],
              scale: [0.72, 0.9, 1, 0.92],
              x: [0, target.x * 0.42, target.x],
              y: [0, target.y * 0.22 - 80, target.y]
            }}
            className="absolute left-1/2 top-1/2 h-16 w-11 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/55 bg-[linear-gradient(135deg,#2569e8,#123d96)] shadow-[0_12px_24px_rgba(19,57,90,0.28)]"
            initial={{ opacity: 0, rotate: 0, scale: 0.72, x: 0, y: 0 }}
            key={cardIndex}
            transition={{ delay, duration: 0.52, ease: "easeOut" }}
          >
            <div className="absolute inset-1.5 rounded-md border border-white/25" />
            <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/32" />
          </motion.div>
        );
      })}

      <motion.div
        animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -8] }}
        className="absolute left-1/2 top-[58%] z-30 -translate-x-1/2 rounded-full border border-white/50 bg-white/86 px-5 py-2 text-sm font-black text-[#0f64ff] shadow-[0_16px_34px_rgba(15,100,255,0.22)]"
        initial={{ opacity: 0 }}
        transition={{ delay: 0.4, duration: 2.6, ease: "easeOut" }}
      >
        正在发牌
      </motion.div>
    </div>
  );
}
