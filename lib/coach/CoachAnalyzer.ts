import { detectCardPattern } from "@/lib/guandan/cardRule";
import type { GameEngineState } from "@/lib/guandan/gameState";

export interface CoachAnalyzerInput {
  state: GameEngineState;
}

export interface CoachAnalyzerOutput {
  type: "tip" | "warning" | "praise";
  message: string;
}

export function analyzeCoachTip({ state }: CoachAnalyzerInput): CoachAnalyzerOutput {
  const currentPlayer = state.players[state.currentTurn];
  const user = state.players.find((player) => player.id === "player");
  const selectedPattern = detectCardPattern(state.selectedCards);

  if (state.gameStatus === "finished") {
    return {
      type: "praise",
      message: state.winner === "player" ? "这局拿下了。记住刚才的牌权节奏。" : "本局结束。复盘最后三手牌权。"
    };
  }

  if (currentPlayer?.id !== "player") {
    return {
      type: "tip",
      message: `${currentPlayer?.role ?? "AI"} 思考中。注意它是否保留炸弹。`
    };
  }

  if (state.selectedCards.length > 0 && selectedPattern.valid) {
    return {
      type: "tip",
      message: `当前选择是 ${selectedPattern.type}。先确认能不能压过上一手。`
    };
  }

  if ((user?.hand.length ?? 0) <= 6) {
    return {
      type: "warning",
      message: "进入收尾。优先让牌型成组，别拆炸弹。"
    };
  }

  return {
    type: "tip",
    message: "先处理散牌，保留炸弹和关键对子。"
  };
}
