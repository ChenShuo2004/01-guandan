import type { PlayerSkillProfile, SkillKey } from "@/lib/player/SkillProfile";

export function getAdaptiveDifficulty(profile: PlayerSkillProfile, skillKey: SkillKey) {
  const skill = profile.skills.find((item) => item.key === skillKey);
  const score = skill?.score ?? 60;

  if (score >= 82) return "hard";
  if (score <= 55) return "easy";
  return "normal";
}

export function getDifficultyLabel(difficulty: string) {
  const labels: Record<string, string> = {
    easy: "基础巩固",
    normal: "标准训练",
    hard: "进阶挑战"
  };

  return labels[difficulty] ?? "标准训练";
}
