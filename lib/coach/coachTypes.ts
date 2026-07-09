import type { Card } from "@/lib/guandan/card";

export type CoachFeedbackType = "tip" | "mistake" | "praise" | "replay";

export type CoachFeedbackLevel = "low" | "medium" | "high";

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
}
