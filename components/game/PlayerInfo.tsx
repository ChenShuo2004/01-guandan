"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ArenaPlayer } from "@/types/game";
import { cn } from "@/lib/utils";

interface PlayerInfoProps {
  compact?: boolean;
  player: ArenaPlayer;
}

const statusLabel = {
  ready: "准备中",
  thinking: "思考中",
  waiting: "等待",
  active: "轮到你",
  passed: "不出"
};

export function PlayerInfo({ compact = false, player }: PlayerInfoProps) {
  const isActive = player.status === "active" || player.status === "thinking";
  const statusText =
    typeof player.countdown === "number" && (player.status === "active" || player.status === "thinking")
      ? `${statusLabel[player.status]} ${player.countdown}s`
      : statusLabel[player.status];

  return (
    <div className={cn("flex items-center gap-3", compact ? "gap-2" : "gap-3")}>
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
          "relative shrink-0 overflow-hidden rounded-[18px] border-2 bg-white/90 shadow-[0_8px_18px_rgba(36,125,185,0.16)]",
          isActive ? "border-[#21d071] shadow-[0_0_0_3px_rgba(33,208,113,0.35),0_8px_18px_rgba(36,125,185,0.16)]" : "border-white/75",
          compact ? "h-[76px] w-[76px]" : "h-[90px] w-[90px]"
        )}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <Image
          alt={`${player.name}头像`}
          className="object-cover"
          fill
          sizes={compact ? "76px" : "90px"}
          src={avatarSrc(player)}
        />
      </motion.div>

      <div className="min-w-[92px] rounded-[18px] border border-white/70 bg-white/76 px-3 py-2 text-left shadow-[0_8px_18px_rgba(36,125,185,0.12)] backdrop-blur-sm">
        <p className="line-clamp-1 text-sm font-black leading-5 text-[#12395a]">{player.name}</p>
        <p className="mt-0.5 text-xs font-black text-[#0f64a0]">{player.role}</p>
        <div
          className={cn(
            "mt-2 flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-xs font-black",
            player.cardCount <= 5
              ? "bg-[#ffe2df] text-[#b8342d]"
              : player.cardCount <= 10
                ? "bg-[#fff0c7] text-[#a46500]"
                : "bg-[#eaf7ff] text-[#42657c]"
          )}
        >
          <span>剩余</span>
          <span className="text-sm">{player.cardCount} 张</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs font-black text-[#42657c]">
          <span className={cn("h-2 w-2 rounded-full", isActive ? "bg-[#21d071]" : "bg-[#8ddcff]")} />
          <span>{statusText}</span>
        </div>
      </div>
    </div>
  );
}

function avatarSrc(player: ArenaPlayer) {
  if (player.isUser) return "/assets/coach/coach-bubble-hologram.png";
  if (player.position === "left") return "/assets/arena/opponent-left-master.png";
  if (player.position === "right") return "/assets/arena/opponent-right-master.png";
  return "/assets/arena/opponent-top-master.png";
}
