import { chooseNormalMove, type AILevel } from "@/lib/ai/strategy";
import type { Card } from "@/lib/guandan/card";
import type { GameEngineState } from "@/lib/guandan/gameState";
import type { GuandanPlayer } from "@/lib/guandan/player";

export interface AIAction {
  action: "play" | "pass";
  cards: Card[];
  reason: string;
}

export function getAIAction(player: GuandanPlayer, state: GameEngineState, level: AILevel = "normal"): AIAction {
  if (level !== "normal") {
    return {
      action: "pass",
      cards: [],
      reason: "Phase 2 仅实现 normal AI"
    };
  }

  const cards = chooseNormalMove(player.hand, state.lastPlayedCards, state.levelRank);

  if (cards.length === 0) {
    return {
      action: "pass",
      cards: [],
      reason: "没有合适牌型，选择不出"
    };
  }

  return {
    action: "play",
    cards,
    reason: "优先减少手牌，同时保留炸弹"
  };
}
