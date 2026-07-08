export interface TrainingChallenge {
  id: string;
  title: string;
  mode: "decision" | "endgame";
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
}

export const trainingChallenges: TrainingChallenge[] = [
  {
    id: "decision-save-bomb",
    title: "关键决策：炸弹时机",
    mode: "decision",
    prompt: "你有一组炸弹，对手还有 8 张牌。上一手只是小对子，怎么处理？",
    options: ["立刻炸掉", "能用对子压就不用炸", "直接不出"],
    answer: "能用对子压就不用炸",
    explanation: "炸弹是残局控制资源。对手牌还多时，优先用低成本牌型维持牌权。"
  },
  {
    id: "endgame-block-single",
    title: "残局挑战：防止闯关",
    mode: "endgame",
    prompt: "下家只剩 3 张，你手里有大单和对子。现在要优先考虑什么？",
    options: ["出最小单牌", "出对方难接的牌型", "随便过渡"],
    answer: "出对方难接的牌型",
    explanation: "残局不是只看自己能出什么，而是要阻断危险玩家的出完路径。"
  }
];
