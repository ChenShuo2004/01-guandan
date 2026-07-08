"use client";

import { motion } from "framer-motion";
import { PlayedCards } from "@/components/game/PlayedCards";
import { PlayerSeat } from "@/components/game/PlayerSeat";
import type { ArenaPlayer } from "@/types/game";
import type { PokerCardData } from "@/types/poker";

interface GameTableProps {
  players: ArenaPlayer[];
  tableCards: PokerCardData[];
}

export function GameTable({ players, tableCards }: GameTableProps) {
  return (
    <div className="absolute inset-0">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-x-[7%] bottom-[13%] top-[18%] rounded-[50%] border border-white/70 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.38),rgba(75,184,255,0.34)_42%,rgba(28,144,220,0.45)_100%)] shadow-[0_0_0_8px_rgba(255,255,255,0.22),0_0_45px_rgba(75,184,255,0.62),inset_0_0_70px_rgba(255,255,255,0.38)]"
        initial={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
      >
        <div className="absolute inset-[7%] rounded-[50%] border border-white/35" />
        <div className="absolute inset-[14%] rounded-[50%] border border-dashed border-white/28" />
        <div className="absolute left-1/2 top-1/2 h-[64%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.03))]" />
        <div className="absolute inset-0 rounded-[50%] bg-[linear-gradient(90deg,transparent_0,rgba(255,255,255,0.18)_48%,transparent_52%)] opacity-50" />
      </motion.div>

      <div className="absolute left-1/2 top-[46%] z-20 -translate-x-1/2 -translate-y-1/2">
        <PlayedCards cards={tableCards} />
      </div>

      {players.map((player) => (
        <PlayerSeat key={player.id} player={player} />
      ))}

      <div className="absolute left-1/2 top-[61%] z-20 -translate-x-1/2 rounded-full border border-white/50 bg-white/34 px-5 py-2 text-center text-sm font-bold text-white shadow-[0_10px_30px_rgba(37,132,205,0.24)] backdrop-blur-md">
        当前出牌区
      </div>
    </div>
  );
}
