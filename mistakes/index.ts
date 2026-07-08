export const mistakeRules = [
  {
    id: "early-bomb",
    title: "提前使用炸弹",
    condition: "bombUsed && opponentCards > 5",
    feedback: "炸弹使用时机过早",
    trainingValue: "帮助用户理解炸弹是控制资源，不只是压牌工具。"
  },
  {
    id: "ignore-danger-player",
    title: "没有处理危险玩家",
    condition: "dangerOpponentCards <= 3 && lowSinglePlayed",
    feedback: "对手进入冲刺阶段，需要优先限制",
    trainingValue: "帮助用户建立残局防守意识。"
  },
  {
    id: "miss-assist",
    title: "不会助攻",
    condition: "partnerCanRun && playerBlocksPartner",
    feedback: "当前更适合帮助队友获得出牌权",
    trainingValue: "帮助用户从单人视角切换到双人配合视角。"
  }
];
