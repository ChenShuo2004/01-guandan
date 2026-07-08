"use client";

import type { PointerEvent } from "react";
import { PlayingCard } from "@/components/cards/PlayingCard";
import type { CardHandGroup } from "@/lib/cards/cardSort";
import type { Card } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";

interface CardGroupProps {
  group: CardHandGroup;
  compact?: boolean;
  disabled?: boolean;
  invalidCardIds: Set<string>;
  invalidPulseKey: number;
  selectedCardIds: Set<string>;
  onPointerDownCard: (card: Card, event: PointerEvent<HTMLButtonElement>) => void;
  onPointerEnterCard: (card: Card) => void;
}

export function CardGroup({
  compact = false,
  disabled = false,
  group,
  invalidCardIds,
  invalidPulseKey,
  onPointerDownCard,
  onPointerEnterCard,
  selectedCardIds
}: CardGroupProps) {
  return (
    <div
      className={cn(
        "relative flex items-end",
        group.type === "bomb" && "drop-shadow-[0_0_18px_rgba(255,216,77,0.34)]"
      )}
      data-card-group={group.type}
    >
      {group.cards.map((card, index) => {
        const selected = selectedCardIds.has(card.id);
        const invalid = invalidCardIds.has(card.id);

        return (
          <div
            className={cn("relative", index === 0 ? "" : compact ? "-ml-4" : "-ml-6 sm:-ml-5")}
            key={card.id}
            style={{ zIndex: selected || invalid ? 100 + index : index }}
          >
            <PlayingCard
              card={card}
              compact={compact}
              disabled={disabled}
              invalid={invalid}
              invalidPulseKey={invalidPulseKey}
              onPointerDownCard={onPointerDownCard}
              onPointerEnterCard={onPointerEnterCard}
              selected={selected}
            />
          </div>
        );
      })}
      {group.type !== "single" ? (
        <span className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-[#061a24]/82 px-2 py-0.5 text-[10px] font-black text-[#ffd84d]">
          {group.label}
        </span>
      ) : null}
    </div>
  );
}
