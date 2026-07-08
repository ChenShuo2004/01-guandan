import type { DailyTrainingPlanItem } from "@/types/DailyTraining";

export const sevenDayTrainingPlan: DailyTrainingPlanItem[] = [
  {
    id: "daily-day-1",
    day: 1,
    theme: "什么时候该炸",
    title: "炸弹不是用来爽的",
    lessonId: "when-to-bomb",
    practiceId: "practice-when-to-bomb-001",
    rewardExperience: 20,
    ability: "bomb-timing",
    coachTip: "先判断牌权，再决定要不要炸。"
  },
  {
    id: "daily-day-2",
    day: 2,
    theme: "什么时候不能炸",
    title: "能忍住，才是高手",
    lessonId: "when-not-to-bomb",
    practiceId: "practice-when-not-to-bomb-001",
    rewardExperience: 20,
    ability: "bomb-restraint",
    coachTip: "炸弹要换局势，不是换情绪。"
  },
  {
    id: "daily-day-3",
    day: 3,
    theme: "队友配合",
    title: "先看队友能不能走",
    lessonId: "partner-support-basics",
    practiceId: "practice-partner-support-001",
    rewardExperience: 20,
    ability: "partner-support",
    coachTip: "队友快走时，你的牌要变成路。"
  },
  {
    id: "daily-day-4",
    day: 4,
    theme: "防守拦截",
    title: "对手快走，先拦住",
    lessonId: "defense-blocking-basics",
    practiceId: "practice-defense-blocking-001",
    rewardExperience: 20,
    ability: "defense-blocking",
    coachTip: "对手只剩关键张，不能放他舒服出。"
  },
  {
    id: "daily-day-5",
    day: 5,
    theme: "散牌处理",
    title: "散牌要早点找出口",
    lessonId: "loose-hand-management",
    practiceId: "practice-loose-hand-management-001",
    rewardExperience: 20,
    ability: "loose-hand-management",
    coachTip: "别等到最后才发现小牌走不掉。"
  },
  {
    id: "daily-day-6",
    day: 6,
    theme: "大牌取舍",
    title: "大牌不是一定要留",
    lessonId: "high-card-decision",
    practiceId: "practice-high-card-decision-001",
    rewardExperience: 20,
    ability: "high-card-decision",
    coachTip: "大牌要服务节奏，不是只留到最后。"
  },
  {
    id: "daily-day-7",
    day: 7,
    theme: "整局复盘",
    title: "看懂一局怎么输赢",
    lessonId: "full-game-review",
    practiceId: "practice-full-game-review-001",
    rewardExperience: 30,
    ability: "full-game-review",
    coachTip: "复盘不是找错，是找到下一局的判断。"
  }
];
