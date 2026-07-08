"use client";

import { motion } from "framer-motion";
import { PlayedCards } from "@/components/game/PlayedCards";
import { PlayerSeat } from "@/components/game/PlayerSeat";
import type { Card } from "@/lib/guandan/card";
import type { ArenaPlayer } from "@/types/game";

interface GameTableProps {
  players: ArenaPlayer[];
  tableCards: Card[];
}

export function GameTable({ players, tableCards }: GameTableProps) {
  return (
    <div className="absolute inset-0">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-x-[4%] bottom-[8%] top-[15%] rounded-[50%] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(222,239,255,0.62)_18%,rgba(138,210,255,0.38)_100%)] p-[16px] shadow-[0_40px_70px_rgba(54,128,190,0.28),0_0_0_1px_rgba(255,255,255,0.72),inset_0_0_22px_rgba(255,255,255,0.9)]"
        initial={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
      >
        <div className="absolute inset-[2%] rounded-[50%] border border-[#d7f4ff]/90 shadow-[inset_0_0_26px_rgba(75,184,255,0.30)]" />
        <div className="relative h-full rounded-[50%] border border-white/76 bg-[radial-gradient(circle_at_50%_35%,rgba(235,250,255,0.82),rgba(75,184,255,0.46)_38%,rgba(59,168,235,0.62)_100%)] shadow-[inset_0_0_95px_rgba(255,255,255,0.45),inset_0_-38px_70px_rgba(33,112,184,0.18),0_0_56px_rgba(75,184,255,0.48)]">
          <div className="absolute inset-[8%] rounded-[50%] border border-white/30" />
          <div className="absolute inset-[15%] rounded-[50%] border border-dashed border-white/30" />
          <div className="absolute left-1/2 top-[31%] -translate-x-1/2 text-center text-white/68 drop-shadow">
            <p className="text-sm font-black">底分 100</p>
            <p className="mt-1 text-2xl font-black">100</p>
          </div>
          <div className="absolute inset-0 rounded-[50%] bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.22)_46%,transparent_54%)] opacity-70" />
        </div>
      </motion.div>

      <div className="absolute left-1/2 top-[49%] z-30 -translate-x-1/2 -translate-y-1/2">
        <PlayedCards cards={tableCards} />
      </div>

      {players.map((player) => (
        <PlayerSeat key={player.id} player={player} />
      ))}
    </div>
  );
}
