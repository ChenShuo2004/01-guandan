"use client";

import { useCallback, useMemo, useReducer } from "react";
import { getAIAction } from "@/lib/ai/AIPlayer";
import type { Card } from "@/lib/guandan/card";
import { playCards, passTurn, toggleSelectedCard } from "@/lib/guandan/gameEngine";
import {
  createInitialGameState,
  getCurrentPlayer,
  type GameEngineState
} from "@/lib/guandan/gameState";
import type { PlayerId } from "@/lib/guandan/player";
import { analyzeCoachTip } from "@/lib/coach/CoachAnalyzer";

type GameAction =
  | { type: "restart" }
  | { type: "toggle-card"; card: Card }
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

    case "play-selected": {
      const result = playCards(state, "player", state.selectedCards);
      return withCoach(result.state);
    }

    case "pass": {
      const result = passTurn(state, "player");
      return withCoach(result.state);
    }

    case "tip": {
      const tip = analyzeCoachTip({ state });
      return {
        ...state,
        coachMessage: tip.message,
        tipMessage: tip.message
      };
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
        coachMessage: aiAction.reason
      });
    }

    default:
      return state;
  }
}

function withCoach(state: GameEngineState): GameEngineState {
  const coach = analyzeCoachTip({ state });
  return {
    ...state,
    coachMessage: state.tipMessage ?? coach.message
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
