import { detectCardPattern } from "@/lib/guandan/cardRule";
import type { GameEngineState, GameHistoryEntry } from "@/lib/guandan/gameState";
import type { CoachFeedback } from "@/lib/coach/coachTypes";
import { findBetterDecision } from "@/lib/coach/DecisionEngine";
import { getRealtimeHint } from "@/lib/coach/TrainingCoachEngine";

export function detectMistakeAfterUserPlay(
  previousState: GameEngineState,
  nextState: GameEngineState
): CoachFeedback | null {
  const lastEntry = nextState.history[nextState.history.length - 1];
  if (!lastEntry || lastEntry.playerId !== "player" || lastEntry.action !== "play") return null;

  return (
    detectEarlyBomb(previousState, lastEntry) ??
    detectDangerPlayerIgnored(previousState, lastEntry) ??
    detectLowEfficiencyPlay(previousState, lastEntry)
  );
}

export function detectContextualWarning(state: GameEngineState): CoachFeedback | null {
  const dangerOpponent = state.players.find(
    (player) => player.team === "red" && player.hand.length > 0 && player.hand.length <= 3
  );

  if (!dangerOpponent) return null;

  return {
    type: "mistake",
    level: "high",
    message: "对手进入冲刺阶段",
    reason: `${dangerOpponent.role} 只剩 ${dangerOpponent.hand.length} 张，下一轮可能直接走完。`,
    suggestion: "优先限制他能接上的牌型，必要时用炸弹抢回牌权。",
    hint: getRealtimeHint(state, "before_play") ?? undefined
  };
}

function detectEarlyBomb(state: GameEngineState, entry: GameHistoryEntry): CoachFeedback | null {
  const pattern = detectCardPattern(entry.cards);
  const opponentsStillLong = state.players.some((player) => player.team === "red" && player.hand.length > 5);

  if ((pattern.type === "bomb" || pattern.type === "fourJokers") && opponentsStillLong) {
    return {
      type: "mistake",
      level: "medium",
      message: "炸弹使用偏早",
      reason: "炸弹既是压制牌，也是残局控制牌。现在对手手牌还多，收益不够集中。",
      suggestion: "保留炸弹，等关键牌权或收尾阶段再用。",
      hint: getRealtimeHint(state, "after_play") ?? undefined
    };
  }

  return null;
}

function detectDangerPlayerIgnored(state: GameEngineState, entry: GameHistoryEntry): CoachFeedback | null {
  const pattern = detectCardPattern(entry.cards);
  const dangerOpponent = state.players.find(
    (player) => player.team === "red" && player.hand.length > 0 && player.hand.length <= 3
  );

  if (dangerOpponent && pattern.type === "single" && pattern.power < 13) {
    return {
      type: "mistake",
      level: "high",
      message: "没有处理危险玩家",
      reason: `${dangerOpponent.role} 只剩 ${dangerOpponent.hand.length} 张，小单牌容易给他过渡。`,
      suggestion: "优先出他难接的牌型，或用大牌抢节奏。",
      hint: getRealtimeHint(state, "after_play") ?? undefined
    };
  }

  return null;
}

function detectLowEfficiencyPlay(state: GameEngineState, entry: GameHistoryEntry): CoachFeedback | null {
  const better = findBetterDecision(state, entry.cards);
  if (!better) return null;

  return {
    type: "mistake",
    level: "low",
    message: "这手效率偏低",
    reason: "当前可以用更多张数组合减少手数。",
    suggestion: "优先走成组牌，单张留到牌权更安全时处理。",
    recommendedCards: better,
    hint: getRealtimeHint(state, "after_play") ?? undefined
  };
}
