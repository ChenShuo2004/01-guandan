import type { Card } from "@/lib/guandan/card";
import { createDeck, dealCards, shuffleDeck } from "@/lib/guandan/deck";
import { initializePlayers, type GuandanPlayer, type PlayerId } from "@/lib/guandan/player";

export type GameStatus = "playing" | "finished";

export interface GameHistoryEntry {
  turn: number;
  playerId: PlayerId;
  playerName: string;
  action: "play" | "pass";
  cards: Card[];
  result: string;
}

export interface GameEngineState {
  players: GuandanPlayer[];
  currentTurn: number;
  lastPlayedCards: Card[];
  lastPlayerId: PlayerId | null;
  selectedCards: Card[];
  gameStatus: GameStatus;
  winner: PlayerId | null;
  passCount: number;
  turnNumber: number;
  history: GameHistoryEntry[];
  coachMessage: string;
  tipMessage: string | null;
}

export function createInitialGameState(seed = 20260708): GameEngineState {
  const deck = shuffleDeck(createDeck(), seed);
  const hands = dealCards(deck, 4);
  const players = initializePlayers(hands);

  return {
    players,
    currentTurn: 0,
    lastPlayedCards: [],
    lastPlayerId: null,
    selectedCards: [],
    gameStatus: "playing",
    winner: null,
    passCount: 0,
    turnNumber: 1,
    history: [],
    coachMessage: "先看牌型结构。第一轮尽量处理散牌，保留炸弹。",
    tipMessage: null
  };
}

export function getCurrentPlayer(state: GameEngineState) {
  return state.players[state.currentTurn];
}

export function getPlayer(state: GameEngineState, playerId: PlayerId) {
  return state.players.find((player) => player.id === playerId);
}
