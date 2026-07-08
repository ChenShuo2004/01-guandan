"use client";

import { motion } from "framer-motion";

interface CoachBubbleProps {
  message: string;
}

export function CoachBubble({ message }: CoachBubbleProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[320px] rounded-3xl border border-white/70 bg-[#14527b]/76 px-5 py-4 text-sm font-bold leading-6 text-white shadow-[0_14px_34px_rgba(18,82,123,0.24)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, delay: 0.55 }}
    >
      <p className="mb-1 text-xs font-black text-[#ffd84d]">Ace Coach</p>
      <p>{message}</p>
    </motion.div>
  );
}
