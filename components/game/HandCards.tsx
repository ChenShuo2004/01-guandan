"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Card, CardRank } from "@/lib/guandan/card";
import { getRankCounts, sortCards, sortCardsAscending } from "@/lib/guandan/card";
import { PlayingCard } from "@/components/game/PlayingCard";
import { cn } from "@/lib/utils";

interface HandCardsProps {
  cards: Card[];
  selectedCardIds: string[];
  disabled?: boolean;
  onSelectCard: (card: Card) => void;
  onSelectionChange?: (cards: Card[]) => void;
  groupSelection?: boolean;
  showOrganizer?: boolean;
}

type HandGroupType = "single" | "pair" | "triple" | "bomb" | "straight";

interface HandGroup {
  id: string;
  type: HandGroupType;
  label: string;
  cards: Card[];
}

const groupOrder: HandGroupType[] = ["single", "pair", "triple", "bomb", "straight"];

const groupLabel: Record<HandGroupType, string> = {
  single: "单牌",
  pair: "对子",
  triple: "三张",
  bomb: "炸弹",
  straight: "顺子"
};

export function HandCards({
  cards,
  selectedCardIds,
  disabled = false,
  onSelectCard,
  onSelectionChange,
  groupSelection = false,
  showOrganizer = false
}: HandCardsProps) {
  const [organizeKey, setOrganizeKey] = useState(0);
  const selectedSet = useMemo(() => new Set(selectedCardIds), [selectedCardIds]);
  const handGroups = useMemo(() => organizeHandCards(cards), [cards]);

  function updateSelection(nextCards: Card[]) {
    if (onSelectionChange) {
      onSelectionChange(sortCards(nextCards));
      return;
    }

    const nextIds = new Set(nextCards.map((card) => card.id));
    const currentCards = cards.filter((card) => selectedSet.has(card.id));
    const currentIds = new Set(currentCards.map((card) => card.id));

    for (const card of cards) {
      if (nextIds.has(card.id) !== currentIds.has(card.id)) {
        onSelectCard(card);
      }
    }
  }

  function toggleCards(targetCards: Card[]) {
    if (disabled) return;

    const currentCards = cards.filter((card) => selectedSet.has(card.id));
    const targetIds = new Set(targetCards.map((card) => card.id));
    const isWholeTargetSelected = targetCards.every((card) => selectedSet.has(card.id));

    const nextCards = isWholeTargetSelected
      ? currentCards.filter((card) => !targetIds.has(card.id))
      : [...currentCards, ...targetCards.filter((card) => !selectedSet.has(card.id))];

    updateSelection(nextCards);
  }

  function handleCardClick(card: Card, group: HandGroup) {
    if (!groupSelection || group.cards.length === 1) {
      toggleCards([card]);
      return;
    }

    toggleCards(group.cards);
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="overflow-x-auto rounded-[28px] border border-white/12 bg-white/[0.08] px-4 py-4 shadow-[0_18px_55px_rgba(10,35,70,0.28)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.55, delay: 0.25 }}
    >
      {showOrganizer ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#77d7ff]">Smart Hand</p>
            <p className="mt-1 text-sm font-bold text-white/68">自动按单牌、对子、三张、炸弹、顺子整理</p>
          </div>
          <button
            className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/16 disabled:opacity-45"
            disabled={disabled}
            onClick={() => setOrganizeKey((key) => key + 1)}
            type="button"
          >
            重新整理
          </button>
        </div>
      ) : null}

      <div className="flex min-w-max items-end gap-5 pb-3" key={organizeKey}>
        {handGroups.map((group, groupIndex) => {
          const isSelected = group.cards.every((card) => selectedSet.has(card.id));

          return (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-2xl border px-3 pb-3 pt-2 transition",
                isSelected ? "border-[#77d7ff]/70 bg-[#77d7ff]/12" : "border-white/10 bg-white/[0.04]"
              )}
              initial={{ opacity: 0, y: 26 }}
              key={group.id}
              transition={{ duration: 0.35, delay: 0.04 * groupIndex }}
            >
              <button
                className="mb-3 flex w-full items-center justify-between gap-4 text-left text-xs font-black text-white/62 disabled:cursor-default"
                disabled={disabled || !groupSelection || group.cards.length === 1}
                onClick={() => toggleCards(group.cards)}
                type="button"
              >
                <span>{group.label}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5">{group.cards.length}</span>
              </button>
              <div className="flex items-end justify-center">
                {group.cards.map((card, index) => (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className={index === 0 ? "" : "-ml-5 sm:-ml-4"}
                    initial={{ opacity: 0, y: 30 }}
                    key={card.id}
                    transition={{ duration: 0.35, delay: 0.02 * index }}
                  >
                    <PlayingCard
                      card={card}
                      disabled={disabled}
                      onClick={() => handleCardClick(card, group)}
                      selected={selectedSet.has(card.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function organizeHandCards(cards: Card[]): HandGroup[] {
  const rankCounts = getRankCounts(sortCardsAscending(cards));
  const usedCardIds = new Set<string>();
  const groups: Record<HandGroupType, HandGroup[]> = {
    single: [],
    pair: [],
    triple: [],
    bomb: [],
    straight: []
  };

  for (const [rank, rankCards] of rankCounts.entries()) {
    const sortedRankCards = sortCards(rankCards);

    if (rankCards.length >= 4) {
      groups.bomb.push(createGroup("bomb", rank, sortedRankCards));
      sortedRankCards.forEach((card) => usedCardIds.add(card.id));
    } else if (rankCards.length === 3) {
      groups.triple.push(createGroup("triple", rank, sortedRankCards));
      sortedRankCards.forEach((card) => usedCardIds.add(card.id));
    } else if (rankCards.length === 2) {
      groups.pair.push(createGroup("pair", rank, sortedRankCards));
      sortedRankCards.forEach((card) => usedCardIds.add(card.id));
    }
  }

  const singleCandidates = sortCardsAscending(cards.filter((card) => !usedCardIds.has(card.id)));
  const straightGroups = extractStraightGroups(singleCandidates);

  for (const straight of straightGroups) {
    groups.straight.push(createGroup("straight", straight[0].rank, straight));
    straight.forEach((card) => usedCardIds.add(card.id));
  }

  for (const card of sortCards(cards.filter((item) => !usedCardIds.has(item.id)))) {
    groups.single.push(createGroup("single", card.rank, [card]));
  }

  return groupOrder.flatMap((type) => groups[type]);
}

function extractStraightGroups(cards: Card[]) {
  const candidates = cards.filter((card) => !card.isJoker && card.rank < 15);
  const byRank = new Map<CardRank, Card>();

  for (const card of candidates) {
    if (!byRank.has(card.rank)) byRank.set(card.rank, card);
  }

  const ranks = [...byRank.keys()].sort((a, b) => a - b);
  const groups: Card[][] = [];
  let current: Card[] = [];

  for (const rank of ranks) {
    const card = byRank.get(rank);
    if (!card) continue;

    const previous = current[current.length - 1];
    if (!previous || rank === previous.rank + 1) {
      current.push(card);
    } else {
      if (current.length >= 5) groups.push(current);
      current = [card];
    }
  }

  if (current.length >= 5) groups.push(current);
  return groups;
}

function createGroup(type: HandGroupType, rank: CardRank, cards: Card[]): HandGroup {
  return {
    id: `${type}-${rank}-${cards.map((card) => card.id).join("-")}`,
    type,
    label: groupLabel[type],
    cards
  };
}
