"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { motion } from "framer-motion";
import { CardGroup } from "@/components/game/CardGroup";
import type { CardHandGroup } from "@/lib/cards/cardSort";
import { groupCardsForHand, sortCardsForHand } from "@/lib/cards/cardSort";
import type { Card, CardRank } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";

interface CardHandProps {
  cards: Card[];
  arrangementLevelRank?: CardRank;
  arrangeGroups?: boolean;
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

interface ArenaCardMetrics {
  cardHeight: number;
  cardWidth: number;
  groupGap: number;
  minHeight: number;
  stackStep: number;
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
  const [arenaMetrics, setArenaMetrics] = useState<ArenaCardMetrics | null>(null);

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

  useEffect(() => {
    if (variant !== "arena") return;

    function syncArenaMetrics() {
      const isPhoneLandscape =
        window.innerWidth > window.innerHeight &&
        window.matchMedia("(orientation: landscape) and (max-height: 600px)").matches;

      if (!isPhoneLandscape) {
        setArenaMetrics(null);
        return;
      }

      const horizontalPadding = Math.max(24, Math.min(72, window.innerWidth * 0.055));
      const availableWidth = window.innerWidth - horizontalPadding;
      const heightRatio = cards.length <= 10 ? 0.26 : cards.length <= 15 ? 0.23 : 0.20;
      const heightLimit = Math.max(58, Math.min(cards.length <= 10 ? 100 : 88, window.innerHeight * heightRatio));
      const widthFromHeight = heightLimit * (89 / 124);
      const cardOverlap = 20;
      const widthFromAvailable = (availableWidth + cardOverlap * Math.max(0, cards.length - 1)) / Math.max(1, cards.length);
      const scaleFactor = Math.min(1, widthFromAvailable / widthFromHeight);
      const cardWidth = Math.max(38, Math.round(widthFromHeight * scaleFactor));
      const cardHeight = cardWidth * (124 / 89);
      const minHeight = cardHeight + Math.max(8, cardHeight * 0.12);

      setArenaMetrics({
        cardHeight: Math.round(cardHeight),
        cardWidth: Math.round(cardWidth),
        groupGap: 0,
        minHeight: Math.round(minHeight),
        stackStep: 0
      });
    }

    syncArenaMetrics();
    window.addEventListener("resize", syncArenaMetrics);
    window.addEventListener("orientationchange", syncArenaMetrics);
    window.visualViewport?.addEventListener("resize", syncArenaMetrics);
    return () => {
      window.removeEventListener("resize", syncArenaMetrics);
      window.removeEventListener("orientationchange", syncArenaMetrics);
      window.visualViewport?.removeEventListener("resize", syncArenaMetrics);
    };
  }, [cards.length, variant]);

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
    const arenaMinHeight = arenaMetrics?.minHeight ?? Math.round(140 * arenaCardScale);
    const arenaDisplayGroup: CardHandGroup = {
      id: "arena-hand",
      type: "single",
      label: "",
      power: 0,
      cards
    };

    return (
      <div
        className="training-player-hand relative z-[90] overflow-visible px-2 py-1"
        data-selected-count={selectedCardIds.length}
        style={{
          ["--arena-card-min-height" as string]: `${arenaMinHeight}px`
        }}
      >
        <div
          className="arena-hand-row relative flex min-h-[var(--arena-card-min-height)] min-w-0 items-end justify-center overflow-visible px-1 pb-1 pt-4"
          style={{ columnGap: 0 }}
        >
          <motion.div
            animate={{ scale: sortPulseKey > 0 ? [1, 1.025, 1] : 1 }}
            className="relative shrink-0"
            layout
            transition={{
              layout: { duration: 0.3, ease: "easeOut" },
              scale: { delay: 0.3, duration: 0.22, ease: "easeOut" }
            }}
          >
            <CardGroup
              cardDimensions={arenaMetrics ? { height: arenaMetrics.cardHeight, width: arenaMetrics.cardWidth } : undefined}
              disabled={disabled}
              group={arenaDisplayGroup}
              invalidCardIds={invalidSet}
              invalidPulseKey={invalidPulseKey}
              layout="row"
              levelRank={levelRank}
              onPointerDownCard={handlePointerDown}
              onPointerEnterCard={handlePointerEnter}
              selectedCardIds={selectedSet}
              sizeScale={arenaCardScale}
            />
          </motion.div>
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


