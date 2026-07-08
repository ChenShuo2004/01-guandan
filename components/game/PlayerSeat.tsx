"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ArenaPlayer } from "@/types/game";

const positionClass = {
  top: "left-1/2 top-[2%] -translate-x-1/2",
  left: "left-[3%] top-[45%] -translate-y-1/2",
  right: "right-[3%] top-[45%] -translate-y-1/2",
  bottom: "left-1/2 bottom-[2%] -translate-x-1/2"
};

const statusLabel = {
  ready: "准备中",
  thinking: "思考中",
  waiting: "等待",
  active: "本轮可出牌",
  passed: "已不出"
};

interface PlayerSeatProps {
  player: ArenaPlayer;
}

export function PlayerSeat({ player }: PlayerSeatProps) {
  const isActive = player.status === "active" || player.status === "thinking";
  const isSide = player.position === "left" || player.position === "right";
  const isBottom = player.position === "bottom";

  return (
    <div className={cn("pointer-events-none absolute z-40", positionClass[player.position])}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex items-center gap-3", isBottom || player.position === "top" ? "flex-col" : "flex-row")}
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.45, delay: player.position === "top" ? 0.16 : 0.26 }}
      >
        {isSide ? <CardBackStack side={player.position === "left" ? "left" : "right"} /> : <CardBackFan />}

        <div className={cn("relative flex flex-col items-center", isSide && player.position === "right" && "order-2")}>
          <motion.div
            animate={
              isActive
                ? {
                    boxShadow: [
                      "0 0 0 0 rgba(75,184,255,0.28)",
                      "0 0 0 12px rgba(75,184,255,0.08)",
                      "0 0 0 0 rgba(75,184,255,0.28)"
                    ]
                  }
                : undefined
            }
            className={cn(
              "relative flex h-[86px] w-[86px] items-center justify-center overflow-hidden rounded-[18px] border border-white/75 shadow-[0_16px_34px_rgba(36,125,185,0.24)] backdrop-blur-md",
              player.isUser
                ? "bg-gradient-to-br from-[#ffd84d] via-[#ffe680] to-[#4bb8ff]"
                : "bg-gradient-to-br from-[#e8f7ff] via-[#8ddcff] to-[#235d94]"
            )}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <AvatarFace player={player} />
          </motion.div>

          <div className="-mt-2 rounded-2xl border border-white/65 bg-[#12395a]/88 px-5 py-2 text-center text-white shadow-[0_12px_30px_rgba(18,57,90,0.24)] backdrop-blur-md">
            <p className="text-sm font-black leading-tight">{player.role}</p>
          </div>

          <div className="mt-1 flex items-center gap-1.5 rounded-full bg-[#2c6fa8]/82 px-3 py-1 text-xs font-black text-white shadow-[0_8px_18px_rgba(37,113,174,0.24)]">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-[#ffd84d] text-[10px] text-[#8a5b00]">¢</span>
            {player.score.toLocaleString("zh-CN")}
          </div>

          <div className="absolute -right-9 top-4 rounded-2xl bg-[#3f8cc4]/82 px-3 py-2 text-center text-white shadow-[0_10px_24px_rgba(43,127,191,0.20)]">
            <p className="text-xs font-black">剩余</p>
            <p className="text-2xl font-black leading-none">{player.cardCount}</p>
            <p className="text-xs font-bold">张</p>
          </div>

          <div className="mt-2 flex items-center gap-2 rounded-full border border-white/65 bg-white/58 px-3 py-1 text-xs font-black text-[#145077] backdrop-blur">
            <span className={cn("h-2 w-2 rounded-full", isActive ? "bg-[#21d071]" : "bg-[#8ddcff]")} />
            {statusLabel[player.status]}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AvatarFace({ player }: { player: ArenaPlayer }) {
  if (player.isUser) {
    return (
      <div className="relative h-full w-full">
        <div className="absolute inset-x-5 top-5 h-8 rounded-full bg-white/75" />
        <div className="absolute left-6 top-8 h-3 w-3 rounded-full bg-[#17496d]" />
        <div className="absolute right-6 top-8 h-3 w-3 rounded-full bg-[#17496d]" />
        <div className="absolute bottom-5 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full bg-white" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-x-4 top-3 h-8 rounded-t-full bg-[#183955]" />
      <div className="absolute inset-x-5 bottom-3 top-8 rounded-[18px] bg-[#f1c18b]" />
      <div className="absolute left-7 top-10 h-2.5 w-2.5 rounded-full bg-[#132a3e]" />
      <div className="absolute right-7 top-10 h-2.5 w-2.5 rounded-full bg-[#132a3e]" />
      <div className="absolute bottom-6 left-1/2 h-1.5 w-7 -translate-x-1/2 rounded-full bg-[#7c2e2e]" />
    </div>
  );
}

function CardBackFan() {
  return (
    <div className="flex h-16 items-end justify-center">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="-ml-2 h-[74px] w-[48px] rounded-lg border border-white/55 bg-[linear-gradient(145deg,#4f89dc,#1e4f9f)] shadow-[0_8px_16px_rgba(24,79,159,0.24)] first:ml-0"
          key={index}
          style={{ transform: `rotate(${(index - 2) * 3}deg)` }}
        />
      ))}
    </div>
  );
}

function CardBackStack({ side }: { side: "left" | "right" }) {
  return (
    <div className={cn("flex w-[70px] flex-col items-center", side === "right" && "order-1")}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="-mt-9 h-[72px] w-[48px] rounded-lg border border-white/55 bg-[linear-gradient(145deg,#5a93df,#204f9a)] shadow-[0_8px_16px_rgba(24,79,159,0.24)] first:mt-0"
          key={index}
        />
      ))}
    </div>
  );
}
