"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CoachSceneImage } from "@/components/coach/CoachSceneImage";

export function CoachReveal() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        shouldReduceMotion
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 1, scale: 1, y: 0 }
      }
      className="relative z-30 mx-auto mt-2 h-[10rem] w-[10rem] sm:h-56 sm:w-56 lg:h-72 lg:w-72 [@media(orientation:landscape)_and_(max-height:600px)]:mt-0 [@media(orientation:landscape)_and_(max-height:600px)]:h-[min(34dvh,10rem)] [@media(orientation:landscape)_and_(max-height:600px)]:w-[min(34dvh,10rem)]"
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      transition={{ delay: 3.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-4 rounded-full bg-[#f6c65b]/22 blur-3xl" />
      <div className="absolute inset-8 rounded-full border border-[#f6c65b]/25 bg-[#54d7ff]/10 shadow-[0_0_80px_rgba(84,215,255,0.26)]" />
      <motion.div
        animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
        className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.05] p-2 shadow-[0_26px_90px_rgba(0,0,0,0.44)] backdrop-blur-xl"
        transition={{ duration: 4.4, ease: "easeInOut", repeat: Infinity }}
      >
        <CoachSceneImage
          assetId="coach-bubble-hologram"
          className="rounded-[1.5rem]"
          imageClassName="object-cover"
          priority
          sizes="(max-width: 768px) 216px, 320px"
        />
      </motion.div>
      <div className="absolute -bottom-3 left-1/2 h-6 w-36 -translate-x-1/2 rounded-full bg-[#54d7ff]/18 blur-xl" />
    </motion.div>
  );
}
