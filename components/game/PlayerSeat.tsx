"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ArenaPlayer } from "@/types/game";

const positionClass = {
  top: "left-1/2 top-[4%] -translate-x-1/2",
  left: "left-[3%] top-1/2 -translate-y-1/2",
  right: "right-[3%] top-1/2 -translate-y-1/2",
  bottom: "left-1/2 bottom-[5%] -translate-x-1/2"
};

const statusLabel = {
  ready: "准备中",
  thinking: "思考中",
  waiting: "等待",
  active: "本轮可出牌",
  passed: "已不要"
};

interface PlayerSeatProps {
  player: ArenaPlayer;
}

export function PlayerSeat({ player }: PlayerSeatProps) {
  const isActive = player.status === "active" || player.status === "thinking";

  return (
    <div className={cn("absolute z-30", positionClass[player.position])}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex min-w-[144px] flex-col items-center gap-2"
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.45, delay: player.position === "top" ? 0.2 : 0.32 }}
      >
        <motion.div
          animate={
            isActive
              ? {
                  boxShadow: [
                    "0 0 0 0 rgba(75,184,255,0.22)",
                    "0 0 0 10px rgba(75,184,255,0.06)",
                    "0 0 0 0 rgba(75,184,255,0.22)"
                  ]
                }
              : undefined
          }
          className={cn(
            "relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/70 bg-gradient-to-br from-white/75 to-[#8ddcff]/45 shadow-[0_14px_34px_rgba(36,125,185,0.22)] backdrop-blur-md",
            player.isUser && "from-[#ffd84d]/85 to-[#4bb8ff]/55"
          )}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <div className="h-12 w-12 rounded-2xl bg-[radial-gradient(circle_at_35%_25%,#ffffff,#4bb8ff_42%,#185a8e_100%)]" />
          <span className="absolute -right-2 -top-2 rounded-full border border-white/70 bg-white/75 px-2 py-1 text-[11px] font-black text-[#185a8e]">
            {player.cardCount}
          </span>
        </motion.div>

        <div className="rounded-2xl border border-white/65 bg-[#12395a]/82 px-4 py-2 text-center text-white shadow-[0_12px_30px_rgba(18,57,90,0.24)] backdrop-blur-md">
          <p className="text-sm font-black leading-tight">{player.role}</p>
          <p className="text-xs font-bold text-[#bdeeff]">{player.name}</p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/55 bg-white/55 px-3 py-1 text-xs font-black text-[#145077] backdrop-blur">
          <span className={cn("h-2 w-2 rounded-full", isActive ? "bg-[#32d583]" : "bg-[#8ddcff]")} />
          {statusLabel[player.status]}
        </div>
      </motion.div>
    </div>
  );
}
