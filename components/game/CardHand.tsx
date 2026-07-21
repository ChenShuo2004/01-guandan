"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { motion } from "framer-motion";
import { CardGroup } from "@/components/game/CardGroup";
import type { CardHandGroup } from "@/lib/cards/cardSort";
import { groupCardsForHand, sortCardsForHand } from "@/lib/cards/cardSort";
import type { Card, CardRank } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";
import { arrangeCardGroups, type CardGroup as ArrangedCardGroup } from "@/utils/cardArrange";

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
  arrangementLevelRank,
  arrangeGroups = false,
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
  const arenaGroups = useMemo(
    () => groupCardsForArena(cards, arrangeGroups ?? false, arrangementLevelRank),
    [arrangeGroups, arrangementLevelRank, cards]
  );
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
      const isLandscape = window.innerWidth > window.innerHeight;
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      const isPhoneLandscape =
        isLandscape && window.matchMedia("(orientation: landscape) and (max-height: 600px)").matches;
      const isPhonePortrait = window.innerWidth <= 767 && isPortrait;
      const isTabletPortrait = window.innerWidth > 767 && window.innerWidth <= 1024 && isPortrait;
      const isTabletLandscape = isLandscape && window.innerWidth <= 1180 && window.innerHeight <= 900;
      const shouldUseAdaptiveMetrics = isPhoneLandscape || isPhonePortrait || isTabletPortrait || isTabletLandscape;

      if (!shouldUseAdaptiveMetrics) {
        setArenaMetrics(null);
        return;
      }

      const horizontalPadding = isPhonePortrait
        ? Math.max(16, window.innerWidth * 0.045)
        : isTabletPortrait
          ? Math.max(36, window.innerWidth * 0.075)
          : Math.max(24, Math.min(92, window.innerWidth * 0.06));
      const availableWidth = window.innerWidth - horizontalPadding;
      const groupCount = Math.max(1, arenaGroups.length);
      const maxGroupSize = Math.max(1, ...arenaGroups.map((group) => group.cards.length));
      const preferredGap = isPhonePortrait
        ? cards.length <= 15 ? 2 : 1
        : isTabletPortrait
          ? cards.length <= 15 ? 5 : 3
          : cards.length <= 10 ? 8 : cards.length <= 15 ? 4 : 2;
      const heightRatio = isPhonePortrait
        ? cards.length <= 10 ? 0.1 : 0.085
        : isTabletPortrait
          ? cards.length <= 10 ? 0.12 : 0.1
          : cards.length <= 10 ? 0.2 : cards.length <= 15 ? 0.18 : 0.16;
      const maxCardHeight = isPhonePortrait
        ? cards.length <= 10 ? 78 : 64
        : isTabletPortrait
          ? cards.length <= 10 ? 96 : 84
          : cards.length <= 10 ? 104 : 92;
      const minCardHeight = isPhonePortrait ? 36 : isTabletPortrait ? 56 : 58;
      const heightLimit = Math.max(minCardHeight, Math.min(maxCardHeight, window.innerHeight * heightRatio));
      const widthFromHeight = heightLimit * (89 / 124);
      const widthFromAvailable = (availableWidth - preferredGap * (groupCount - 1)) / groupCount;
      const minCardWidth = isPhonePortrait ? 24 : isTabletPortrait ? 36 : 38;
      const cardWidth = Math.max(minCardWidth, Math.min(widthFromHeight, widthFromAvailable));
      const cardHeight = cardWidth * (124 / 89);
      const remainingWidth = Math.max(0, availableWidth - cardWidth * groupCount);
      const groupGap = groupCount > 1 ? Math.min(preferredGap, remainingWidth / (groupCount - 1)) : 0;
      const maxStackExtra = isPhonePortrait
        ? Math.max(12, Math.min(28, window.innerHeight * 0.04))
        : isTabletPortrait
          ? Math.max(18, Math.min(36, window.innerHeight * 0.045))
          : Math.max(16, Math.min(42, window.innerHeight * 0.06));
      const stackStep =
        maxGroupSize > 1
          ? Math.max(8, Math.min(18, Math.floor(maxStackExtra / (maxGroupSize - 1))))
          : 0;
      const minHeight = cardHeight + stackStep * (maxGroupSize - 1) + Math.max(8, cardHeight * 0.08);

      setArenaMetrics({
        cardHeight: Math.round(cardHeight),
        cardWidth: Math.round(cardWidth),
        groupGap: Number(groupGap.toFixed(1)),
        minHeight: Math.round(minHeight),
        stackStep
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
  }, [arenaGroups, cards.length, variant]);

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
    const arenaMinHeight = arenaMetrics?.minHeight ?? Math.round(178 * arenaCardScale);

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
          style={{ columnGap: arenaMetrics?.groupGap ?? 4 }}
        >
          {arenaGroups.map((group, index) => (
            <motion.div
              animate={{ scale: sortPulseKey > 0 ? [1, 1.025, 1] : 1 }}
              className="relative shrink-0"
              key={group.id}
              layout
              style={{ zIndex: index }}
              transition={{
                layout: { duration: 0.3, ease: "easeOut" },
                scale: { delay: 0.3, duration: 0.22, ease: "easeOut" }
              }}
            >
              <CardGroup
                cardDimensions={arenaMetrics ? { height: arenaMetrics.cardHeight, width: arenaMetrics.cardWidth } : undefined}
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
                stackStep={arenaMetrics?.stackStep}
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

function groupCardsForArena(cards: Card[], arrangeGroups: boolean, levelRank?: CardRank): CardHandGroup[] {
  if (arrangeGroups && levelRank) {
    return arrangeCardGroups(cards, levelRank).map(toArenaGroup);
  }

  const groups: Card[][] = [];

  for (const card of cards) {
    const previous = groups[groups.length - 1];
    if (previous?.[0]?.rank === card.rank) {
      previous.push(card);
    } else {
      groups.push([card]);
    }
  }

  return groups.map((groupCards) => {
    const type = groupCards.length >= 4 ? "bomb" : groupCards.length === 3 ? "triple" : groupCards.length === 2 ? "pair" : "single";
    const power = Math.max(...groupCards.map((card) => card.rank));

    return {
      id: `arena-${groupCards.map((card) => card.id).join("-")}`,
      type,
      label: String(power),
      power,
      cards: groupCards
    } satisfies CardHandGroup;
  });
}

function toArenaGroup(group: ArrangedCardGroup): CardHandGroup {
  const type =
    group.type === "bomb" || group.type === "fourJokers"
      ? "bomb"
      : group.type === "triple"
        ? "triple"
        : group.type === "pair"
          ? "pair"
          : group.type === "single"
            ? "single"
            : "straight";

  return {
    id: `arena-${group.type}-${group.cards.map((card) => card.id).join("-")}`,
    type,
    label: groupLabel(group),
    power: group.power,
    cards: group.cards
  };
}

function groupLabel(group: ArrangedCardGroup) {
  const labels: Record<ArrangedCardGroup["type"], string> = {
    fourJokers: "天王炸",
    straightFlush: "同花顺",
    bomb: `${group.cards.length}炸`,
    steel: "钢板",
    plane: "飞机",
    straight: "顺子",
    tripleWithPair: "三带二",
    triple: "三张",
    pair: "对子",
    single: "单牌"
  };

  return labels[group.type];
}

