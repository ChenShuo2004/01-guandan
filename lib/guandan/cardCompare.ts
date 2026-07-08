import type { Card } from "@/lib/guandan/card";
import { detectCardPattern } from "@/lib/guandan/cardRule";

export interface CompareResult {
  canPlay: boolean;
  reason: string;
}

export function canBeatLastPlay(candidateCards: Card[], lastCards: Card[]): CompareResult {
  const candidate = detectCardPattern(candidateCards);

  if (!candidate.valid) {
    return {
      canPlay: false,
      reason: candidate.message ?? "牌型不合法"
    };
  }

  if (lastCards.length === 0) {
    return {
      canPlay: true,
      reason: "获得牌权，可以出任意合法牌型"
    };
  }

  const last = detectCardPattern(lastCards);

  if (!last.valid) {
    return {
      canPlay: true,
      reason: "上一手无效，重新获得牌权"
    };
  }

  if (candidate.type === "fourJokers") {
    return {
      canPlay: true,
      reason: "四王是最大炸弹"
    };
  }

  if (last.type === "fourJokers") {
    return {
      canPlay: false,
      reason: "四王无法被压过"
    };
  }

  if (candidate.type === "bomb" && last.type !== "bomb") {
    return {
      canPlay: true,
      reason: "炸弹可以压普通牌型"
    };
  }

  if (candidate.type !== last.type) {
    return {
      canPlay: false,
      reason: "需要同牌型，或使用炸弹"
    };
  }

  if (candidate.cards.length !== last.cards.length) {
    return {
      canPlay: false,
      reason: "同牌型需要张数一致"
    };
  }

  return {
    canPlay: candidate.power > last.power,
    reason: candidate.power > last.power ? "可以压过上一手" : "牌力不够"
  };
}
