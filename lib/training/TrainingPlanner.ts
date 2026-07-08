import { getAdaptiveDifficulty, getDifficultyLabel } from "@/lib/training/DifficultyAdjuster";
import type { PlayerSkillProfile } from "@/lib/player/SkillProfile";
import { trainingTasks, type TrainingTask } from "@/lib/training/TrainingTask";

export interface TrainingPlan {
  title: string;
  difficultyLabel: string;
  focusReason: string;
  tasks: TrainingTask[];
}

export function buildTrainingPlan(profile: PlayerSkillProfile): TrainingPlan {
  const weakestSkill = [...profile.skills].sort((a, b) => a.score - b.score)[0];
  const difficulty = getAdaptiveDifficulty(profile, weakestSkill.key);
  const tasks = trainingTasks
    .filter((task) => task.targetSkill === weakestSkill.key || task.status === "ready")
    .slice(0, 3);

  return {
    title: `今日重点：${weakestSkill.label}`,
    difficultyLabel: getDifficultyLabel(difficulty),
    focusReason: `${weakestSkill.label} 当前 ${weakestSkill.score} 分，最适合作为下一轮提升点。`,
    tasks
  };
}
