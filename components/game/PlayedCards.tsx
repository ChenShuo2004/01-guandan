"use client";

import { motion } from "framer-motion";
import { PlayingCard } from "@/components/game/PlayingCard";
import type { Card } from "@/lib/guandan/card";

interface PlayedCardsProps {
  cards: Card[];
}

export function PlayedCards({ cards }: PlayedCardsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {cards.map((card, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -1 : 1 }}
          initial={{ opacity: 0, y: -12 }}
          key={card.id}
          transition={{ duration: 0.35, delay: 0.08 * index }}
        >
          <PlayingCard card={card} compact disabled />
        </motion.div>
      ))}

      {cards.length === 0 ? (
        <div className="flex h-[90px] min-w-[250px] items-center justify-center rounded-2xl border-2 border-dashed border-white/68 bg-white/18 px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(35,114,180,0.18)] backdrop-blur">
          等待第一手出牌
        </div>
      ) : (
        <div className="h-[90px] w-[62px] rounded-xl border-2 border-dashed border-white/62 bg-white/14" />
      )}
    </div>
  );
}
