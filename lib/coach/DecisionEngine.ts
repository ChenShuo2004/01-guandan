import { chooseNormalMove, generateMoveCandidates } from "@/lib/ai/strategy";
import { getCardLabel, type Card } from "@/lib/guandan/card";
import { canBeatLastPlay } from "@/lib/guandan/cardCompare";
import { detectCardPattern } from "@/lib/guandan/cardRule";
import type { GameEngineState } from "@/lib/guandan/gameState";
import type { CoachFeedback } from "@/lib/coach/coachTypes";

export interface DecisionInput {
  playerHand: Card[];
  state: GameEngineState;
}

export function recommendDecision({ playerHand, state }: DecisionInput): CoachFeedback {
  const recommendedCards = chooseNormalMove(playerHand, state.lastPlayedCards);
  const pattern = detectCardPattern(recommendedCards);

  if (recommendedCards.length === 0 || !pattern.valid) {
    return {
      type: "tip",
      level: "low",
      message: "这手可以先不出",
      reason: "当前没有低成本牌型能压过上一手。",
      suggestion: "保留大牌和炸弹，等重新获得牌权。",
      recommendedCards: []
    };
  }

  const compare = canBeatLastPlay(recommendedCards, state.lastPlayedCards);
  const label = recommendedCards.map(getCardLabel).join(" ");

  return {
    type: "tip",
    level: pattern.type === "bomb" || pattern.type === "fourJokers" ? "medium" : "low",
    message: `推荐出 ${label}`,
    reason: compare.reason,
    suggestion: buildSuggestion(pattern.type),
    recommendedCards
  };
}

export function findBetterDecision(state: GameEngineState, playedCards: Card[]) {
  const player = state.players.find((item) => item.id === "player");
  if (!player) return null;

  const candidates = generateMoveCandidates([...player.hand, ...playedCards], state.lastPlayedCards)
    .filter((candidate) => candidate.length > playedCards.length)
    .filter((candidate) => {
      const pattern = detectCardPattern(candidate);
      return pattern.valid && pattern.type !== "bomb" && pattern.type !== "fourJokers";
    });

  return candidates[0] ?? null;
}

function buildSuggestion(patternType: string) {
  if (patternType === "bomb" || patternType === "fourJokers") {
    return "只有在抢关键牌权或进入收尾时才建议炸。";
  }

  if (patternType === "tripleWithPair" || patternType === "straight") {
    return "优先减少手数，同时保留炸弹作为控制牌。";
  }

  return "先用低成本牌型过渡，不要过早交出控制资源。";
}
