"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Card } from "@/lib/guandan/card";
import { sortCards } from "@/lib/guandan/card";
import { PlayingCard } from "@/components/game/PlayingCard";

interface HandCardsProps {
  cards: Card[];
  selectedCardIds: string[];
  disabled?: boolean;
  onSelectCard: (card: Card) => void;
  onSelectionChange?: (cards: Card[]) => void;
  groupSelection?: boolean;
  showOrganizer?: boolean;
}

export function HandCards({
  cards,
  selectedCardIds,
  disabled = false,
  onSelectCard,
  onSelectionChange
}: HandCardsProps) {
  const sortedCards = useMemo(() => sortCards(cards), [cards]);
  const selectedSet = useMemo(() => new Set(selectedCardIds), [selectedCardIds]);

  function handleSelect(card: Card) {
    if (disabled) return;

    if (!onSelectionChange) {
      onSelectCard(card);
      return;
    }

    const nextCards = selectedSet.has(card.id)
      ? cards.filter((item) => selectedSet.has(item.id) && item.id !== card.id)
      : [...cards.filter((item) => selectedSet.has(item.id)), card];

    onSelectionChange(sortCards(nextCards));
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="overflow-x-auto rounded-[24px] border border-white/60 bg-white/44 px-4 py-3 shadow-[0_20px_60px_rgba(38,126,190,0.20)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay: 0.18 }}
    >
      <div className="flex min-w-max items-end justify-center px-2 pb-1 pt-4">
        {sortedCards.map((card, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={index === 0 ? "" : "-ml-5 sm:-ml-4"}
            initial={{ opacity: 0, y: 28 }}
            key={card.id}
            transition={{ duration: 0.28, delay: 0.015 * index }}
          >
            <PlayingCard
              card={card}
              disabled={disabled}
              onClick={handleSelect}
              selected={selectedSet.has(card.id)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
