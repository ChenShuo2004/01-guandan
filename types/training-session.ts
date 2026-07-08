export interface TrainingSession {
  id: string;
  title: string;
  description: string;
  scenario: string;
  playerCards: string[];
  opponentAction: string;
  correctAction: string;
  explanation: string;
  ability: string;
}

export type TrainingFeedbackLevel = "correct" | "normal" | "wrong";

export interface TrainingFeedback {
  level: TrainingFeedbackLevel;
  title: string;
  message: string;
  reason: string;
  suggestion: string;
}

export interface TrainingProgress {
  completed: number;
  abilities: Record<string, number>;
  mistakes: Record<string, number>;
}
