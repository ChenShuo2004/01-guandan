import type { Card } from "@/lib/guandan/card";

export type CoachFeedbackType = "tip" | "mistake" | "praise" | "replay";
export type CoachFeedbackLevel = "low" | "medium" | "high";

export type AIHintType = "warning" | "suggestion" | "analysis" | "encourage";
export type AIHintTrigger = "game_start" | "before_play" | "after_play" | "game_end";
export type AIAnalysisStatus = "idle" | "planning" | "watching" | "thinking" | "warning" | "reviewing";

export interface AIHint {
  id: string;
  type: AIHintType;
  trigger: AIHintTrigger;
  title: string;
  content: string;
  reason: string;
  action?: string;
  priority: "low" | "medium" | "high";
  recommendedCards?: Card[];
  createdAt: number;
}

export interface TrainingPlan {
  goal: string;
  focusProblems: string[];
  recommendedContent: string[];
  estimatedMinutes: number;
}

export interface TrainingReview {
  summary: string;
  correctMoves: string[];
  mistakes: string[];
  improvements: string[];
  nextPlan: string[];
  score: number;
}

export interface CoachKnowledgeQuery {
  topic: "rules" | "technique" | "mistake_case";
  tags: string[];
}

export interface CoachKnowledgeSource {
  search(query: CoachKnowledgeQuery): Promise<string[]>;
}

export interface CoachFeedback {
  type: CoachFeedbackType;
  level: CoachFeedbackLevel;
  message: string;
  reason: string;
  suggestion: string;
  recommendedCards?: Card[];
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  nextTraining?: string;
  hint?: AIHint;
  review?: TrainingReview;
}
