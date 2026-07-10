"use client";

import { motion } from "framer-motion";
import { PlayingCard } from "@/components/game/PlayingCard";
import type { Card } from "@/lib/guandan/card";

interface PlayedCardsProps {
  cards: Card[];
  compact?: boolean;
  levelRank?: string;
}

export function PlayedCards({ cards, compact = false, levelRank = "10" }: PlayedCardsProps) {
  const isMany = cards.length > 4;

  return (
    <div
      className="flex max-w-full items-center justify-center drop-shadow-[0_10px_18px_rgba(35,114,180,0.22)]"
      style={{ marginLeft: isMany ? 0 : undefined }}
    >
      {cards.map((card, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1, rotate: index % 2 === 0 ? -1 : 1 }}
          initial={{ opacity: 0, y: 42, scale: 0.92 }}
          key={card.id}
          transition={{ duration: 0.72, ease: "easeOut" }}
          style={{
            ...(cards.length > 1 ? { zIndex: index } : {}),
            ...(isMany && index > 0 ? { marginLeft: "-28px" } : cards.length > 1 && index > 0 ? { marginLeft: "2px" } : {}),
          }}
        >
          <PlayingCard card={card} compact={compact || isMany} disabled levelRank={levelRank} />
        </motion.div>
      ))}
    </div>
  );
}
