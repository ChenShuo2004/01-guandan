"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TurnTimerProps {
  seconds?: number;
  running?: boolean;
  resetKey: string | number;
  onTimeout: () => void;
}

export function TurnTimer({ seconds = 15, running = true, resetKey, onTimeout }: TurnTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [resetKey, seconds]);

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          window.setTimeout(onTimeout, 0);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [onTimeout, running, resetKey]);

  const progress = Math.max(0, Math.min(1, remaining / seconds));

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3 text-white backdrop-blur-xl">
      <motion.div
        animate={{ scale: remaining <= 5 && running ? [1, 1.08, 1] : 1 }}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl font-black",
          remaining <= 5
            ? "border-rose-300/60 bg-rose-400/16 text-rose-100"
            : "border-[#77d7ff]/55 bg-[#77d7ff]/14 text-[#d8f7ff]"
        )}
        transition={{ duration: 0.7, repeat: remaining <= 5 && running ? Infinity : 0 }}
      >
        {remaining}
      </motion.div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between text-xs font-black text-white/58">
          <span>Turn Timer</span>
          <span>{running ? "思考中" : "已暂停"}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#77d7ff] to-[#2ff0c8] transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
