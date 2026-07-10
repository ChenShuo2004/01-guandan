"use client";

import { useEffect, useMemo, useRef } from "react";
import type { PointerEvent } from "react";
import { motion } from "framer-motion";
import { CardGroup } from "@/components/game/CardGroup";
import type { CardHandGroup } from "@/lib/cards/cardSort";
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
  const arenaGroups = useMemo(() => groupCardsForArena(cards), [cards]);
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
    const arenaCardScale = cardScale;
    const arenaCardOverlap = cards.length > 20 ? 42 : cards.length > 16 ? 30 : 14;

    return (
      <div
        className={cn("training-player-hand relative z-[90] overflow-visible px-2 py-1", disabled && "opacity-75")}
        data-selected-count={selectedCardIds.length}
        style={{
          ["--arena-card-overlap" as string]: `${Math.round(arenaCardOverlap * arenaCardScale)}px`,
          ["--arena-card-min-height" as string]: `${Math.round(178 * arenaCardScale)}px`
        }}
      >
        <div className="arena-hand-row relative flex min-h-[var(--arena-card-min-height)] min-w-0 items-end justify-center gap-1 overflow-visible px-1 pb-2 pt-7">
          {arenaGroups.map((group, index) => (
            <motion.div
              animate={{ scale: sortPulseKey > 0 ? [1, 1.025, 1] : 1 }}
              className="relative shrink-0"
              key={group.id}
              layout
              style={{ zIndex: index }}
              transition={{
                layout: { duration: 0.4, ease: "easeOut" },
                scale: { delay: 0.4, duration: 0.22, ease: "easeOut" }
              }}
            >
              <CardGroup
                disabled={disabled}
                group={group}
                invalidCardIds={invalidSet}
                invalidPulseKey={invalidPulseKey}
                layout="stack"
                levelRank={levelRank}
                onPointerDownCard={handlePointerDown}
                onPointerEnterCard={handlePointerEnter}
                selectedCardIds={selectedSet}
                sizeScale={arenaCardScale}
              />
            </motion.div>
          ))}
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

function groupCardsForArena(cards: Card[]): CardHandGroup[] {
  const byRank = new Map<number, Card[]>();

  for (const card of cards) {
    byRank.set(card.rank, [...(byRank.get(card.rank) ?? []), card]);
  }

  return [...byRank.entries()]
    .sort(([rankA], [rankB]) => rankA - rankB)
    .map(([rank, rankCards]) => {
      const sortedCards = sortCardsForHand(rankCards);
      const type = sortedCards.length >= 4 ? "bomb" : sortedCards.length === 3 ? "triple" : sortedCards.length === 2 ? "pair" : "single";

      return {
        id: `arena-rank-${rank}`,
        type,
        label: String(rank),
        power: rank,
        cards: sortedCards
      } satisfies CardHandGroup;
    });
}
