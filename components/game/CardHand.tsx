"use client";

import { useEffect, useMemo, useRef } from "react";
import type { PointerEvent } from "react";
import { CardGroup } from "@/components/game/CardGroup";
import { groupCardsForHand, sortCardsForHand } from "@/lib/cards/cardSort";
import type { Card } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";

interface CardHandProps {
  cards: Card[];
  selectedCardIds: string[];
  invalidCardIds?: string[];
  invalidPulseKey?: number;
  disabled?: boolean;
  compact?: boolean;
  cardScale?: number;
  onSelectionChange: (cards: Card[]) => void;
  variant?: "default" | "arena";
}

export function CardHand({
  cards,
  selectedCardIds,
  invalidCardIds = [],
  invalidPulseKey = 0,
  disabled = false,
  compact = false,
  cardScale = 1,
  onSelectionChange,
  variant = "default"
}: CardHandProps) {
  const groups = useMemo(() => groupCardsForHand(cards), [cards]);
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
    onSelectionChange(sortCardsForHand(cards.filter((card) => nextSet.has(card.id))));
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

  function toggleCardGroup(groupCards: Card[]) {
    const currentIds = selectedIdsRef.current;
    const groupIds = groupCards.map((card) => card.id);
    const allSelected = groupIds.every((id) => currentIds.includes(id));
    const nextIds = allSelected
      ? currentIds.filter((id) => !groupIds.includes(id))
      : [...currentIds, ...groupIds.filter((id) => !currentIds.includes(id))];

    selectedIdsRef.current = nextIds;
    commitSelection(nextIds);
  }

  function addCardGroup(groupCards: Card[]) {
    const currentIds = selectedIdsRef.current;
    const groupIds = groupCards.map((card) => card.id);
    const nextIds = [...currentIds, ...groupIds.filter((id) => !currentIds.includes(id))];

    if (nextIds.length === currentIds.length) return;

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

  function handleGroupPointerDown(groupCards: Card[], event: PointerEvent<HTMLButtonElement>) {
    if (disabled) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    isDraggingRef.current = true;
    toggleCardGroup(groupCards);
  }

  function handleGroupPointerEnter(groupCards: Card[]) {
    if (disabled || !isDraggingRef.current) return;
    addCardGroup(groupCards);
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden backdrop-blur-xl",
        variant === "arena"
          ? "rounded-[22px] border border-white/55 bg-[#d8f1ff]/58 px-3 py-3 shadow-[0_18px_42px_rgba(35,112,178,0.20)]"
          : "rounded-[26px] border border-white/20 bg-[#061a24]/78 px-3 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:px-4",
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

      <div
        className={cn(
          "relative flex min-w-0 items-end justify-center px-2",
          variant === "arena"
            ? "max-h-[36vh] flex-wrap gap-x-1 gap-y-0 overflow-visible pb-1 pt-2 lg:max-h-[29vh]"
            : "gap-3 overflow-x-auto pb-4 pt-6 sm:gap-4"
        )}
      >
        {groups.map((group) => (
          <CardGroup
            sizeScale={cardScale}
            compact={compact}
            disabled={disabled}
            group={group}
            invalidCardIds={invalidSet}
            invalidPulseKey={invalidPulseKey}
            key={group.id}
            layout={variant === "arena" ? "stack" : "row"}
            onGroupPointerDown={handleGroupPointerDown}
            onGroupPointerEnter={handleGroupPointerEnter}
            onPointerDownCard={handlePointerDown}
            onPointerEnterCard={handlePointerEnter}
            selectedCardIds={selectedSet}
          />
        ))}
      </div>
    </div>
  );
}
