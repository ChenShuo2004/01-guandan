import type { TrainingSession } from "@/types/training-session";

export const trainingSessions: TrainingSession[] = [
  {
    id: "bomb-timing-partner-leading",
    title: "炸弹使用时机",
    description: "你的队友已经领先，现在是否应该使用炸弹？",
    scenario: "队友只剩 2 张牌，对手刚用 10-J-Q-K-A 顺子拿牌权，你手里有一组 A 炸。",
    playerCards: ["A♠", "A♥", "A♣", "A♦", "8♠", "8♥", "K♣", "3♦"],
    opponentAction: "对方出顺子 10♠-J♥-Q♣-K♦-A♠",
    correctAction: "不要炸",
    explanation: "炸弹应该留在关键节点。队友已经领先时，提前消耗炸弹会降低后期控制能力。",
    ability: "炸弹判断"
  },
  {
    id: "card-reading-low-cost-control",
    title: "低成本控牌",
    description: "你能压住对方，但不一定要交出最大资源。",
    scenario: "上家出 8-8，你手里既有 K-K，也有一组炸弹。当前目标是稳住牌权。",
    playerCards: ["K♠", "K♥", "A♠", "A♥", "A♣", "A♦", "5♣", "6♦"],
    opponentAction: "上家出对子 8♠-8♦",
    correctAction: "压小牌",
    explanation: "能用普通牌型压住时，优先用低成本牌型。炸弹留给对手关键闯关或残局收口。",
    ability: "牌权判断"
  },
  {
    id: "partner-cooperation-pass",
    title: "队友配合",
    description: "队友有机会走完时，你要避免抢节奏。",
    scenario: "队友刚打出大对子拿到节奏，下家犹豫后选择不出。你有炸弹，但队友可能继续收尾。",
    playerCards: ["Q♠", "Q♥", "Q♣", "Q♦", "9♠", "9♥", "4♣", "7♦"],
    opponentAction: "下家不出，队友保留牌权",
    correctAction: "不要炸",
    explanation: "队友已掌握节奏时，你的任务是保护队友路线，而不是用炸弹打断己方节奏。",
    ability: "队友配合"
  },
  {
    id: "straight-finish-window",
    title: "顺子收口窗口",
    description: "判断什么时候应该主动走顺子，减少散牌压力。",
    scenario: "你手里有 7-8-9-10-J 顺子和两个散牌，对手刚过牌，当前你有牌权。",
    playerCards: ["7♠", "8♥", "9♣", "10♦", "J♠", "4♥", "K♦"],
    opponentAction: "一圈不出，牌权回到你手里",
    correctAction: "出顺子",
    explanation: "有牌权且顺子能明显减少手牌结构压力时，应该先处理连续牌，降低残局散牌风险。",
    ability: "出牌规划"
  }
];

export function getAbilityKey(ability: string) {
  const abilityMap: Record<string, string> = {
    炸弹判断: "bombTiming",
    牌权判断: "cardReading",
    队友配合: "partnerCooperation",
    出牌规划: "playPlanning"
  };

  return abilityMap[ability] ?? ability;
}
