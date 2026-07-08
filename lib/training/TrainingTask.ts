import type { SkillKey } from "@/lib/player/SkillProfile";

export type TrainingTaskType = "ai_sparring" | "decision" | "endgame" | "memory";

export interface TrainingTask {
  id: string;
  type: TrainingTaskType;
  title: string;
  description: string;
  targetSkill: SkillKey;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedMinutes: number;
  status: "locked" | "ready" | "done";
}

export const trainingTasks: TrainingTask[] = [
  {
    id: "decision-bomb-001",
    type: "decision",
    title: "中局炸弹是否要交",
    description: "判断当前是否值得用炸弹抢牌权。",
    targetSkill: "bombControl",
    difficulty: 2,
    estimatedMinutes: 4,
    status: "ready"
  },
  {
    id: "endgame-block-001",
    type: "endgame",
    title: "限制剩 3 张对手",
    description: "对手进入冲刺阶段，选择更安全的牌路。",
    targetSkill: "endgame",
    difficulty: 3,
    estimatedMinutes: 5,
    status: "ready"
  },
  {
    id: "team-assist-001",
    type: "ai_sparring",
    title: "队友领先时助攻",
    description: "练习给队友创造牌权，而不是只清自己的手牌。",
    targetSkill: "teamwork",
    difficulty: 2,
    estimatedMinutes: 6,
    status: "ready"
  },
  {
    id: "memory-rank-001",
    type: "memory",
    title: "大牌与炸弹记忆",
    description: "记录关键大牌和炸弹出现情况。",
    targetSkill: "cardMemory",
    difficulty: 1,
    estimatedMinutes: 3,
    status: "ready"
  }
];
