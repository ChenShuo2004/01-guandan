"use client";

import { motion } from "framer-motion";
import type { Card } from "@/lib/guandan/card";
import { PlayingCard } from "@/components/game/PlayingCard";

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
          transition={{ duration: 0.35, delay: 0.12 * index }}
        >
          <PlayingCard card={card} compact disabled />
        </motion.div>
      ))}

      {cards.length === 0 ? (
        <div className="flex h-[84px] min-w-[240px] items-center justify-center rounded-2xl border-2 border-dashed border-white/55 bg-white/10 px-5 text-sm font-black text-white">
          等待第一手出牌
        </div>
      ) : (
        <div className="h-[84px] w-[58px] rounded-xl border-2 border-dashed border-white/55 bg-white/10" />
      )}
    </div>
  );
}
