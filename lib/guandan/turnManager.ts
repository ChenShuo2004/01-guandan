import type { GameEngineState } from "@/lib/guandan/gameState";
import type { PlayerId } from "@/lib/guandan/player";

export function getNextPlayerIndex(currentTurn: number, playerCount: number) {
  return (currentTurn + 1) % playerCount;
}

export function findPlayerIndex(state: GameEngineState, playerId: PlayerId) {
  return state.players.findIndex((player) => player.id === playerId);
}

export function getNextActiveTurn(state: GameEngineState) {
  return getNextPlayerIndex(state.currentTurn, state.players.length);
}
