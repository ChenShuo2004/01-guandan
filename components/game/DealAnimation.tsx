"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type DealStage = "dealing" | "sorting" | "ready";

interface DealAnimationProps {
  active: boolean;
  cardCount: number;
  onStageChange?: (stage: DealStage) => void;
  onComplete: () => void;
}

export function DealAnimation({
  active,
  cardCount,
  onComplete,
  onStageChange
}: DealAnimationProps) {
  const [viewport, setViewport] = useState({ height: 600, width: 1000 });

  useEffect(() => {
    function syncViewport() {
      setViewport({
        height: window.visualViewport?.height ?? window.innerHeight,
        width: window.visualViewport?.width ?? window.innerWidth
      });
    }

    syncViewport();
    window.addEventListener("resize", syncViewport);
    window.addEventListener("orientationchange", syncViewport);
    window.visualViewport?.addEventListener("resize", syncViewport);
    return () => {
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("orientationchange", syncViewport);
      window.visualViewport?.removeEventListener("resize", syncViewport);
    };
  }, []);

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
  const horizontalTravel = Math.min(Math.max(120, viewport.width * 0.39), Math.max(72, viewport.width / 2 - 54));
  const verticalTravel = Math.min(Math.max(72, viewport.height * 0.3), Math.max(48, viewport.height / 2 - 48));
  const playerTargets = [
    { x: 0, y: verticalTravel, rotate: -7 },
    { x: -horizontalTravel, y: 0, rotate: -86 },
    { x: 0, y: -verticalTravel, rotate: 5 },
    { x: horizontalTravel, y: 0, rotate: 86 }
  ];

  return (
    <div className="pointer-events-auto absolute inset-0 z-[95] overflow-hidden">
      <div className="absolute inset-0 bg-[#1a78bb]/10 backdrop-blur-[1px]" />

      <div className="absolute inset-0 -translate-y-[8dvh]">
      <motion.div
        animate={{ y: [0, -8, 0], scale: [1, 1.03, 1] }}
        className="absolute left-1/2 top-1/2 z-20 grid h-[clamp(108px,34dvh,192px)] w-[clamp(72px,22.7dvh,128px)] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl border border-white/50 bg-[#17489d] shadow-[0_0_46px_rgba(100,168,254,0.82),0_28px_58px_rgba(19,57,90,0.35)]"
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute -inset-8 rounded-full bg-[#64a8fe]/24 blur-2xl" />
        <div className="relative h-[92%] w-[88%] overflow-hidden rounded-2xl border border-white/35 shadow-[inset_0_0_22px_rgba(255,255,255,0.22)]">
          <Image alt="" className="object-cover" fill priority sizes="112px" src="/assets/poker-cards/backs/ai-training-card-back.png" />
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
            className="absolute left-1/2 top-1/2 h-[clamp(62px,20dvh,112px)] w-[clamp(44px,14.3dvh,80px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-white/55 bg-[#17489d] shadow-[0_14px_28px_rgba(19,57,90,0.28)]"
            initial={{ opacity: 0, rotate: 0, scale: 0.72, x: 0, y: 0 }}
            key={cardIndex}
            transition={{ delay, duration: 0.52, ease: "easeOut" }}
          >
            <Image alt="" className="object-cover" fill sizes="80px" src="/assets/poker-cards/backs/ai-training-card-back.png" />
          </motion.div>
        );
      })}

      </div>
    </div>
  );
}
