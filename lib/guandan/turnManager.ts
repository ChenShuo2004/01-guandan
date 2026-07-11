import type { GameEngineState } from "@/lib/guandan/gameState";
import type { PlayerId } from "@/lib/guandan/player";

export function getNextPlayerIndex(currentTurn: number, playerCount: number) {
  return (currentTurn + 1) % playerCount;
}

export function findPlayerIndex(state: GameEngineState, playerId: PlayerId) {
  return state.players.findIndex((player) => player.id === playerId);
}

export function getNextActiveTurn(state: GameEngineState) {
  for (let offset = 1; offset <= state.players.length; offset += 1) {
    const index = (state.currentTurn + offset) % state.players.length;
    const player = state.players[index];

    if (player.hand.length > 0 && !state.finishOrder.includes(player.id)) {
      return index;
    }
  }

  return state.currentTurn;
}

export function getActivePlayerCount(state: GameEngineState) {
  return state.players.filter((player) => player.hand.length > 0 && !state.finishOrder.includes(player.id)).length;
}

export function getRequiredPassCountForTrickReset(state: GameEngineState) {
  const activePlayerCount = getActivePlayerCount(state);
  const lastPlayer = state.lastPlayerId
    ? state.players.find((player) => player.id === state.lastPlayerId)
    : undefined;
  const lastPlayerIsActive =
    Boolean(lastPlayer?.hand.length) && Boolean(lastPlayer && !state.finishOrder.includes(lastPlayer.id));

  return Math.max(1, activePlayerCount - (lastPlayerIsActive ? 1 : 0));
}

export function getTurnAfterTrickReset(state: GameEngineState) {
  const lastPlayerIndex = state.lastPlayerId
    ? state.players.findIndex((player) => player.id === state.lastPlayerId)
    : -1;
  const lastPlayer = lastPlayerIndex >= 0 ? state.players[lastPlayerIndex] : undefined;

  if (lastPlayer?.hand.length) return lastPlayerIndex;
  if (lastPlayerIndex >= 0) {
    return getNextActiveTurn({ ...state, currentTurn: lastPlayerIndex });
  }

  return getNextActiveTurn(state);
}
