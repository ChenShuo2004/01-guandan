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
  layout?: "row" | "stack";
  sizeScale?: number;
  selectedCardIds: Set<string>;
  onGroupPointerDown?: (cards: Card[], event: PointerEvent<HTMLButtonElement>) => void;
  onGroupPointerEnter?: (cards: Card[]) => void;
  onPointerDownCard: (card: Card, event: PointerEvent<HTMLButtonElement>) => void;
  onPointerEnterCard: (card: Card) => void;
}

export function CardGroup({
  compact = false,
  disabled = false,
  group,
  invalidCardIds,
  invalidPulseKey,
  layout = "row",
  onGroupPointerDown,
  onGroupPointerEnter,
  onPointerDownCard,
  onPointerEnterCard,
  sizeScale = 1,
  selectedCardIds
}: CardGroupProps) {
  if (layout === "stack") {
    const baseSize = compact ? { height: 90, width: 64 } : { height: 122, width: 86 };
    const cardWidth = Math.round(baseSize.width * sizeScale);
    const cardHeight = Math.round(baseSize.height * sizeScale);
    const stackStep = Math.max(15, Math.round(cardHeight * 0.26));
    const selectedGroup = group.cards.some((card) => selectedCardIds.has(card.id));

    return (
      <div
        className={cn(
          "relative flex shrink-0 items-end",
          group.type === "bomb" && "drop-shadow-[0_0_18px_rgba(255,216,77,0.34)]"
        )}
        data-card-group={group.type}
        style={{
          height: cardHeight + (group.cards.length - 1) * stackStep,
          width: cardWidth
        }}
      >
        <button
          aria-label={group.label}
          className={cn(
            "absolute inset-0 z-[220] rounded-xl outline-none transition",
            !disabled && "cursor-pointer hover:bg-white/5",
            selectedGroup && "ring-2 ring-[#ffd700]/80"
          )}
          disabled={disabled}
          onPointerDown={(event) => onGroupPointerDown?.(group.cards, event)}
          onPointerEnter={() => onGroupPointerEnter?.(group.cards)}
          type="button"
        />
        {group.cards.map((card, index) => {
          const selected = selectedCardIds.has(card.id);
          const invalid = invalidCardIds.has(card.id);

          return (
            <div
              className="absolute left-0"
              key={card.id}
              style={{
                bottom: index * stackStep,
                pointerEvents: "none",
                zIndex: selected || invalid ? 100 + index : index
              }}
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
                sizeScale={sizeScale}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative mb-2 flex items-end lg:mb-5",
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
              sizeScale={sizeScale}
            />
          </div>
        );
      })}
      {group.type !== "single" ? (
        <span className="pointer-events-none absolute -bottom-4 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-[#061a24]/82 px-2 py-0.5 text-[10px] font-black text-[#ffd84d] lg:block">
          {group.label}
        </span>
      ) : null}
    </div>
  );
}
