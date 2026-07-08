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
  streakDays: 0,
  completedTrainingIds: [],
  isTodayCompleted: false,
  favorites: {
    lessonIds: [],
    practiceIds: []
  },
  weakAbilities: []
};

export function mergeProgress(
  progress: UserProgress,
  patch: Partial<UserProgress>
): UserProgress {
  const favoriteLessonIds =
    patch.favoriteLessonIds ?? progress.favoriteLessonIds ?? defaultProgress.favoriteLessonIds;
  const favoritePracticeIds =
    patch.favoritePracticeIds ??
    progress.favoritePracticeIds ??
    defaultProgress.favoritePracticeIds;
  const favorites = {
    ...(progress.favorites ?? defaultProgress.favorites),
    ...(patch.favorites ?? {})
  };

  return {
    ...defaultProgress,
    ...progress,
    ...patch,
    favoriteLessonIds,
    favoritePracticeIds,
    favorites: {
      ...favorites,
      lessonIds: patch.favoriteLessonIds ?? favorites.lessonIds ?? favoriteLessonIds,
      practiceIds: patch.favoritePracticeIds ?? favorites.practiceIds ?? favoritePracticeIds
    }
  };
}
