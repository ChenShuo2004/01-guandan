import type { PokerCardData } from "@/types/poker";
import { PokerCard } from "./PokerCard";

interface PokerHandProps {
  cards: PokerCardData[];
  compact?: boolean;
  selectedIds?: string[];
}

export function PokerHand({ cards, compact = false, selectedIds = [] }: PokerHandProps) {
  return (
    <div className="flex items-end overflow-x-auto pb-2">
      {cards.map((card, index) => (
        <div className={index === 0 ? "" : "-ml-3"} key={card.id}>
          <PokerCard
            card={card}
            compact={compact}
            selected={selectedIds.includes(card.id)}
          />
        </div>
      ))}
    </div>
  );
}
