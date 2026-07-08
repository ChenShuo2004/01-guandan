"use client";

import { motion } from "framer-motion";
import type { Card } from "@/lib/guandan/card";
import { getCardLabel } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";

interface PlayingCardProps {
  card: Card;
  compact?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (card: Card) => void;
}

const suitSymbol = {
  spade: "♠",
  heart: "♥",
  club: "♣",
  diamond: "♦",
  joker: "★"
};

export function PlayingCard({
  card,
  compact = false,
  selected = false,
  disabled = false,
  onClick
}: PlayingCardProps) {
  const isRed = card.suit === "heart" || card.suit === "diamond";
  const label = card.isJoker ? "JOKER" : getCardLabel(card);
  const suit = suitSymbol[card.suit];

  return (
    <motion.div
      animate={selected ? { y: -20, scale: 1.05 } : { y: 0, scale: 1 }}
      className={cn(
        "relative flex shrink-0 flex-col justify-between overflow-hidden rounded-xl border bg-[linear-gradient(145deg,#ffffff,#eef7ff)] p-2 font-black shadow-[0_14px_26px_rgba(34,74,112,0.16)] transition-colors",
        compact ? "h-[84px] w-[58px]" : "h-[118px] w-[78px]",
        disabled ? "cursor-default" : "cursor-pointer",
        selected
          ? "border-[#4bb8ff] shadow-[0_0_0_2px_rgba(75,184,255,0.45),0_18px_32px_rgba(75,184,255,0.28)]"
          : "border-slate-200",
        isRed ? "text-[#df2f45]" : "text-[#162236]"
      )}
      aria-label={`${label} ${suit}`}
      data-card-id={card.id}
      onClick={() => {
        if (!disabled) onClick?.(card);
      }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      whileHover={disabled ? undefined : { y: selected ? -20 : -10, scale: selected ? 1.05 : 1.04 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(75,184,255,0.18),transparent_28%)]" />
      <div className="relative leading-none">
        <p className={cn("leading-none", compact ? "text-lg" : "text-2xl")}>{label}</p>
        <p className={cn("leading-none", compact ? "text-base" : "text-xl")}>{suit}</p>
      </div>
      <div className={cn("relative self-center leading-none", compact ? "text-2xl" : "text-4xl")}>
        {suit}
      </div>
      <div className="relative rotate-180 self-end leading-none">
        <p className={cn("leading-none", compact ? "text-lg" : "text-2xl")}>{label}</p>
        <p className={cn("leading-none", compact ? "text-base" : "text-xl")}>{suit}</p>
      </div>
    </motion.div>
  );
}
