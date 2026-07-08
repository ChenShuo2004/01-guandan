export interface UserProgress {
  level: number;
  experience: number;
  completedLessonIds: string[];
  completedPracticeIds: string[];
  favoriteLessonIds: string[];
  favoritePracticeIds: string[];
  wrongPracticeIds: string[];
  streakDays: number;
  lastStudyDate?: string;
}
