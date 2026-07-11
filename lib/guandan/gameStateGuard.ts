import type { GameEngineState, TurnActionState } from "./gameState.ts";
import type { PlayerId } from "./player.ts";
import { getActivePlayerCount, getNextActiveTurn, getRequiredPassCountForTrickReset } from "./turnManager.ts";

export function getGameStateIssues(state: GameEngineState) {
  const issues: string[] = [];
  const playerIds = new Set(state.players.map((player) => player.id));
  const finishOrder = normalizeFinishOrder(state);
  const currentPlayer = state.players[state.currentTurn];
  const normalizedState = { ...state, finishOrder };
  const requiredPassCount = getRequiredPassCountForTrickReset(normalizedState);

  if (finishOrder.length !== state.finishOrder.length) {
    issues.push("finishOrder contains duplicate or unknown players");
  }

  if (state.gameStatus === "playing" && getActivePlayerCount(normalizedState) > 0) {
    if (!currentPlayer) {
      issues.push("currentTurn points outside players");
    } else if (currentPlayer.hand.length === 0 || finishOrder.includes(currentPlayer.id)) {
      issues.push(`currentTurn points to inactive player ${currentPlayer.id}`);
    }
  }

  if (state.passCount > requiredPassCount) {
    issues.push("passCount exceeds active trick requirement");
  }

  if (state.lastPlayerId && !playerIds.has(state.lastPlayerId)) {
    issues.push("lastPlayerId points to an unknown player");
  }

  return issues;
}

export function stabilizeGameState(state: GameEngineState): GameEngineState {
  const finishOrder = normalizeFinishOrder(state);
  const normalizedState = { ...state, finishOrder };
  const activePlayerCount = getActivePlayerCount(normalizedState);
  const gameFinished = activePlayerCount === 0 || finishOrder.length === state.players.length;
  const currentTurn =
    state.gameStatus === "playing" && activePlayerCount > 0 && !isActiveTurn(normalizedState)
      ? getNextActiveTurn(normalizedState)
      : state.currentTurn;
  const nextState: GameEngineState = {
    ...state,
    currentTurn,
    finishOrder,
    winner: finishOrder[0] ?? state.winner,
    gameStatus: gameFinished ? "finished" : state.gameStatus,
    passCount: Math.min(state.passCount, getRequiredPassCountForTrickReset(normalizedState))
  };

  if (nextState.gameStatus !== "playing") return nextState;

  const currentPlayer = nextState.players[nextState.currentTurn];
  if (!currentPlayer || nextState.turnAction.playerId === currentPlayer.id) return nextState;

  const turnAction: TurnActionState = {
    playerId: currentPlayer.id,
    status: "waiting",
    label: `${currentPlayer.role} 准备行动`,
    remainingSeconds: currentPlayer.id === "player" ? 15 : null
  };

  return {
    ...nextState,
    turnAction,
    playerActionState: {
      ...nextState.playerActionState,
      [currentPlayer.id]: turnAction
    }
  };
}

function normalizeFinishOrder(state: GameEngineState) {
  const knownPlayerIds = new Set(state.players.map((player) => player.id));
  const seen = new Set<PlayerId>();
  const normalized = state.finishOrder.filter((playerId) => {
    if (!knownPlayerIds.has(playerId) || seen.has(playerId)) return false;
    seen.add(playerId);
    return true;
  });

  for (const player of state.players) {
    if (player.hand.length === 0 && !seen.has(player.id)) {
      normalized.push(player.id);
      seen.add(player.id);
    }
  }

  return normalized;
}

function isActiveTurn(state: GameEngineState) {
  const currentPlayer = state.players[state.currentTurn];
  return Boolean(currentPlayer && currentPlayer.hand.length > 0 && !state.finishOrder.includes(currentPlayer.id));
}
