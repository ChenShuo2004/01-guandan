"use client";

import { useCallback, useMemo, useReducer } from "react";
import { getAIAction } from "@/lib/ai/AIPlayer";
import { sortCardsForHand } from "@/lib/cards/cardSort";
import { analyzeCoachTip, analyzeHint } from "@/lib/coach/CoachAnalyzer";
import type { AIHint, CoachFeedback } from "@/lib/coach/coachTypes";
import { detectMistakeAfterUserPlay } from "@/lib/coach/MistakeDetector";
import { generateTrainingReview, getRealtimeHint } from "@/lib/coach/TrainingCoachEngine";
import type { Card } from "@/lib/guandan/card";
import { sortCards } from "@/lib/guandan/card";
import { clearSelection, passTurn, playCards, toggleSelectedCard } from "@/lib/guandan/gameEngine";
import {
  createInitialGameState,
  getCurrentPlayer,
  updatePlayerActionState,
  type GameEngineState,
  type TrainingPhase,
  type TurnActionState
} from "@/lib/guandan/gameState";
import type { PlayerId } from "@/lib/guandan/player";

type GameAction =
  | { type: "restart" }
  | { type: "start-training" }
  | { type: "continue-training" }
  | { type: "toggle-card"; card: Card }
  | { type: "set-selection"; cards: Card[] }
  | { type: "clear-selection" }
  | { type: "sort-hand" }
  | { type: "play-selected" }
  | { type: "pass" }
  | { type: "tip" }
  | { type: "toggle-card-counter" }
  | { type: "show-solution" }
  | { type: "set-turn-action"; turnAction: TurnActionState }
  | { type: "clear-round-actions" }
  | { type: "ai-action" };

function gameReducer(state: GameEngineState, action: GameAction): GameEngineState {
  switch (action.type) {
    case "restart":
      return createInitialGameState(Date.now());

    case "start-training": {
      const turnAction: TurnActionState = {
        playerId: getCurrentPlayer(state)?.id ?? null,
        status: "waiting",
        label: "训练开始，等待你出牌",
        remainingSeconds: 15
      };

      return applyHint(
        {
          ...state,
          trainingPhase: "playing",
          invalidCardIds: [],
          tipMessage: null,
          roundComplete: false,
          turnAction,
          playerActionState: updatePlayerActionState(state.playerActionState, turnAction)
        },
        getRealtimeHint(state, "game_start")
      );
    }

    case "continue-training": {
      const currentPlayer = getCurrentPlayer(state);
      const turnAction: TurnActionState = {
        playerId: currentPlayer?.id ?? null,
        status: state.gameStatus === "finished" ? "finished" : "waiting",
        label: state.gameStatus === "finished" ? "训练完成" : `${currentPlayer?.role ?? "玩家"} 准备行动`,
        remainingSeconds: currentPlayer?.id === "player" ? 15 : null
      };
      const nextState: GameEngineState = {
        ...state,
        trainingPhase: state.gameStatus === "finished" ? "completed" : "playing",
        invalidCardIds: [],
        tipMessage: null,
        turnAction,
        playerActionState: updatePlayerActionState(state.playerActionState, turnAction)
      };

      if (state.gameStatus === "finished") {
        return applyCoachFeedback(
          {
            ...nextState,
            trainingReview: generateTrainingReview(nextState)
          },
          analyzeCoachTip({ state: nextState })
        );
      }

      return applyCoachFeedback(nextState, {
        type: "tip",
        level: "low",
        message: "继续训练",
        reason: "刚才的选择已经记录，现在进入下一轮牌权判断。",
        suggestion: "如果轮到 AI，先观察它的动作；轮到你时再判断是否压过。"
      });
    }

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

    case "clear-selection": {
      if (state.selectedCards.length === 0) return state;
      return applyCoachFeedback(clearSelection(state), {
        type: "tip",
        level: "low",
        message: "已撤销当前选择",
        reason: "这一步只清空选中的牌，不会改变牌局。",
        suggestion: "重新选择一组牌型，或点提示让 Ace Coach 给出建议。"
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
          message: "已整理手牌",
          reason: "整理后会保留当前选择，并把手牌恢复到稳定排序。",
          suggestion: "不确定下一手时，先选一组牌再点提示。"
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
            suggestion: "重新检查张数、牌型是否连续，或改用同牌型压过上家。",
            hint: getRealtimeHint(state, "before_play") ?? undefined
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
      const afterHint = getRealtimeHint(nextState, nextState.gameStatus === "finished" ? "game_end" : "after_play");

      if (mistake) return applyCoachFeedback(analyzedState, mistake);

      return applyCoachFeedback(analyzedState, {
        type: trainingPhase === "completed" ? "replay" : "praise",
        level: "medium",
        message: trainingPhase === "completed" ? "训练完成" : "出牌已提交，进入 AI 分析",
        reason: result.message || "这手牌型可以作为本轮有效出牌。",
        suggestion:
          trainingPhase === "completed"
            ? "查看本局复盘，决定下一阶段训练。"
            : "先看这手是否影响后续牌型，再点继续训练进入下一轮。",
        hint: afterHint ?? undefined,
        review: trainingPhase === "completed" ? generateTrainingReview(analyzedState) : undefined
      });
    }

    case "pass": {
      if (state.trainingPhase !== "playing") return state;
      const result = passTurn(state, "player");
      if (!result.ok) return withCoach(result.state);

      const nextState = {
        ...result.state,
        trainingPhase: result.state.gameStatus === "finished" ? "completed" : "analysis" as TrainingPhase
      };

      return applyCoachFeedback(nextState, {
        type: "tip",
        level: "medium",
        message: "你选择不出，进入 AI 分析",
        reason: result.message,
        suggestion: "确认这次让牌是否保留了关键资源，再继续下一轮。",
        hint: getRealtimeHint(result.state, "after_play") ?? undefined
      });
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

    case "toggle-card-counter":
      return {
        ...state,
        cardCounterVisible: !state.cardCounterVisible
      };

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

    case "set-turn-action":
      return {
        ...state,
        turnAction: action.turnAction,
        playerActionState: updatePlayerActionState(state.playerActionState, action.turnAction)
      };

    case "clear-round-actions":
      return {
        ...state,
        currentRoundActions: {},
        roundComplete: false,
        animationState: {
          cardMoving: false,
          cardShowing: false,
          coachExplaining: true
        }
      };

    case "ai-action": {
      const currentPlayer = getCurrentPlayer(state);
      if (!currentPlayer || currentPlayer.kind !== "ai" || state.trainingPhase !== "playing" || state.gameStatus !== "playing") return state;

      const aiAction = getAIAction(currentPlayer, state, "normal");
      const result =
        aiAction.action === "play"
          ? playCards(state, currentPlayer.id, aiAction.cards)
          : passTurn(state, currentPlayer.id);
      const turnAction: TurnActionState = {
        playerId: currentPlayer.id,
        status: "analyzing",
        label: aiAction.action === "play" ? `${currentPlayer.role} 已出牌，等待分析` : `${currentPlayer.role} 选择不出`,
        remainingSeconds: null
      };

      return withCoach({
        ...result.state,
        trainingPhase: result.state.gameStatus === "finished" ? "completed" : "playing",
        invalidCardIds: [],
        tipMessage: null,
        turnAction,
        playerActionState: updatePlayerActionState(result.state.playerActionState, turnAction),
        animationState: {
          cardMoving: false,
          cardShowing: true,
          coachExplaining: true
        }
      });
    }

    default:
      return state;
  }
}

function withCoach(state: GameEngineState): GameEngineState {
  return applyCoachFeedback(state, analyzeCoachTip({ state }));
}

function applyCoachFeedback(state: GameEngineState, feedback: CoachFeedback): GameEngineState {
  return applyHint(
    {
      ...state,
      coachFeedback: feedback,
      coachMessage: feedback.message,
      trainingReview: feedback.review ?? state.trainingReview
    },
    feedback.hint ?? null
  );
}

function applyHint(state: GameEngineState, hint: AIHint | null): GameEngineState {
  if (!hint) return state;
  const lastHint = state.hintHistory[state.hintHistory.length - 1];
  if (lastHint?.title === hint.title && lastHint.trigger === hint.trigger) {
    return {
      ...state,
      activeHint: hint
    };
  }

  return {
    ...state,
    activeHint: hint,
    hintHistory: [...state.hintHistory.slice(-5), hint]
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

  const startTraining = useCallback(() => dispatch({ type: "start-training" }), []);
  const continueTraining = useCallback(() => dispatch({ type: "continue-training" }), []);
  const selectCard = useCallback((card: Card) => dispatch({ type: "toggle-card", card }), []);
  const setSelectedCards = useCallback((cards: Card[]) => dispatch({ type: "set-selection", cards }), []);
  const clearSelectedCards = useCallback(() => dispatch({ type: "clear-selection" }), []);
  const sortHand = useCallback(() => dispatch({ type: "sort-hand" }), []);
  const playSelectedCards = useCallback(() => dispatch({ type: "play-selected" }), []);
  const pass = useCallback(() => dispatch({ type: "pass" }), []);
  const requestTip = useCallback(() => dispatch({ type: "tip" }), []);
  const showSolution = useCallback(() => dispatch({ type: "show-solution" }), []);
  const toggleCardCounter = useCallback(() => dispatch({ type: "toggle-card-counter" }), []);
  const setTurnAction = useCallback((turnAction: TurnActionState) => dispatch({ type: "set-turn-action", turnAction }), []);
  const clearRoundActions = useCallback(() => dispatch({ type: "clear-round-actions" }), []);
  const runAIAction = useCallback(() => dispatch({ type: "ai-action" }), []);
  const restart = useCallback(() => dispatch({ type: "restart" }), []);

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
    clearSelectedCards,
    sortHand,
    playSelectedCards,
    pass,
    requestTip,
    toggleCardCounter,
    showSolution,
    setTurnAction,
    clearRoundActions,
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
