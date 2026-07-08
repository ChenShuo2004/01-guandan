import { getCardLabel } from "@/lib/guandan/card";
import { detectCardPattern } from "@/lib/guandan/cardRule";
import type { GameEngineState } from "@/lib/guandan/gameState";
import type { CoachFeedback } from "@/lib/coach/coachTypes";
import { recommendDecision } from "@/lib/coach/DecisionEngine";
import { detectContextualWarning } from "@/lib/coach/MistakeDetector";
import { generateGameReview } from "@/training/replay";

export interface CoachAnalyzerInput {
  state: GameEngineState;
}

export function analyzeCoachTip({ state }: CoachAnalyzerInput): CoachFeedback {
  const currentPlayer = state.players[state.currentTurn];
  const user = state.players.find((player) => player.id === "player");
  const selectedPattern = detectCardPattern(state.selectedCards);

  if (state.gameStatus === "finished") {
    return generateGameReview(state);
  }

  const warning = detectContextualWarning(state);
  if (warning && currentPlayer?.id === "player") return warning;

  if (currentPlayer?.id !== "player") {
    return {
      type: "tip",
      level: "low",
      message: `${currentPlayer?.role ?? "AI"} 思考中`,
      reason: "观察它是否主动出炸弹或保留牌权。",
      suggestion: "记住它跳过了哪些牌型，后面可以反推手牌结构。"
    };
  }

  if (state.selectedCards.length > 0 && selectedPattern.valid) {
    return {
      type: "tip",
      level: "low",
      message: `当前选择是 ${formatPattern(selectedPattern.type)}`,
      reason: "先确认它是否能压过上一手，再看是否破坏自己的牌型。",
      suggestion: "如果会拆掉炸弹、顺子或对子，先考虑更小成本的打法。"
    };
  }

  if ((user?.hand.length ?? 0) <= 6) {
    return {
      type: "tip",
      level: "medium",
      message: "进入残局收尾",
      reason: "手牌少时，牌权比单张大小更重要。",
      suggestion: "优先让牌型成组，别轻易拆炸弹。"
    };
  }

  return {
    type: "tip",
    level: "low",
    message: "先处理散牌",
    reason: "开中局阶段不要急着交控制资源。",
    suggestion: "保留炸弹和关键对子，先用低成本牌型试探。"
  };
}

export function analyzeHint(state: GameEngineState): CoachFeedback {
  const user = state.players.find((player) => player.id === "player");

  if (!user) {
    return {
      type: "tip",
      level: "low",
      message: "未找到玩家手牌",
      reason: "当前状态不完整。",
      suggestion: "请重新开局。"
    };
  }

  const decision = recommendDecision({ playerHand: user.hand, state });

  if (decision.recommendedCards && decision.recommendedCards.length > 0) {
    const labels = decision.recommendedCards.map(getCardLabel).join(" ");
    return {
      ...decision,
      message: `建议出：${labels}`
    };
  }

  return decision;
}

function formatPattern(type: string) {
  const labels: Record<string, string> = {
    single: "单牌",
    pair: "对子",
    triple: "三张",
    tripleWithPair: "三带二",
    straight: "顺子",
    bomb: "炸弹",
    fourJokers: "四王"
  };

  return labels[type] ?? type;
}
