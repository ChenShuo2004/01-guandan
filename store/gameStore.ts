"use client";

import { useCallback, useMemo, useReducer } from "react";
import { getAIAction } from "@/lib/ai/AIPlayer";
import { analyzeCoachTip, analyzeHint } from "@/lib/coach/CoachAnalyzer";
import type { CoachFeedback } from "@/lib/coach/coachTypes";
import { detectMistakeAfterUserPlay } from "@/lib/coach/MistakeDetector";
import type { Card } from "@/lib/guandan/card";
import { sortCards } from "@/lib/guandan/card";
import { playCards, passTurn, toggleSelectedCard } from "@/lib/guandan/gameEngine";
import {
  createInitialGameState,
  getCurrentPlayer,
  type GameEngineState
} from "@/lib/guandan/gameState";
import type { PlayerId } from "@/lib/guandan/player";

type GameAction =
  | { type: "restart" }
  | { type: "toggle-card"; card: Card }
  | { type: "set-selection"; cards: Card[] }
  | { type: "play-selected" }
  | { type: "pass" }
  | { type: "tip" }
  | { type: "ai-action" };

function gameReducer(state: GameEngineState, action: GameAction): GameEngineState {
  switch (action.type) {
    case "restart":
      return createInitialGameState(Date.now());

    case "toggle-card": {
      if (state.gameStatus !== "playing" || getCurrentPlayer(state)?.id !== "player") return state;
      return withCoach(toggleSelectedCard(state, action.card));
    }

    case "set-selection": {
      if (state.gameStatus !== "playing" || getCurrentPlayer(state)?.id !== "player") return state;
      return withCoach({
        ...state,
        selectedCards: sortCards(action.cards),
        invalidCardIds: [],
        tipMessage: null
      });
    }

    case "play-selected": {
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

      const mistake = result.ok ? detectMistakeAfterUserPlay(state, nextState) : null;
      return mistake ? applyCoachFeedback(nextState, mistake) : withCoach(nextState);
    }

    case "pass": {
      const result = passTurn(state, "player");
      return withCoach(result.state);
    }

    case "tip": {
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

    case "ai-action": {
      const currentPlayer = getCurrentPlayer(state);
      if (!currentPlayer || currentPlayer.kind !== "ai" || state.gameStatus !== "playing") return state;

      const aiAction = getAIAction(currentPlayer, state, "normal");
      const result =
        aiAction.action === "play"
          ? playCards(state, currentPlayer.id, aiAction.cards)
          : passTurn(state, currentPlayer.id);

      return withCoach({
        ...result.state,
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
  const isUserTurn = currentPlayer?.id === "player" && state.gameStatus === "playing";

  const selectCard = useCallback((card: Card) => {
    dispatch({ type: "toggle-card", card });
  }, []);

  const setSelectedCards = useCallback((cards: Card[]) => {
    dispatch({ type: "set-selection", cards });
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
    selectCard,
    setSelectedCards,
    playSelectedCards,
    pass,
    requestTip,
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
