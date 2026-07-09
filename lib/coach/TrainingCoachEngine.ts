import { chooseNormalMove } from "@/lib/ai/strategy";
import { getCardLabel } from "@/lib/guandan/card";
import { canBeatLastPlay } from "@/lib/guandan/cardCompare";
import { detectCardPattern } from "@/lib/guandan/cardRule";
import type { GameEngineState } from "@/lib/guandan/gameState";
import type {
  AIHint,
  AIHintTrigger,
  CoachKnowledgeQuery,
  CoachKnowledgeSource,
  TrainingPlan,
  TrainingReview
} from "@/lib/coach/coachTypes";

export class MockCoachKnowledgeSource implements CoachKnowledgeSource {
  async search(query: CoachKnowledgeQuery): Promise<string[]> {
    return [
      `mock:${query.topic}:${query.tags.join(",")}`,
      "V1 uses deterministic local hints. Replace this source with rules, technique, and mistake-case retrieval later."
    ];
  }
}

export function generateTrainingPlan(state: GameEngineState): TrainingPlan {
  const player = state.players.find((item) => item.id === "player");
  const hasBomb = Boolean(player?.hand.some((card) => {
    const sameRank = player.hand.filter((item) => item.rank === card.rank);
    return sameRank.length >= 4;
  }));

  return {
    goal: "今天练 1 个判断：先保牌型，再抢牌权。",
    focusProblems: [
      "容易只看最大牌，忽略后续手数",
      hasBomb ? "有炸弹时容易过早交控制牌" : "缺少强控牌时要更重视过渡",
      "对手进入 3 张以内时，拦截意识要提前"
    ],
    recommendedContent: ["低成本出牌", "关键牌保留", "残局拦截"],
    estimatedMinutes: 8
  };
}

export function getRealtimeHint(state: GameEngineState, trigger: AIHintTrigger): AIHint | null {
  if (trigger === "game_start") {
    return createHint({
      type: "analysis",
      trigger,
      title: "开局先看结构",
      content: "别急着出最大牌。先找能减少手数、又不拆炸弹和顺子的组合。",
      reason: "训练目标是建立稳定判断，而不是每手都追求压制。",
      action: "先选一组低成本牌型，再决定是否出牌。",
      priority: "medium"
    });
  }

  if (trigger === "before_play") {
    return buildBeforePlayHint(state);
  }

  if (trigger === "after_play") {
    return buildAfterPlayHint(state);
  }

  if (trigger === "game_end") {
    return createHint({
      type: "encourage",
      trigger,
      title: "训练完成",
      content: "本局已经有足够动作可复盘，重点看关键牌是否用在关键节点。",
      reason: "复盘比继续盲打更能提升判断质量。",
      action: "查看本局总结和下一阶段计划。",
      priority: "medium"
    });
  }

  return null;
}

export function generateTrainingReview(state: GameEngineState): TrainingReview {
  const userHistory = state.history.filter((entry) => entry.playerId === "player");
  const playCount = userHistory.filter((entry) => entry.action === "play").length;
  const passCount = userHistory.filter((entry) => entry.action === "pass").length;
  const bombCount = userHistory.filter((entry) => {
    const pattern = detectCardPattern(entry.cards);
    return pattern.type === "bomb" || pattern.type === "fourJokers";
  }).length;
  const won = state.winner === "player";
  const score = Math.max(55, Math.min(96, 74 + (won ? 10 : -3) + playCount - bombCount * 4));

  return {
    summary: won ? "你完成了主动收尾，节奏控制不错。" : "这局重点暴露在中后段牌权衔接。",
    correctMoves: [
      playCount > 0 ? "有主动出牌动作，没有一直等待。" : "保留了手牌，没有盲目拆牌。",
      passCount <= 2 ? "让牌次数克制，牌权意识较好。" : "在不利牌型时选择等待，避免了硬压。"
    ],
    mistakes: [
      bombCount >= 2 ? "炸弹使用偏早，后续控制力下降。" : "中局还可以更主动减少手数。",
      state.winner === "enemyAI1" || state.winner === "enemyAI2" ? "对手短牌时拦截不够及时。" : "部分选择还可以更早考虑队友配合。"
    ],
    improvements: [
      "出牌前先问：这手会不会拆掉我的后续组合？",
      "对手剩 3 张以内时，把拦截优先级提高。",
      "炸弹只在抢关键牌权或收尾时使用。"
    ],
    nextPlan: ["练 3 局低成本出牌", "练 2 局对手短牌拦截", "复盘炸弹使用时机"],
    score
  };
}

function buildBeforePlayHint(state: GameEngineState): AIHint | null {
  const currentPlayer = state.players[state.currentTurn];
  const player = state.players.find((item) => item.id === "player");
  if (!player || currentPlayer?.id !== "player") return null;

  const dangerOpponent = state.players.find(
    (item) => item.team === "red" && item.hand.length > 0 && item.hand.length <= 3
  );

  if (dangerOpponent) {
    return createHint({
      type: "warning",
      trigger: "before_play",
      title: "对手进入冲刺",
      content: `${dangerOpponent.role} 只剩 ${dangerOpponent.hand.length} 张，别给他轻松接牌。`,
      reason: "短牌阶段，阻断对手比整理自己手牌更重要。",
      action: "优先出对方难接的牌型，必要时用控制牌抢回节奏。",
      priority: "high"
    });
  }

  const recommendedCards = chooseNormalMove(player.hand, state.lastPlayedCards);
  if (recommendedCards.length === 0) {
    return createHint({
      type: "suggestion",
      trigger: "before_play",
      title: "这手可以先不出",
      content: "当前没有低成本压制方案，硬压会消耗关键牌。",
      reason: "保留大牌和炸弹，等下一轮重新拿牌权更稳。",
      action: "选择不出，观察下家是否接牌。",
      priority: "medium"
    });
  }

  const labels = recommendedCards.map(getCardLabel).join(" ");
  const pattern = detectCardPattern(recommendedCards);
  return createHint({
    type: pattern.type === "bomb" || pattern.type === "fourJokers" ? "warning" : "suggestion",
    trigger: "before_play",
    title: "出牌前建议",
    content: `推荐先考虑：${labels}`,
    reason: canBeatLastPlay(recommendedCards, state.lastPlayedCards).reason,
    action: pattern.type === "bomb" ? "确认这是关键牌权，再使用炸弹。" : "如果不拆核心组合，可以直接提交。",
    priority: pattern.type === "bomb" ? "high" : "medium",
    recommendedCards
  });
}

function buildAfterPlayHint(state: GameEngineState): AIHint | null {
  const lastEntry = state.history[state.history.length - 1];
  if (!lastEntry || lastEntry.playerId !== "player") return null;

  if (lastEntry.action === "pass") {
    return createHint({
      type: "analysis",
      trigger: "after_play",
      title: "让牌后看牌权",
      content: "这次不出是保守选择，下一步要观察牌权会不会回到对手。",
      reason: "让牌不是错误，但连续让牌会失去主动权。",
      action: "下一轮如果能低成本压过，优先重新参与。",
      priority: "medium"
    });
  }

  const pattern = detectCardPattern(lastEntry.cards);
  if (pattern.type === "bomb" || pattern.type === "fourJokers") {
    return createHint({
      type: "warning",
      trigger: "after_play",
      title: "炸弹已使用",
      content: "这手能抢节奏，但后面少了一张关键控制牌。",
      reason: "炸弹的价值在关键节点最高，过早使用会降低残局容错。",
      action: "接下来减少冒险，优先把牌型走顺。",
      priority: "high"
    });
  }

  return createHint({
    type: "encourage",
    trigger: "after_play",
    title: "有效出牌",
    content: "这手完成了牌型推进，继续观察下家是否被迫拆牌。",
    reason: "训练中每次有效出牌都要连接下一步判断。",
    action: "点继续训练，进入下一轮。",
    priority: "low"
  });
}

function createHint(input: Omit<AIHint, "id" | "createdAt">): AIHint {
  return {
    ...input,
    id: `${input.trigger}-${input.type}-${Date.now()}`,
    createdAt: Date.now()
  };
}
