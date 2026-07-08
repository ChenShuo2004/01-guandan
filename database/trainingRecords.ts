import type { CoachFeedback } from "@/lib/coach/coachTypes";
import type { Card } from "@/lib/guandan/card";
import type { PlayerId } from "@/lib/guandan/player";
import type { SkillKey } from "@/lib/player/SkillProfile";

export interface UserProfileRecord {
  id: string;
  nickname: string;
  level: string;
  totalScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameHistoryRecord {
  id: string;
  gameId: string;
  turn: number;
  playerId: PlayerId;
  action: "play" | "pass";
  cards: Card[];
  createdAt: string;
}

export interface MistakeRecord {
  id: string;
  gameId: string;
  turn: number;
  skill: SkillKey;
  feedback: CoachFeedback;
  createdAt: string;
}

export interface TrainingRecord {
  id: string;
  userId: string;
  taskId: string;
  skill: SkillKey;
  score: number;
  completedAt: string;
}

export interface CoachMemoryRecord {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
}
