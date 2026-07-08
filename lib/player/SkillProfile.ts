export type SkillKey =
  | "cardPattern"
  | "cardMemory"
  | "strategy"
  | "endgame"
  | "teamwork"
  | "bombControl";

export interface SkillProfileItem {
  key: SkillKey;
  label: string;
  score: number;
  trend: "up" | "flat" | "down";
}

export interface PlayerSkillProfile {
  playerId: string;
  nickname: string;
  level: string;
  levelIndex: number;
  totalScore: number;
  winRate: number;
  completedTrainings: number;
  streakDays: number;
  skills: SkillProfileItem[];
}

export const defaultSkillProfile: PlayerSkillProfile = {
  playerId: "local-kai",
  nickname: "KAI",
  level: "白银 I",
  levelIndex: 2,
  totalScore: 2840,
  winRate: 58,
  completedTrainings: 12,
  streakDays: 3,
  skills: [
    { key: "cardPattern", label: "牌型理解", score: 78, trend: "up" },
    { key: "cardMemory", label: "记牌能力", score: 52, trend: "flat" },
    { key: "strategy", label: "策略能力", score: 66, trend: "up" },
    { key: "endgame", label: "残局能力", score: 61, trend: "down" },
    { key: "teamwork", label: "团队意识", score: 72, trend: "up" },
    { key: "bombControl", label: "炸弹控制", score: 69, trend: "flat" }
  ]
};

export function getProfileAverage(profile: PlayerSkillProfile) {
  const total = profile.skills.reduce((sum, skill) => sum + skill.score, 0);
  return Math.round(total / profile.skills.length);
}
