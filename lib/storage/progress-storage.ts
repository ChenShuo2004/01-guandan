import type { UserProgress } from "@/types/progress";

export const progressStorageKey = "guandan-ai-coach-progress";

export const defaultProgress: UserProgress = {
  level: 1,
  experience: 0,
  completedLessonIds: [],
  completedPracticeIds: [],
  favoriteLessonIds: [],
  favoritePracticeIds: [],
  wrongPracticeIds: [],
  streakDays: 0
};

export function mergeProgress(
  progress: UserProgress,
  patch: Partial<UserProgress>
): UserProgress {
  return {
    ...progress,
    ...patch
  };
}
