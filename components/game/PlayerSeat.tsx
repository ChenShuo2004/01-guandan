"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ArenaPlayer } from "@/types/game";

const positionClass = {
  top: "left-1/2 top-[5%] -translate-x-1/2",
  left: "left-[3.5%] top-[45%] -translate-y-1/2",
  right: "right-[3.5%] top-[45%] -translate-y-1/2",
  bottom: "left-1/2 bottom-[6%] -translate-x-1/2"
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
              "relative flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-[18px] border border-white/75 shadow-[0_16px_34px_rgba(36,125,185,0.24)] backdrop-blur-md",
              player.isUser ? "bg-white/52" : "bg-[#a4e8ff]/36"
            )}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <AvatarFace player={player} />
          </motion.div>

          <div className="-mt-2 rounded-2xl border border-white/65 bg-[#12395a]/88 px-5 py-2 text-center text-white shadow-[0_12px_30px_rgba(18,57,90,0.24)] backdrop-blur-md">
            <p className="text-sm font-black leading-tight">{player.role}</p>
          </div>

          <div className="absolute -right-11 top-4 rounded-2xl bg-[#3f8cc4]/82 px-3 py-2 text-center text-white shadow-[0_10px_24px_rgba(43,127,191,0.20)]">
            <p className="text-xs font-black">剩余</p>
            <p className="text-2xl font-black leading-none">{player.cardCount}</p>
            <p className="text-xs font-bold">张</p>
          </div>

          {typeof player.countdown === "number" ? (
            <div
              className={cn(
                "absolute -left-6 -top-4 grid h-12 w-12 place-items-center rounded-full border-[3px] bg-white text-base font-black shadow-[0_10px_24px_rgba(43,127,191,0.20)]",
                player.countdown <= 3 ? "border-[#ff4d5d] text-[#d42d3e]" : "border-[#ffd84d] text-[#8a5b00]"
              )}
            >
              {player.countdown}
            </div>
          ) : null}

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
  return (
    <Image
      alt={`${player.role}头像`}
      className="object-cover"
      fill
      sizes="96px"
      src={avatarSrc(player)}
    />
  );
}

function avatarSrc(player: ArenaPlayer) {
  if (player.isUser) return "/assets/coach/coach-bubble-hologram.png";
  if (player.position === "left") return "/assets/arena/opponent-left-master.png";
  if (player.position === "right") return "/assets/arena/opponent-right-master.png";
  return "/assets/arena/opponent-top-master.png";
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
