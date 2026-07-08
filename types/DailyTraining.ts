export type DailyTrainingAbility =
  | "bomb-timing"
  | "bomb-restraint"
  | "partner-support"
  | "defense-blocking"
  | "loose-hand-management"
  | "high-card-decision"
  | "full-game-review";

export type DailyTrainingStatus = "locked" | "available" | "completed";

export interface DailyTrainingPlanItem {
  id: string;
  day: number;
  theme: string;
  title: string;
  lessonId: string;
  practiceId: string;
  rewardExperience: number;
  ability: DailyTrainingAbility;
  coachTip: string;
}

export interface DailyTraining extends DailyTrainingPlanItem {
  status: DailyTrainingStatus;
  isToday: boolean;
  isCompletedToday: boolean;
}

export interface DailyTrainingRecommendation {
  type: "start-today" | "review-wrong-practice" | "continue-path" | "all-complete";
  title: string;
  description: string;
  trainingId?: string;
  lessonId?: string;
  practiceId?: string;
}
