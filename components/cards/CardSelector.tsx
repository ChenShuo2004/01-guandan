"use client";

import { useEffect, useMemo, useRef } from "react";
import type { PointerEvent } from "react";
import type { Card } from "@/lib/guandan/card";
import { sortCards } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";
import { PlayingCard } from "./PlayingCard";

interface CardSelectorProps {
  cards: Card[];
  selectedCardIds: string[];
  invalidCardIds?: string[];
  invalidPulseKey?: number;
  disabled?: boolean;
  compact?: boolean;
  onSelectionChange: (cards: Card[]) => void;
}

export function CardSelector({
  cards,
  selectedCardIds,
  invalidCardIds = [],
  invalidPulseKey = 0,
  disabled = false,
  compact = false,
  onSelectionChange
}: CardSelectorProps) {
  const sortedCards = useMemo(() => sortCards(cards), [cards]);
  const selectedSet = useMemo(() => new Set(selectedCardIds), [selectedCardIds]);
  const invalidSet = useMemo(() => new Set(invalidCardIds), [invalidCardIds]);
  const selectedIdsRef = useRef(selectedCardIds);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    selectedIdsRef.current = selectedCardIds;
  }, [selectedCardIds]);

  useEffect(() => {
    function stopDragging() {
      isDraggingRef.current = false;
    }

    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    return () => {
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, []);

  function commitSelection(nextIds: string[]) {
    const nextSet = new Set(nextIds);
    onSelectionChange(sortCards(cards.filter((card) => nextSet.has(card.id))));
  }

  function toggleCard(card: Card) {
    const currentIds = selectedIdsRef.current;
    const isSelected = currentIds.includes(card.id);
    const nextIds = isSelected
      ? currentIds.filter((id) => id !== card.id)
      : [...currentIds, card.id];

    selectedIdsRef.current = nextIds;
    commitSelection(nextIds);
  }

  function addCard(card: Card) {
    const currentIds = selectedIdsRef.current;
    if (currentIds.includes(card.id)) return;

    const nextIds = [...currentIds, card.id];
    selectedIdsRef.current = nextIds;
    commitSelection(nextIds);
  }

  function handlePointerDown(card: Card, event: PointerEvent<HTMLButtonElement>) {
    if (disabled) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    isDraggingRef.current = true;
    toggleCard(card);
  }

  function handlePointerEnter(card: Card) {
    if (disabled || !isDraggingRef.current) return;
    addCard(card);
  }

  return (
    <div
      className={cn(
        "relative overflow-x-auto rounded-[26px] border border-white/20 bg-[#061a24]/78 px-4 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl",
        disabled && "opacity-75"
      )}
      data-selected-count={selectedCardIds.length}
    >
      {selectedCardIds.length > 1 ? (
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-5 left-1/2 h-9 w-[72%] -translate-x-1/2 rounded-full bg-[#ffd700]/34 blur-xl"
        />
      ) : null}

      <div className="relative flex min-w-max items-end justify-center px-3 pb-1 pt-6">
        {sortedCards.map((card, index) => {
          const selected = selectedSet.has(card.id);
          const invalid = invalidSet.has(card.id);

          return (
            <div
              className={cn(
                "relative",
                index === 0 ? "" : compact ? "-ml-4" : "-ml-6 sm:-ml-5"
              )}
              key={card.id}
              style={{ zIndex: selected || invalid ? 80 + index : index }}
            >
              <PlayingCard
                card={card}
                compact={compact}
                disabled={disabled}
                invalid={invalid}
                invalidPulseKey={invalidPulseKey}
                onPointerDownCard={handlePointerDown}
                onPointerEnterCard={handlePointerEnter}
                selected={selected}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
