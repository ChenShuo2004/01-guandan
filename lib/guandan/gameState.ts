import type { CoachFeedback } from "@/lib/coach/coachTypes";
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
  coachFeedback: CoachFeedback;
  tipMessage: string | null;
}

const initialCoachFeedback: CoachFeedback = {
  type: "tip",
  level: "low",
  message: "先看牌型结构",
  reason: "开局不要只看最大牌，先判断自己适合主攻还是助攻。",
  suggestion: "优先处理散牌，保留炸弹和关键对子。"
};

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
    coachMessage: initialCoachFeedback.message,
    coachFeedback: initialCoachFeedback,
    tipMessage: null
  };
}

export function getCurrentPlayer(state: GameEngineState) {
  return state.players[state.currentTurn];
}

export function getPlayer(state: GameEngineState, playerId: PlayerId) {
  return state.players.find((player) => player.id === playerId);
}
