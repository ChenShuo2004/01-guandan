"use client";

import { useEffect, useMemo, useRef } from "react";
import type { PointerEvent } from "react";
import { motion } from "framer-motion";
import { CardGroup } from "@/components/game/CardGroup";
import { PlayingCard } from "@/components/cards/PlayingCard";
import { groupCardsForHand, sortCardsForHand } from "@/lib/cards/cardSort";
import type { Card } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";

interface CardHandProps {
  cards: Card[];
  selectedCardIds: string[];
  invalidCardIds?: string[];
  invalidPulseKey?: number;
  levelRank?: string;
  disabled?: boolean;
  compact?: boolean;
  cardScale?: number;
  sortPulseKey?: number;
  onSelectionChange: (cards: Card[]) => void;
  variant?: "default" | "arena";
}

export function CardHand({
  cards,
  selectedCardIds,
  invalidCardIds = [],
  invalidPulseKey = 0,
  levelRank = "10",
  disabled = false,
  compact = false,
  cardScale = 1,
  sortPulseKey = 0,
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

  if (variant === "arena") {
    return (
      <div
        className={cn("relative overflow-visible px-2 py-1", disabled && "opacity-75")}
        data-selected-count={selectedCardIds.length}
      >
        {selectedCardIds.length > 1 ? (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-4 left-1/2 h-8 w-[60%] -translate-x-1/2 rounded-full bg-[#ffd700]/28 blur-xl"
          />
        ) : null}

        <div className="relative flex min-h-[176px] min-w-0 items-end justify-center overflow-visible px-1 pb-2 pt-7">
          {cards.map((card, index) => {
            const selected = selectedSet.has(card.id);
            const invalid = invalidSet.has(card.id);

            return (
              <motion.div
                animate={{
                  scale: sortPulseKey > 0 ? [1, 1.025, 1] : 1
                }}
                className={cn("relative shrink-0", index === 0 ? "" : "-ml-6 sm:-ml-7")}
                key={card.id}
                layout
                style={{ zIndex: selected || invalid ? 100 + index : index }}
                transition={{
                  layout: { duration: 0.4, ease: "easeOut" },
                  scale: { delay: 0.4, duration: 0.22, ease: "easeOut" }
                }}
              >
                <PlayingCard
                  card={card}
                  disabled={disabled}
                  invalid={invalid}
                  invalidPulseKey={invalidPulseKey}
                  levelRank={levelRank}
                  onPointerDownCard={handlePointerDown}
                  onPointerEnterCard={handlePointerEnter}
                  selected={selected}
                  sizeScale={0.76}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[26px] border border-white/20 bg-[#061a24]/78 px-3 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:px-4",
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
        className="relative flex min-w-0 items-end justify-center gap-3 overflow-x-auto px-2 pb-4 pt-6 sm:gap-4"
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
            levelRank={levelRank}
            layout="row"
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
