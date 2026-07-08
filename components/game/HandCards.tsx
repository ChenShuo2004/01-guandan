"use client";

import { CardHand } from "@/components/game/CardHand";
import type { Card } from "@/lib/guandan/card";

interface HandCardsProps {
  cards: Card[];
  selectedCardIds: string[];
  invalidCardIds?: string[];
  invalidPulseKey?: number;
  disabled?: boolean;
  onSelectCard: (card: Card) => void;
  onSelectionChange?: (cards: Card[]) => void;
  groupSelection?: boolean;
  showOrganizer?: boolean;
}

export function HandCards({
  cards,
  selectedCardIds,
  invalidCardIds = [],
  invalidPulseKey = 0,
  disabled = false,
  onSelectCard,
  onSelectionChange
}: HandCardsProps) {
  const updateSelection =
    onSelectionChange ??
    ((nextCards: Card[]) => {
      const nextIds = new Set(nextCards.map((card) => card.id));
      const currentIds = new Set(selectedCardIds);
      const changedCard =
        cards.find((card) => nextIds.has(card.id) !== currentIds.has(card.id)) ?? nextCards[0];

      if (changedCard) {
        onSelectCard(changedCard);
      }
    });

  return (
    <CardHand
      cards={cards}
      disabled={disabled}
      invalidCardIds={invalidCardIds}
      invalidPulseKey={invalidPulseKey}
      onSelectionChange={updateSelection}
      selectedCardIds={selectedCardIds}
    />
  );
}
