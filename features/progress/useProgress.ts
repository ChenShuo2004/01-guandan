"use client";

import { useMemo } from "react";
import { completeDailyTraining as completeDailyTrainingProgress } from "@/features/daily-training";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  defaultProgress,
  mergeProgress,
  progressStorageKey
} from "@/lib/storage/progress-storage";
import type { UserProgress } from "@/types/progress";

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function useProgress() {
  const [progress, setProgress, isReady] = useLocalStorage<UserProgress>(
    progressStorageKey,
    defaultProgress
  );
  const normalizedProgress = mergeProgress(progress, {});

  const actions = useMemo(
    () => ({
      completeLesson(lessonId: string, experience: number) {
        setProgress((current) => {
          const currentProgress = mergeProgress(current, {});
          const alreadyCompleted = currentProgress.completedLessonIds.includes(lessonId);
          const nextExperience = alreadyCompleted
            ? currentProgress.experience
            : currentProgress.experience + experience;

          return mergeProgress(currentProgress, {
            experience: nextExperience,
            level: Math.max(1, Math.floor(nextExperience / 100) + 1),
            completedLessonIds: unique([
              ...currentProgress.completedLessonIds,
              lessonId
            ]),
            streakDays: Math.max(1, currentProgress.streakDays),
            lastStudyDate: new Date().toISOString()
          });
        });
      },
      completePractice(practiceId: string, experience: number, isCorrect: boolean) {
        setProgress((current) => {
          const currentProgress = mergeProgress(current, {});
          const alreadyCompleted =
            currentProgress.completedPracticeIds.includes(practiceId);
          const nextExperience = alreadyCompleted
            ? currentProgress.experience
            : currentProgress.experience + experience;

          return mergeProgress(currentProgress, {
            experience: nextExperience,
            level: Math.max(1, Math.floor(nextExperience / 100) + 1),
            completedPracticeIds: unique([
              ...currentProgress.completedPracticeIds,
              practiceId
            ]),
            wrongPracticeIds: isCorrect
              ? currentProgress.wrongPracticeIds.filter((id) => id !== practiceId)
              : unique([...currentProgress.wrongPracticeIds, practiceId]),
            streakDays: Math.max(1, currentProgress.streakDays),
            lastStudyDate: new Date().toISOString()
          });
        });
      },
      toggleFavoriteLesson(lessonId: string) {
        setProgress((current) => {
          const currentProgress = mergeProgress(current, {});
          const exists = currentProgress.favoriteLessonIds.includes(lessonId);
          return mergeProgress(currentProgress, {
            favoriteLessonIds: exists
              ? currentProgress.favoriteLessonIds.filter((id) => id !== lessonId)
              : [...currentProgress.favoriteLessonIds, lessonId]
          });
        });
      },
      completeDailyTraining(trainingId?: string) {
        setProgress((current) => {
          const normalizedProgress = mergeProgress(current, {});
          return mergeProgress(
            completeDailyTrainingProgress(normalizedProgress, trainingId),
            {}
          );
        });
      }
    }),
    [setProgress]
  );

  return { progress: normalizedProgress, isReady, ...actions };
}
