import type { SkillKey } from "@/lib/player/SkillProfile";

export interface PlayerTendency {
  id: string;
  label: string;
  description: string;
  relatedSkill: SkillKey;
  confidence: number;
}

export interface CoachMemoryNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface PlayerModel {
  playerId: string;
  tendencies: PlayerTendency[];
  coachMemory: CoachMemoryNote[];
  preferredDifficulty: "easy" | "normal" | "hard";
}

export const defaultPlayerModel: PlayerModel = {
  playerId: "local-kai",
  preferredDifficulty: "normal",
  tendencies: [
    {
      id: "early-bomb",
      label: "中局容易提前交炸弹",
      description: "遇到可压牌时倾向直接抢牌权，需要训练炸弹保留价值。",
      relatedSkill: "bombControl",
      confidence: 0.74
    },
    {
      id: "team-pass",
      label: "队友领先时配合不错",
      description: "能主动让出牌路，但还需要识别对手冲刺风险。",
      relatedSkill: "teamwork",
      confidence: 0.68
    }
  ],
  coachMemory: [
    {
      id: "memo-1",
      title: "最近重点",
      content: "先练中后局牌权判断，尤其是对手剩 5 张以内时的限制打法。",
      createdAt: "2026-07-08"
    },
    {
      id: "memo-2",
      title: "稳定优势",
      content: "牌型识别速度已经够用，下一步从“能不能出”升级到“值不值得出”。",
      createdAt: "2026-07-08"
    }
  ]
};
