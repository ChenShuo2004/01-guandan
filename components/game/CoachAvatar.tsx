"use client";

import { motion } from "framer-motion";
import type { CoachState } from "@/types/game";

interface CoachAvatarProps {
  mood: CoachState["mood"];
}

export function CoachAvatar({ mood }: CoachAvatarProps) {
  return (
    <motion.div
      animate={{
        y: [0, -7, 0],
        boxShadow: [
          "0 14px 34px rgba(255,216,77,0.28)",
          "0 18px 48px rgba(75,184,255,0.38)",
          "0 14px 34px rgba(255,216,77,0.28)"
        ]
      }}
      className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-[30px] border border-white/70 bg-gradient-to-br from-[#ffd84d] via-[#ffe98f] to-[#4bb8ff] shadow-[0_16px_40px_rgba(255,216,77,0.28)]"
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute -top-3 h-4 w-10 rounded-full bg-[#ffd84d]" />
      <div className="absolute -bottom-2 h-3 w-14 rounded-full bg-[#3aaeea]/50 blur-sm" />
      <div className="relative h-16 w-16 rounded-2xl border border-white/70 bg-[#ffd84d]">
        <div className="absolute left-3 top-5 h-3 w-3 rounded-full bg-[#17496d]" />
        <div className="absolute right-3 top-5 h-3 w-3 rounded-full bg-[#17496d]" />
        <div className="absolute bottom-4 left-1/2 h-2 w-7 -translate-x-1/2 rounded-full bg-white/90" />
        <div className="absolute -left-2 top-7 h-5 w-3 rounded-full bg-[#4bb8ff]" />
        <div className="absolute -right-2 top-7 h-5 w-3 rounded-full bg-[#4bb8ff]" />
      </div>
      <span className="absolute -right-2 -top-2 rounded-full border border-white/80 bg-white px-2 py-1 text-[10px] font-black text-[#185a8e]">
        {mood === "teaching" ? "提示" : "AI"}
      </span>
    </motion.div>
  );
}
