import type { CoachFeedback } from "@/lib/coach/coachTypes";
import type { GameHistoryEntry } from "@/lib/guandan/gameState";
import { defaultSkillProfile, type PlayerSkillProfile, type SkillKey } from "@/lib/player/SkillProfile";

export interface GrowthInsight {
  type: "strength" | "weakness" | "focus";
  title: string;
  description: string;
  skill: SkillKey;
}

export interface GrowthAnalysis {
  profile: PlayerSkillProfile;
  insights: GrowthInsight[];
  nextFocus: SkillKey;
}

export function analyzeGrowth(
  history: GameHistoryEntry[] = [],
  feedback: CoachFeedback[] = []
): GrowthAnalysis {
  const bombWarnings = feedback.filter((item) => item.message.includes("炸弹")).length;
  const passes = history.filter((item) => item.playerId === "player" && item.action === "pass").length;

  const profile: PlayerSkillProfile = {
    ...defaultSkillProfile,
    skills: defaultSkillProfile.skills.map((skill) => {
      if (skill.key === "bombControl") return { ...skill, score: Math.max(45, skill.score - bombWarnings * 4) };
      if (skill.key === "strategy") return { ...skill, score: Math.max(45, skill.score - Math.max(0, passes - 3) * 2) };
      return skill;
    })
  };

  const weakest = [...profile.skills].sort((a, b) => a.score - b.score)[0];

  return {
    profile,
    insights: [
      {
        type: "strength",
        title: "牌型识别稳定",
        description: "能快速识别对子、三张、顺子和炸弹，是进入策略训练的基础。",
        skill: "cardPattern"
      },
      {
        type: "weakness",
        title: "残局限制不足",
        description: "对手进入冲刺阶段时，需要优先思考如何阻断牌路。",
        skill: "endgame"
      },
      {
        type: "focus",
        title: "下一步训练重点",
        description: "练习关键回合是否抢牌权，以及炸弹是否应该保留。",
        skill: weakest.key
      }
    ],
    nextFocus: weakest.key
  };
}
