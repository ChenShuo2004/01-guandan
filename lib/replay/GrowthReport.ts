import type { CoachFeedback } from "@/lib/coach/coachTypes";
import type { GameHistoryEntry } from "@/lib/guandan/gameState";

export interface GrowthReport {
  score: number;
  summary: string;
  advantages: string[];
  issues: string[];
  nextTraining: string;
}

export function createGrowthReport(history: GameHistoryEntry[], feedback: CoachFeedback[]): GrowthReport {
  const mistakes = feedback.filter((item) => item.type === "mistake");
  const plays = history.filter((item) => item.playerId === "player" && item.action === "play");
  const score = Math.max(45, Math.min(95, 80 - mistakes.length * 5 + Math.min(plays.length, 5)));

  return {
    score,
    summary: mistakes.length > 0 ? "本局有明确可优化的关键手。" : "本局节奏较稳，可以进入更高难度训练。",
    advantages: ["能保持基础出牌节奏", "牌型识别没有明显卡顿"],
    issues: mistakes.map((item) => item.message).slice(0, 2),
    nextTraining: mistakes.some((item) => item.message.includes("炸弹")) ? "炸弹控制" : "残局控制"
  };
}
