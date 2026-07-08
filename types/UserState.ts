import type { DailyTrainingAbility } from "./DailyTraining";

export interface RecentLearningContent {
  trainingId?: string;
  lessonId?: string;
  practiceId?: string;
  title: string;
  completedAt: string;
}

export interface FavoriteList {
  lessonIds: string[];
  practiceIds: string[];
}

export interface UserState {
  level: number;
  experience: number;
  streakDays: number;
  completedTrainingIds: string[];
  todayTrainingId?: string;
  isTodayCompleted: boolean;
  todayCompletedDate?: string;
  recentLearning?: RecentLearningContent;
  wrongPracticeIds: string[];
  favorites: FavoriteList;
  weakAbilities: DailyTrainingAbility[];
}
