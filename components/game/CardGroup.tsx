"use client";

import type { PointerEvent } from "react";
import { PlayingCard } from "@/components/cards/PlayingCard";
import type { CardHandGroup } from "@/lib/cards/cardSort";
import type { Card } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";

interface CardGroupProps {
  group: CardHandGroup;
  cardDimensions?: {
    height: number;
    width: number;
  };
  compact?: boolean;
  disabled?: boolean;
  invalidCardIds: Set<string>;
  invalidPulseKey: number;
  layout?: "row" | "stack";
  levelRank?: string;
  sizeScale?: number;
  stackStep?: number;
  selectedCardIds: Set<string>;
  onGroupPointerDown?: (cards: Card[], event: PointerEvent<HTMLButtonElement>) => void;
  onGroupPointerEnter?: (cards: Card[]) => void;
  onPointerDownCard: (card: Card, event: PointerEvent<HTMLButtonElement>) => void;
  onPointerEnterCard: (card: Card) => void;
}

export function CardGroup({
  cardDimensions,
  compact = false,
  disabled = false,
  group,
  invalidCardIds,
  invalidPulseKey,
  layout = "row",
  levelRank = "10",
  onGroupPointerDown,
  onGroupPointerEnter,
  onPointerDownCard,
  onPointerEnterCard,
  sizeScale = 1,
  stackStep: requestedStackStep,
  selectedCardIds
}: CardGroupProps) {
  if (layout === "stack") {
    const baseSize = compact ? { height: 94, width: 67 } : { height: 146, width: 104 };
    const cardWidth = cardDimensions?.width ?? Math.round(baseSize.width * sizeScale);
    const cardHeight = cardDimensions?.height ?? Math.round(baseSize.height * sizeScale);
    const stackStep = requestedStackStep ?? Math.max(24, Math.round(cardHeight * 0.34));
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
        {group.cards.map((card, index) => {
          const selected = selectedCardIds.has(card.id);
          const invalid = invalidCardIds.has(card.id);

          return (
            <div
              className="absolute left-0"
              key={card.id}
              style={{
                bottom: index * stackStep,
                pointerEvents: "auto",
                zIndex: selected || invalid ? 100 + index : index
              }}
            >
              <PlayingCard
                card={card}
                dimensions={cardDimensions}
                compact={compact}
                disabled={disabled}
                invalid={invalid}
                invalidPulseKey={invalidPulseKey}
                levelRank={levelRank}
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
              dimensions={cardDimensions}
              compact={compact}
              disabled={disabled}
              invalid={invalid}
              invalidPulseKey={invalidPulseKey}
              levelRank={levelRank}
              onPointerDownCard={onPointerDownCard}
              onPointerEnterCard={onPointerEnterCard}
              selected={selected}
              sizeScale={sizeScale}
            />
          </div>
        );
      })}
      {layout === "row" && group.type !== "single" ? (
        <span className="pointer-events-none absolute -bottom-4 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-[#061a24]/82 px-2 py-0.5 text-[10px] font-black text-[#ffd84d] lg:block">
          {group.label}
        </span>
      ) : null}
    </div>
  );
}
