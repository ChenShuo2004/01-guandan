"use client";

import { useCallback, useMemo, useReducer } from "react";
import { getAIAction } from "@/lib/ai/AIPlayer";
import { sortCardsForHand } from "@/lib/cards/cardSort";
import { analyzeCoachTip, analyzeHint } from "@/lib/coach/CoachAnalyzer";
import type { CoachFeedback } from "@/lib/coach/coachTypes";
import { detectMistakeAfterUserPlay } from "@/lib/coach/MistakeDetector";
import type { Card } from "@/lib/guandan/card";
import { sortCards } from "@/lib/guandan/card";
import { playCards, passTurn, toggleSelectedCard } from "@/lib/guandan/gameEngine";
import {
  createInitialGameState,
  getCurrentPlayer,
  type GameEngineState,
  type TrainingPhase
} from "@/lib/guandan/gameState";
import type { PlayerId } from "@/lib/guandan/player";

type GameAction =
  | { type: "restart" }
  | { type: "start-training" }
  | { type: "continue-training" }
  | { type: "toggle-card"; card: Card }
  | { type: "set-selection"; cards: Card[] }
  | { type: "sort-hand" }
  | { type: "play-selected" }
  | { type: "pass" }
  | { type: "tip" }
  | { type: "show-solution" }
  | { type: "ai-action" };

function gameReducer(state: GameEngineState, action: GameAction): GameEngineState {
  switch (action.type) {
    case "restart":
      return createInitialGameState(Date.now());

    case "start-training":
      return applyCoachFeedback(
        {
          ...state,
          trainingPhase: "playing",
          invalidCardIds: [],
          tipMessage: null
        },
        {
          type: "tip",
          level: "low",
          message: "训练开始：先判断这一手该不该主动出牌",
          reason: "你现在拥有第一手牌权，可以选择出牌、查看提示，或在没有牌权时选择不出。",
          suggestion: "先选一组低成本牌型，再提交出牌；不确定时点“查看提示”。"
        }
      );

    case "continue-training":
      return applyCoachFeedback(
        {
          ...state,
          trainingPhase: state.gameStatus === "finished" ? "completed" : "playing",
          invalidCardIds: [],
          tipMessage: null
        },
        state.gameStatus === "finished"
          ? {
              type: "replay",
              level: "medium",
              message: "本局训练完成",
              reason: "这局已经有玩家出完手牌。",
              suggestion: "可以重新训练，或者回到训练大厅选择下一项。"
            }
          : {
              type: "tip",
              level: "low",
              message: "继续训练：观察下一位玩家动作",
              reason: "刚才的选择已经记录，现在继续进入下一轮牌权判断。",
              suggestion: "如果轮到 AI，先观察它的出牌；轮到你时再决定是否压过。"
            }
      );

    case "toggle-card": {
      if (state.trainingPhase !== "playing" || state.gameStatus !== "playing" || getCurrentPlayer(state)?.id !== "player") return state;
      return withCoach(toggleSelectedCard(state, action.card));
    }

    case "set-selection": {
      if (state.trainingPhase !== "playing" || state.gameStatus !== "playing" || getCurrentPlayer(state)?.id !== "player") return state;
      return withCoach({
        ...state,
        selectedCards: sortCards(action.cards),
        invalidCardIds: [],
        tipMessage: null
      });
    }

    case "sort-hand": {
      if (state.trainingPhase !== "playing" || state.gameStatus !== "playing") return state;

      return applyCoachFeedback(
        {
          ...state,
          players: state.players.map((player) =>
            player.id === "player" ? { ...player, hand: sortCardsForHand(player.hand) } : player
          ),
          selectedCards: sortCardsForHand(state.selectedCards),
          invalidCardIds: [],
          tipMessage: null
        },
        {
          type: "tip",
          level: "low",
          message: "已按牌型和牌力整理手牌",
          reason: "整理后会保持当前选择，并把手牌恢复到稳定排序。",
          suggestion: "如果不确定下一手，先选一组牌再点“查看提示”。"
        }
      );
    }

    case "play-selected": {
      if (state.trainingPhase !== "playing") return state;
      const result = playCards(state, "player", state.selectedCards);
      const nextState = result.state;
      if (!result.ok) {
        return applyCoachFeedback(
          {
            ...nextState,
            selectedCards: state.selectedCards,
            invalidCardIds: state.selectedCards.map((card) => card.id),
            invalidPulseKey: state.invalidPulseKey + 1
          },
          {
            type: "mistake",
            level: "high",
            message: result.message || "这不是合法牌型",
            reason: "当前选择不能作为本轮出牌。",
            suggestion: "重新检查张数、牌型是否连续，或者改用同牌型压过上家。"
          }
        );
      }

      const trainingPhase: TrainingPhase = nextState.gameStatus === "finished" ? "completed" : "analysis";
      const analyzedState = {
        ...nextState,
        trainingPhase,
        invalidCardIds: []
      };
      const mistake = detectMistakeAfterUserPlay(state, nextState);
      return mistake
        ? applyCoachFeedback(analyzedState, mistake)
        : applyCoachFeedback(analyzedState, {
            type: trainingPhase === "completed" ? "replay" : "praise",
            level: "medium",
            message: trainingPhase === "completed" ? "训练完成" : "出牌已提交，进入 AI 分析",
            reason: result.message || "这手牌型可以作为本轮有效出牌。",
            suggestion:
              trainingPhase === "completed"
                ? "你已经完成这一局训练，可以重新训练或返回大厅。"
                : "先看这手是否影响后续牌型，再点击“继续训练”进入下一轮。"
          });
    }

    case "pass": {
      if (state.trainingPhase !== "playing") return state;
      const result = passTurn(state, "player");
      if (!result.ok) return withCoach(result.state);

      return applyCoachFeedback(
        {
          ...result.state,
          trainingPhase: result.state.gameStatus === "finished" ? "completed" : "analysis"
        },
        {
          type: "tip",
          level: "medium",
          message: "你选择不出，进入 AI 分析",
          reason: result.message,
          suggestion: "确认这次让牌是否保留了关键资源，再继续下一轮。"
        }
      );
    }

    case "tip": {
      if (state.trainingPhase !== "playing") return state;
      const feedback = analyzeHint(state);
      return applyCoachFeedback(
        {
          ...state,
          selectedCards: feedback.recommendedCards ? sortCards(feedback.recommendedCards) : state.selectedCards,
          invalidCardIds: [],
          tipMessage: feedback.message
        },
        feedback
      );
    }

    case "show-solution": {
      if (state.trainingPhase !== "analysis") return state;
      const feedback = analyzeHint(state);
      return applyCoachFeedback(
        {
          ...state,
          selectedCards: feedback.recommendedCards ? sortCards(feedback.recommendedCards) : state.selectedCards,
          invalidCardIds: [],
          tipMessage: feedback.message
        },
        {
          ...feedback,
          message: feedback.message || "推荐方案已标出"
        }
      );
    }

    case "ai-action": {
      const currentPlayer = getCurrentPlayer(state);
      if (!currentPlayer || currentPlayer.kind !== "ai" || state.trainingPhase !== "playing" || state.gameStatus !== "playing") return state;

      const aiAction = getAIAction(currentPlayer, state, "normal");
      const result =
        aiAction.action === "play"
          ? playCards(state, currentPlayer.id, aiAction.cards)
          : passTurn(state, currentPlayer.id);

      return withCoach({
        ...result.state,
        trainingPhase: result.state.gameStatus === "finished" ? "completed" : "playing",
        invalidCardIds: [],
        tipMessage: null
      });
    }

    default:
      return state;
  }
}

function withCoach(state: GameEngineState): GameEngineState {
  const feedback = analyzeCoachTip({ state });
  return applyCoachFeedback(state, feedback);
}

function applyCoachFeedback(state: GameEngineState, feedback: CoachFeedback): GameEngineState {
  return {
    ...state,
    coachFeedback: feedback,
    coachMessage: feedback.message
  };
}

export function useGameStore() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);
  const currentPlayer = getCurrentPlayer(state);
  const userPlayer = state.players.find((player) => player.id === "player");
  const selectedCardIds = useMemo(
    () => state.selectedCards.map((card) => card.id),
    [state.selectedCards]
  );
  const isUserTurn = currentPlayer?.id === "player" && state.gameStatus === "playing" && state.trainingPhase === "playing";

  const startTraining = useCallback(() => {
    dispatch({ type: "start-training" });
  }, []);

  const continueTraining = useCallback(() => {
    dispatch({ type: "continue-training" });
  }, []);

  const selectCard = useCallback((card: Card) => {
    dispatch({ type: "toggle-card", card });
  }, []);

  const setSelectedCards = useCallback((cards: Card[]) => {
    dispatch({ type: "set-selection", cards });
  }, []);

  const sortHand = useCallback(() => {
    dispatch({ type: "sort-hand" });
  }, []);

  const playSelectedCards = useCallback(() => {
    dispatch({ type: "play-selected" });
  }, []);

  const pass = useCallback(() => {
    dispatch({ type: "pass" });
  }, []);

  const requestTip = useCallback(() => {
    dispatch({ type: "tip" });
  }, []);

  const showSolution = useCallback(() => {
    dispatch({ type: "show-solution" });
  }, []);

  const runAIAction = useCallback(() => {
    dispatch({ type: "ai-action" });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: "restart" });
  }, []);

  return {
    state,
    currentPlayer,
    userPlayer,
    selectedCardIds,
    isUserTurn,
    startTraining,
    continueTraining,
    selectCard,
    setSelectedCards,
    sortHand,
    playSelectedCards,
    pass,
    requestTip,
    showSolution,
    runAIAction,
    restart
  };
}

export function getRemainingCards(state: GameEngineState): Record<PlayerId, number> {
  return state.players.reduce(
    (remaining, player) => ({
      ...remaining,
      [player.id]: player.hand.length
    }),
    {} as Record<PlayerId, number>
  );
}
