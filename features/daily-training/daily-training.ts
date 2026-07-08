import { sevenDayTrainingPlan } from "@/content/daily-training";
import type {
  DailyTraining,
  DailyTrainingPlanItem,
  DailyTrainingRecommendation,
  DailyTrainingStatus
} from "@/types/DailyTraining";
import type { UserProgress } from "@/types/progress";

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function previousDateKey(date: Date) {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return toDateKey(previous);
}

function getTrainingStatus(
  training: DailyTrainingPlanItem,
  progress: UserProgress,
  todayTrainingId: string
): DailyTrainingStatus {
  const completedTrainingIds = progress.completedTrainingIds ?? [];

  if (completedTrainingIds.includes(training.id)) {
    return "completed";
  }

  if (training.id === todayTrainingId) {
    return "available";
  }

  return "locked";
}

function getFirstIncompleteTraining(progress: UserProgress) {
  const completedTrainingIds = progress.completedTrainingIds ?? [];

  return (
    sevenDayTrainingPlan.find(
      (training) => !completedTrainingIds.includes(training.id)
    ) ?? sevenDayTrainingPlan[sevenDayTrainingPlan.length - 1]
  );
}

export function getTrainingById(trainingId?: string) {
  if (!trainingId) {
    return undefined;
  }

  return sevenDayTrainingPlan.find((training) => training.id === trainingId);
}

export function getTrainingByLessonId(lessonId: string) {
  return sevenDayTrainingPlan.find((training) => training.lessonId === lessonId);
}

export function getPracticeIdForLesson(lessonId: string, progress: UserProgress) {
  const todayTraining = getTodayTraining(progress);

  if (todayTraining?.lessonId === lessonId) {
    return todayTraining.practiceId;
  }

  return getTrainingByLessonId(lessonId)?.practiceId;
}

export function getNextTrainingAfter(trainingId?: string) {
  const training = getTrainingById(trainingId);

  if (!training) {
    return sevenDayTrainingPlan[0];
  }

  return sevenDayTrainingPlan.find((item) => item.day === training.day + 1);
}

function resolveTodayTraining(progress: UserProgress, date = new Date()) {
  const todayKey = toDateKey(date);

  if (
    progress.todayTrainingId &&
    progress.isTodayCompleted &&
    progress.todayCompletedDate === todayKey
  ) {
    return (
      sevenDayTrainingPlan.find((training) => training.id === progress.todayTrainingId) ??
      getFirstIncompleteTraining(progress)
    );
  }

  return getFirstIncompleteTraining(progress);
}

export function getDailyTrainingPlan(
  progress: UserProgress,
  date = new Date()
): DailyTraining[] {
  const todayTraining = resolveTodayTraining(progress, date);
  const todayKey = toDateKey(date);

  return sevenDayTrainingPlan.map((training) => ({
    ...training,
    status: getTrainingStatus(training, progress, todayTraining.id),
    isToday: training.id === todayTraining.id,
    isCompletedToday:
      training.id === todayTraining.id &&
      progress.isTodayCompleted &&
      progress.todayCompletedDate === todayKey
  }));
}

export function getTodayTraining(progress: UserProgress, date = new Date()) {
  return getDailyTrainingPlan(progress, date).find((training) => training.isToday);
}

export function completeDailyTraining(
  progress: UserProgress,
  trainingId?: string,
  completedAt = new Date()
): UserProgress {
  const completedTrainingIds = progress.completedTrainingIds ?? [];
  const completedLessonIds = progress.completedLessonIds ?? [];
  const completedPracticeIds = progress.completedPracticeIds ?? [];
  const favoriteLessonIds = progress.favoriteLessonIds ?? [];
  const favoritePracticeIds = progress.favoritePracticeIds ?? [];
  const weakAbilities = progress.weakAbilities ?? [];
  const training =
    (trainingId
      ? sevenDayTrainingPlan.find((item) => item.id === trainingId)
      : getTodayTraining(progress, completedAt)) ?? getFirstIncompleteTraining(progress);

  const alreadyCompleted = completedTrainingIds.includes(training.id);
  const completedDateKey = toDateKey(completedAt);
  const lastStudyDateKey = progress.lastStudyDate
    ? toDateKey(new Date(progress.lastStudyDate))
    : undefined;
  const nextExperience = alreadyCompleted
    ? progress.experience
    : progress.experience + training.rewardExperience;
  const nextStreakDays =
    lastStudyDateKey === completedDateKey
      ? Math.max(1, progress.streakDays)
      : lastStudyDateKey === previousDateKey(completedAt)
        ? progress.streakDays + 1
        : 1;

  return {
    ...progress,
    experience: nextExperience,
    level: Math.max(1, Math.floor(nextExperience / 100) + 1),
    completedLessonIds: unique([...completedLessonIds, training.lessonId]),
    completedPracticeIds: unique([...completedPracticeIds, training.practiceId]),
    completedTrainingIds: unique([...completedTrainingIds, training.id]),
    todayTrainingId: training.id,
    isTodayCompleted: true,
    todayCompletedDate: completedDateKey,
    streakDays: nextStreakDays,
    lastStudyDate: completedAt.toISOString(),
    recentLearning: {
      trainingId: training.id,
      lessonId: training.lessonId,
      practiceId: training.practiceId,
      title: training.theme,
      completedAt: completedAt.toISOString()
    },
    weakAbilities: weakAbilities.filter((ability) => ability !== training.ability),
    favorites: {
      lessonIds: favoriteLessonIds,
      practiceIds: favoritePracticeIds
    }
  };
}

export function getNextRecommendation(
  progress: UserProgress,
  date = new Date()
): DailyTrainingRecommendation {
  const todayTraining = getTodayTraining(progress, date);
  const completedTrainingIds = progress.completedTrainingIds ?? [];
  const wrongPracticeIds = progress.wrongPracticeIds ?? [];

  if (wrongPracticeIds.length > 0) {
    return {
      type: "review-wrong-practice",
      title: "先复盘一道错题",
      description: "把昨天的判断补上，今天会更稳。",
      practiceId: wrongPracticeIds[0]
    };
  }

  if (todayTraining && todayTraining.status !== "completed") {
    return {
      type: "start-today",
      title: `开始 Day ${todayTraining.day}`,
      description: todayTraining.coachTip,
      trainingId: todayTraining.id,
      lessonId: todayTraining.lessonId,
      practiceId: todayTraining.practiceId
    };
  }

  const nextTraining = getFirstIncompleteTraining(progress);

  if (!completedTrainingIds.includes(nextTraining.id)) {
    return {
      type: "continue-path",
      title: `下一步：${nextTraining.theme}`,
      description: nextTraining.coachTip,
      trainingId: nextTraining.id,
      lessonId: nextTraining.lessonId,
      practiceId: nextTraining.practiceId
    };
  }

  return {
    type: "all-complete",
    title: "7 天训练已完成",
    description: "下一步可以进入错题复盘和专题训练。"
  };
}
