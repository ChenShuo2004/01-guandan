"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PokerCardData } from "@/types/poker";

interface PlayingCardProps {
  card: PokerCardData;
  compact?: boolean;
}

const suitSymbol = {
  spade: "♠",
  heart: "♥",
  club: "♣",
  diamond: "♦"
};

export function PlayingCard({ card, compact = false }: PlayingCardProps) {
  const isRed = card.suit === "heart" || card.suit === "diamond";
  const jokerLabel = card.rank === "SJ" ? "JOKER" : card.rank === "BJ" ? "JOKER" : null;

  return (
    <motion.div
      className={cn(
        "relative flex shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(145deg,#ffffff,#eef7ff)] p-2 font-black shadow-[0_14px_26px_rgba(34,74,112,0.16)] transition-colors",
        compact ? "h-[84px] w-[58px]" : "h-[118px] w-[78px]",
        isRed ? "text-[#df2f45]" : "text-[#162236]"
      )}
      whileHover={{ y: -10, scale: 1.04 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(75,184,255,0.18),transparent_28%)]" />
      <div className="relative leading-none">
        <p className={cn("leading-none", compact ? "text-lg" : "text-2xl")}>{jokerLabel ?? card.rank}</p>
        <p className={cn("leading-none", compact ? "text-base" : "text-xl")}>
          {jokerLabel ? "★" : card.suit ? suitSymbol[card.suit] : ""}
        </p>
      </div>
      <div className={cn("relative self-center leading-none", compact ? "text-2xl" : "text-4xl")}>
        {jokerLabel ? "★" : card.suit ? suitSymbol[card.suit] : ""}
      </div>
      <div className="relative rotate-180 self-end leading-none">
        <p className={cn("leading-none", compact ? "text-lg" : "text-2xl")}>{jokerLabel ?? card.rank}</p>
        <p className={cn("leading-none", compact ? "text-base" : "text-xl")}>
          {jokerLabel ? "★" : card.suit ? suitSymbol[card.suit] : ""}
        </p>
      </div>
    </motion.div>
  );
}
