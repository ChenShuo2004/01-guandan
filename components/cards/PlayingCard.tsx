"use client";

import { motion } from "framer-motion";
import type { PointerEvent } from "react";
import { getCardLabel } from "@/lib/guandan/card";
import type { Card } from "@/lib/guandan/card";
import { PokerCard } from "@/components/cards/PokerCard";
import { getCardVisualStatus } from "@/lib/cards/cardAssets";
import { cn } from "@/lib/utils";
import type { PokerRank, PokerSuit } from "@/types/poker";

interface PlayingCardProps {
  card: Card;
  compact?: boolean;
  selected?: boolean;
  invalid?: boolean;
  invalidPulseKey?: number;
  levelRank?: string;
  disabled?: boolean;
  sizeScale?: number;
  onClick?: (card: Card) => void;
  onPointerDownCard?: (card: Card, event: PointerEvent<HTMLButtonElement>) => void;
  onPointerEnterCard?: (card: Card, event: PointerEvent<HTMLButtonElement>) => void;
}

const pokeTransition = {
  duration: 0.18,
  ease: "easeOut"
} as const;

export function PlayingCard({
  card,
  compact = false,
  selected = false,
  invalid = false,
  invalidPulseKey = 0,
  levelRank = "10",
  disabled = false,
  sizeScale = 1,
  onClick,
  onPointerDownCard,
  onPointerEnterCard
}: PlayingCardProps) {
  const status = getCardVisualStatus({ disabled, invalid, selected });
  const label = getCardLabel(card);
  const baseSize = card.isJoker
    ? { height: 134, width: 92 }
    : compact
      ? { height: 78, width: 54 }
      : { height: 124, width: 86 };
  const cardSize = {
    height: Math.round(baseSize.height * sizeScale),
    width: Math.round(baseSize.width * sizeScale)
  };
  const scaledCardStyle = {
    height: baseSize.height,
    transform: `scale(${sizeScale})`,
    transformOrigin: "top left",
    width: baseSize.width
  };
  const selectedTransform = { y: -20, scale: 1.08 };
  const normalTransform = { y: 0, scale: 1 };

  return (
    <motion.button
      animate={
        invalid
          ? {
              ...selectedTransform,
              x: [0, -6, 6, -4, 4, 0]
            }
          : selected
            ? selectedTransform
            : normalTransform
      }
      aria-label={label}
      className={cn(
        "relative shrink-0 touch-manipulation select-none rounded-[14px] p-0 outline-none transition-colors",
        disabled ? "cursor-default opacity-80" : "cursor-pointer",
        status === "selected" &&
          "shadow-[0_0_0_3px_rgba(255,215,0,0.86),0_0_20px_rgba(255,215,0,0.80),0_22px_36px_rgba(6,20,34,0.34)]",
        status === "invalid" &&
          "shadow-[0_0_0_3px_rgba(255,92,106,0.72),0_0_18px_rgba(255,92,106,0.64),0_22px_36px_rgba(6,20,34,0.34)]"
      )}
      data-card-id={card.id}
      data-card-status={status}
      disabled={disabled}
      key={`${card.id}-${invalid ? invalidPulseKey : "stable"}`}
      onClick={() => onClick?.(card)}
      onPointerDown={(event) => onPointerDownCard?.(card, event)}
      onPointerEnter={(event) => onPointerEnterCard?.(card, event)}
      style={cardSize}
      transition={invalid ? { duration: 0.24, ease: "easeOut" } : pokeTransition}
      type="button"
      whileHover={disabled ? undefined : selected ? selectedTransform : { y: -8, scale: 1.03 }}
    >
      <span className="block" style={scaledCardStyle}>
        <PokerCard
          card={toPokerCardData(card, levelRank)}
          compact={compact}
          levelRank={levelRank}
          selected={selected}
          size={card.isJoker ? "joker" : compact ? "sm" : "md"}
        />
      </span>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-[-3px] rounded-[17px] opacity-0 transition-opacity duration-150",
          selected && "opacity-100",
          invalid ? "bg-[radial-gradient(circle_at_50%_105%,rgba(255,92,106,0.42),transparent_58%)]" : "bg-[radial-gradient(circle_at_50%_105%,rgba(255,215,0,0.46),transparent_58%)]"
        )}
      />
    </motion.button>
  );
}

function toPokerCardData(card: Card, levelRank: string) {
  return {
    id: card.id,
    isWild: !card.isJoker && getCardLabel(card) === levelRank,
    rank: getCardLabel(card) as PokerRank,
    suit: card.isJoker ? undefined : (card.suit as PokerSuit)
  };
}
