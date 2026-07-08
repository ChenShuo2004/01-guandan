"use client";

import { useMemo } from "react";
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

  const actions = useMemo(
    () => ({
      completeLesson(lessonId: string, experience: number) {
        setProgress((current) => {
          const alreadyCompleted = current.completedLessonIds.includes(lessonId);
          const nextExperience = alreadyCompleted
            ? current.experience
            : current.experience + experience;

          return mergeProgress(current, {
            experience: nextExperience,
            level: Math.max(1, Math.floor(nextExperience / 100) + 1),
            completedLessonIds: unique([...current.completedLessonIds, lessonId]),
            streakDays: Math.max(1, current.streakDays),
            lastStudyDate: new Date().toISOString()
          });
        });
      },
      completePractice(practiceId: string, experience: number, isCorrect: boolean) {
        setProgress((current) => {
          const alreadyCompleted = current.completedPracticeIds.includes(practiceId);
          const nextExperience = alreadyCompleted
            ? current.experience
            : current.experience + experience;

          return mergeProgress(current, {
            experience: nextExperience,
            level: Math.max(1, Math.floor(nextExperience / 100) + 1),
            completedPracticeIds: unique([...current.completedPracticeIds, practiceId]),
            wrongPracticeIds: isCorrect
              ? current.wrongPracticeIds.filter((id) => id !== practiceId)
              : unique([...current.wrongPracticeIds, practiceId]),
            streakDays: Math.max(1, current.streakDays),
            lastStudyDate: new Date().toISOString()
          });
        });
      },
      toggleFavoriteLesson(lessonId: string) {
        setProgress((current) => {
          const exists = current.favoriteLessonIds.includes(lessonId);
          return mergeProgress(current, {
            favoriteLessonIds: exists
              ? current.favoriteLessonIds.filter((id) => id !== lessonId)
              : [...current.favoriteLessonIds, lessonId]
          });
        });
      }
    }),
    [setProgress]
  );

  return { progress, isReady, ...actions };
}
