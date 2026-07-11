import type { CoachFeedback } from "@/lib/coach/coachTypes";
import { sortCardsForHand } from "@/lib/cards/cardSort";
import { getCardLabel, type Card, type CardRank } from "@/lib/guandan/card";
import { createDeck, dealCards, shuffleDeck } from "@/lib/guandan/deck";
import { initializePlayers, type GuandanPlayer, type PlayerId } from "@/lib/guandan/player";
import type { PlayerSeat } from "@/lib/guandan/player";

export type GameStatus = "playing" | "finished";
export type TrainingPhase = "idle" | "playing" | "analysis" | "completed";
export type PlayerActionStatus = "waiting" | "thinking" | "playing" | "analyzing" | "finished";

export interface TurnActionState {
  playerId: PlayerId | null;
  status: PlayerActionStatus;
  label: string;
  remainingSeconds: number | null;
}

export type CardRemainingCount = Record<string, number>;
export type PlayerActionStateMap = Partial<Record<PlayerId, TurnActionState>>;

export interface PlayerRoundAction {
  turn: number;
  playerId: PlayerId;
  playerName: string;
  role: string;
  seat: PlayerSeat;
  action: "play" | "pass";
  cards: Card[];
  result: string;
  reason: string;
}

export interface CardAnimationState {
  cardMoving: boolean;
  cardShowing: boolean;
  coachExplaining: boolean;
}

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
  levelRank: CardRank;
  currentTurn: number;
  lastPlayedCards: Card[];
  lastPlayerId: PlayerId | null;
  selectedCards: Card[];
  invalidCardIds: string[];
  invalidPulseKey: number;
  trainingPhase: TrainingPhase;
  gameStatus: GameStatus;
  winner: PlayerId | null;
  passCount: number;
  turnNumber: number;
  history: GameHistoryEntry[];
  currentRoundActions: Partial<Record<PlayerId, PlayerRoundAction>>;
  roundComplete: boolean;
  roundClearKey: number;
  turnAction: TurnActionState;
  playerActionState: PlayerActionStateMap;
  cardCounterVisible: boolean;
  cardRemainingCount: CardRemainingCount;
  animationState: CardAnimationState;
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

// The first render must be identical on server and client; restarts use Date.now().
export function createInitialGameState(seed = 20260711): GameEngineState {
  const deck = shuffleDeck(createDeck(), seed);
  const hands = dealCards(deck, 4);
  const levelRank: CardRank = 15;
  const players = initializePlayers(hands).map((player) => ({
    ...player,
    hand: sortCardsForHand(player.hand)
  }));
  const initialTurnAction: TurnActionState = {
    playerId: players[0]?.id ?? null,
    status: "waiting",
    label: "等待你出牌",
    remainingSeconds: 15
  };

  return {
    players,
    levelRank,
    currentTurn: 0,
    lastPlayedCards: [],
    lastPlayerId: null,
    selectedCards: [],
    invalidCardIds: [],
    invalidPulseKey: 0,
    trainingPhase: "playing",
    gameStatus: "playing",
    winner: null,
    passCount: 0,
    turnNumber: 1,
    history: [],
    currentRoundActions: {},
    roundComplete: false,
    roundClearKey: 0,
    turnAction: initialTurnAction,
    playerActionState: createInitialPlayerActionState(players, initialTurnAction),
    cardCounterVisible: false,
    cardRemainingCount: createInitialCardRemainingCount(),
    animationState: {
      cardMoving: false,
      cardShowing: false,
      coachExplaining: true
    },
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

export function createInitialCardRemainingCount(): CardRemainingCount {
  return createDeck().reduce<CardRemainingCount>((counts, card) => {
    const label = getCardLabel(card);
    counts[label] = (counts[label] ?? 0) + 1;
    return counts;
  }, {});
}

export function decrementCardRemainingCount(
  current: CardRemainingCount,
  cards: Card[]
): CardRemainingCount {
  return cards.reduce<CardRemainingCount>(
    (counts, card) => {
      const label = getCardLabel(card);
      counts[label] = Math.max(0, (counts[label] ?? 0) - 1);
      return counts;
    },
    { ...current }
  );
}

export function createInitialPlayerActionState(
  players: GuandanPlayer[],
  turnAction: TurnActionState
): PlayerActionStateMap {
  return players.reduce<PlayerActionStateMap>((actions, player) => {
    actions[player.id] = {
      playerId: player.id,
      status: player.id === turnAction.playerId ? turnAction.status : "waiting",
      label: player.id === turnAction.playerId ? turnAction.label : "等待行动",
      remainingSeconds: player.id === turnAction.playerId ? turnAction.remainingSeconds : null
    };
    return actions;
  }, {});
}

export function updatePlayerActionState(
  current: PlayerActionStateMap,
  turnAction: TurnActionState
): PlayerActionStateMap {
  if (!turnAction.playerId) return current;

  return {
    ...current,
    [turnAction.playerId]: turnAction
  };
}
