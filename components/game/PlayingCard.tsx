"use client";

import { PokerCard } from "@/components/cards/PokerCard";
import { getCardLabel, type Card } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";
import type { PokerCardData, PokerRank, PokerSuit } from "@/types/poker";

interface PlayingCardProps {
  card: Card;
  compact?: boolean;
  disabled?: boolean;
  levelRank?: string;
  selected?: boolean;
  onClick?: (card: Card) => void;
}

export function PlayingCard({
  card,
  compact = false,
  disabled = false,
  levelRank = "10",
  selected = false,
  onClick
}: PlayingCardProps) {
  return (
    <button
      className={cn(
        "rounded-xl transition active:scale-[0.98]",
        selected && "-translate-y-2",
        disabled ? "cursor-default" : "cursor-pointer hover:-translate-y-1"
      )}
      disabled={disabled}
      onClick={() => onClick?.(card)}
      type="button"
    >
      <PokerCard card={toPokerCardData(card, levelRank)} compact={compact} levelRank={levelRank} selected={selected} size={compact ? "sm" : "md"} variant="played" />
    </button>
  );
}

function toPokerCardData(card: Card, levelRank: string): PokerCardData {
  return {
    id: card.id,
    isWild: !card.isJoker && getCardLabel(card) === levelRank,
    rank: getCardLabel(card) as PokerRank,
    suit: card.isJoker ? undefined : (card.suit as PokerSuit)
  };
}
