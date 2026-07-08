import type { CoachResponse } from "./coach";

export interface QuizOption {
  id: string;
  label: string;
  text: string;
}

export interface Quiz {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  coachFeedback: {
    correct: CoachResponse;
    wrong: CoachResponse;
  };
}
