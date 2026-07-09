import type { CoachFeedback } from "@/lib/coach/coachTypes";
import { generateTrainingReview, getRealtimeHint } from "@/lib/coach/TrainingCoachEngine";
import type { GameEngineState } from "@/lib/guandan/gameState";

export function generateGameReview(state: GameEngineState): CoachFeedback {
  const review = generateTrainingReview(state);

  return {
    type: "replay",
    level: review.score >= 85 ? "low" : "medium",
    message: `本局评分 ${review.score} 分`,
    reason: review.summary,
    suggestion: review.nextPlan[0] ?? "下一局继续练关键牌权判断。",
    score: review.score,
    strengths: review.correctMoves,
    weaknesses: review.mistakes,
    nextTraining: review.nextPlan[0],
    hint: getRealtimeHint(state, "game_end") ?? undefined,
    review
  };
}
