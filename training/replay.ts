import type { CoachFeedback } from "@/lib/coach/coachTypes";
import { detectCardPattern } from "@/lib/guandan/cardRule";
import type { GameEngineState } from "@/lib/guandan/gameState";

export function generateGameReview(state: GameEngineState): CoachFeedback {
  const userHistory = state.history.filter((entry) => entry.playerId === "player");
  const bombCount = userHistory.filter((entry) => {
    const pattern = detectCardPattern(entry.cards);
    return pattern.type === "bomb" || pattern.type === "fourJokers";
  }).length;
  const passCount = userHistory.filter((entry) => entry.action === "pass").length;
  const won = state.winner === "player";
  const score = Math.max(45, Math.min(95, 72 + (won ? 12 : -4) - bombCount * 2));

  return {
    type: "replay",
    level: won ? "low" : "medium",
    message: `本局评分 ${score} 分`,
    reason: won ? "你率先出完，牌权节奏整体不错。" : "这局没有率先走完，需要复盘中后段牌权。",
    suggestion: won ? "下一步练残局控制，减少无效等待。" : "下一步练关键决策：何时抢牌权，何时保留炸弹。",
    score,
    strengths: [
      bombCount <= 1 ? "炸弹保存比较克制" : "敢于用炸弹抢牌权",
      passCount <= 3 ? "主动出牌意识较强" : "能在不利牌型时选择等待"
    ],
    weaknesses: [
      bombCount >= 2 ? "中期炸弹使用偏多" : "中局压制效率还可以提升",
      won ? "继续练习稳定收尾" : "关键牌权容易被对手拿走"
    ],
    nextTraining: won ? "残局控制" : "关键决策训练"
  };
}
