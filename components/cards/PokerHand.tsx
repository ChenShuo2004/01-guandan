"use client";

import { motion } from "framer-motion";
import type { PokerCardData } from "@/types/poker";
import { PokerCard } from "./PokerCard";

interface PokerHandProps {
  cards: PokerCardData[];
  compact?: boolean;
  onCardClick?: (card: PokerCardData) => void;
  selectedIds?: string[];
}

export function PokerHand({
  cards,
  compact = false,
  onCardClick,
  selectedIds = []
}: PokerHandProps) {
  const isInteractive = Boolean(onCardClick);

  return (
    <div className="flex items-end overflow-x-auto pb-3 pt-3">
      {cards.map((card, index) => (
        <motion.button
          animate={{ opacity: 1, y: 0 }}
          className={[
            "shrink-0 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
            index === 0 ? "" : "-ml-3",
            isInteractive ? "cursor-pointer" : "cursor-default"
          ].join(" ")}
          disabled={!isInteractive}
          initial={{ opacity: 0, y: 12 }}
          key={card.id}
          onClick={() => onCardClick?.(card)}
          transition={{ delay: index * 0.025, duration: 0.24 }}
          type="button"
          whileTap={isInteractive ? { scale: 0.96 } : undefined}
        >
          <PokerCard
            card={card}
            compact={compact}
            interactive={isInteractive}
            selected={selectedIds.includes(card.id)}
          />
        </motion.button>
      ))}
    </div>
  );
}
