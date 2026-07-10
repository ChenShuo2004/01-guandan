import type { GameHistoryEntry } from "@/lib/guandan/gameState";
import { createDeck } from "@/lib/guandan/deck";
import { getCardLabel } from "@/lib/guandan/card";

export interface MemoryPlayedEvent {
  round: number;
  player: string;
  cards: string[];
  type: string;
}

export interface CardTrackerSnapshot {
  appeared: Record<string, number>;
  remaining: Record<string, number>;
  jokerAppeared: number;
  events: MemoryPlayedEvent[];
}

export class CardTracker {
  private readonly total: Record<string, number>;

  constructor() {
    this.total = createDeck().reduce<Record<string, number>>((counts, card) => {
      const label = getCardLabel(card);
      counts[label] = (counts[label] ?? 0) + 1;
      return counts;
    }, {});
  }

  snapshot(history: GameHistoryEntry[]): CardTrackerSnapshot {
    const appeared = history.reduce<Record<string, number>>((counts, entry) => {
      if (entry.action !== "play") return counts;
      entry.cards.forEach((card) => {
        const label = getCardLabel(card);
        counts[label] = (counts[label] ?? 0) + 1;
      });
      return counts;
    }, {});

    const remaining = Object.entries(this.total).reduce<Record<string, number>>((counts, [label, total]) => {
      counts[label] = Math.max(0, total - (appeared[label] ?? 0));
      return counts;
    }, {});

    return {
      appeared,
      remaining,
      jokerAppeared: (appeared.SJ ?? 0) + (appeared.BJ ?? 0),
      events: history.map((entry) => ({
        round: entry.turn,
        player: entry.playerId,
        cards: entry.cards.map(getCardLabel),
        type: entry.result
      }))
    };
  }
}
