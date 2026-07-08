import type { CoachResponse } from "./coach";
import type { LessonLevel } from "./lesson";
import type { PokerCardData } from "./poker";
import type { QuizOption } from "./quiz";

export interface PracticePlayerState {
  id: string;
  name: string;
  position: "top" | "right" | "bottom" | "left";
  remainingCards: number;
  role: "me" | "partner" | "opponent";
}

export interface PlayedMove {
  playerId: string;
  label: string;
  cards: PokerCardData[];
}

export interface ReplayStep {
  id: string;
  title: string;
  cards: PokerCardData[];
  coachText: string;
}

export interface PracticeCase {
  id: string;
  title: string;
  level: LessonLevel;
  tags: string[];
  situation: string;
  players: PracticePlayerState[];
  myHand: PokerCardData[];
  history: PlayedMove[];
  options: QuizOption[];
  correctOptionId: string;
  coachFeedback: {
    correct: CoachResponse;
    wrong: CoachResponse;
  };
  replaySteps: ReplayStep[];
  experience: number;
}
