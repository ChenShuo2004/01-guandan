"use client";

import { motion } from "framer-motion";
import { PlayerInfo } from "@/components/game/PlayerInfo";
import { cn } from "@/lib/utils";
import type { ArenaPlayer } from "@/types/game";

const positionClass = {
  top: "left-1/2 top-[11%] -translate-x-1/2",
  left: "left-[3.5%] top-[45%] -translate-y-1/2",
  right: "right-[3.5%] top-[45%] -translate-y-1/2",
  bottom: "left-1/2 bottom-[6%] -translate-x-1/2"
};

interface PlayerSeatProps {
  player: ArenaPlayer;
  settlementFocus?: "primary" | "muted";
}

export function PlayerSeat({ player, settlementFocus }: PlayerSeatProps) {
  const isSide = player.position === "left" || player.position === "right";
  const isBottom = player.position === "bottom";

  return (
    <div
      className={cn("training-player-seat pointer-events-none absolute z-40", isBottom && "hidden", positionClass[player.position])}
      data-position={player.position}
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="training-seat-content flex items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.45, delay: player.position === "top" ? 0.16 : 0.26 }}
      >
        <div className="order-1">
          <PlayerInfo compact={isSide} focus={settlementFocus} player={player} />
        </div>

        <div className="order-2 shrink-0">
          {isSide ? <CardBackStack side={player.position === "left" ? "left" : "right"} /> : <CardBackFan />}
        </div>
      </motion.div>
    </div>
  );
}

function CardBackFan() {
  return (
    <div className="training-card-backs flex h-12 items-end justify-center">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="-ml-2 h-[52px] w-[36px] rounded-lg border border-white/55 bg-[linear-gradient(145deg,#4f89dc,#1e4f9f)] shadow-[0_6px_12px_rgba(24,79,159,0.18)] first:ml-0"
          key={index}
          style={{ transform: `rotate(${(index - 2) * 3}deg)` }}
        />
      ))}
    </div>
  );
}

function CardBackStack({ side }: { side: "left" | "right" }) {
  return (
    <div className={cn("training-card-backs flex w-[50px] flex-col items-center", side === "right" && "mr-1")}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="-mt-7 h-[52px] w-[36px] rounded-lg border border-white/55 bg-[linear-gradient(145deg,#5a93df,#204f9a)] shadow-[0_6px_12px_rgba(24,79,159,0.18)] first:mt-0"
          key={index}
        />
      ))}
    </div>
  );
}
