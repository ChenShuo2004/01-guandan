import type { CoachAction } from "./coach";
import type { PokerCardData } from "./poker";
import type { Quiz } from "./quiz";

export type LessonLevel = "beginner" | "intermediate" | "advanced";

export type LessonCategory =
  | "rules"
  | "cards"
  | "power"
  | "bomb"
  | "attack"
  | "assist"
  | "mindset";

export type LessonStep =
  | {
      type: "coach";
      text: string;
      action: CoachAction;
    }
  | {
      type: "image";
      assetId: string;
      caption: string;
    }
  | {
      type: "poker-case";
      title: string;
      cards: PokerCardData[];
      note: string;
    }
  | {
      type: "comparison";
      wrongLabel: string;
      wrongText: string;
      correctLabel: string;
      correctText: string;
    }
  | {
      type: "quiz";
      quizId: string;
    };

export interface Lesson {
  id: string;
  title: string;
  category: LessonCategory;
  level: LessonLevel;
  pathId: string;
  coverAssetId: string;
  slogan: string;
  duration: number;
  experience: number;
  tags: string[];
  steps: LessonStep[];
  quiz?: Quiz;
}
