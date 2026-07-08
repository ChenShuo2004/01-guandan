"use client";

import { motion } from "framer-motion";
import { PlayingCard } from "@/components/game/PlayingCard";
import type { PokerCardData } from "@/types/poker";

interface HandCardsProps {
  cards: PokerCardData[];
}

export function HandCards({ cards }: HandCardsProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="overflow-x-auto rounded-[28px] border border-white/65 bg-white/45 px-4 py-4 shadow-[0_18px_55px_rgba(40,123,184,0.20)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.55, delay: 0.25 }}
    >
      <div className="flex min-w-max items-end justify-center pb-2">
        {cards.map((card, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={index === 0 ? "" : "-ml-5 sm:-ml-4"}
            initial={{ opacity: 0, y: 30 }}
            key={card.id}
            transition={{ duration: 0.35, delay: 0.02 * index }}
          >
            <PlayingCard card={card} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
