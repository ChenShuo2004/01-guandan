import type { UserState } from "./UserState";

export interface UserProgress extends UserState {
  completedLessonIds: string[];
  completedPracticeIds: string[];
  favoriteLessonIds: string[];
  favoritePracticeIds: string[];
  lastStudyDate?: string;
}
