import type { Card } from "@/lib/guandan/card";
import { sortCards } from "@/lib/guandan/card";
import { canBeatLastPlay } from "@/lib/guandan/cardCompare";
import { detectCardPattern } from "@/lib/guandan/cardRule";
import type { GameEngineState } from "@/lib/guandan/gameState";
import type { PlayerId } from "@/lib/guandan/player";
import { getNextActiveTurn } from "@/lib/guandan/turnManager";

export interface PlayCardsResult {
  state: GameEngineState;
  ok: boolean;
  message: string;
}

export function toggleSelectedCard(state: GameEngineState, card: Card): GameEngineState {
  const isSelected = state.selectedCards.some((selected) => selected.id === card.id);

  return {
    ...state,
    selectedCards: isSelected
      ? state.selectedCards.filter((selected) => selected.id !== card.id)
      : sortCards([...state.selectedCards, card]),
    invalidCardIds: [],
    tipMessage: null
  };
}

export function clearSelection(state: GameEngineState): GameEngineState {
  return {
    ...state,
    selectedCards: [],
    invalidCardIds: [],
    tipMessage: null
  };
}

export function playCards(state: GameEngineState, playerId: PlayerId, cards: Card[]): PlayCardsResult {
  if (state.gameStatus !== "playing") {
    return { state, ok: false, message: "本局已经结束" };
  }

  const currentPlayer = state.players[state.currentTurn];

  if (!currentPlayer || currentPlayer.id !== playerId) {
    return { state, ok: false, message: "还没轮到你" };
  }

  const compare = canBeatLastPlay(cards, state.lastPlayedCards);

  if (!compare.canPlay) {
    return {
      state: {
        ...state,
        coachMessage: compare.reason,
        tipMessage: compare.reason
      },
      ok: false,
      message: compare.reason
    };
  }

  const playedIds = new Set(cards.map((card) => card.id));
  const nextPlayers = state.players.map((player) =>
    player.id === playerId
      ? {
          ...player,
          hand: player.hand.filter((card) => !playedIds.has(card.id)),
          passed: false
        }
      : {
          ...player,
          passed: false
        }
  );
  const updatedPlayer = nextPlayers.find((player) => player.id === playerId);
  const winner = updatedPlayer && updatedPlayer.hand.length === 0 ? playerId : null;
  const pattern = detectCardPattern(cards);
  const nextState: GameEngineState = {
    ...state,
    players: nextPlayers,
    currentTurn: getNextActiveTurn(state),
    lastPlayedCards: sortCards(cards),
    lastPlayerId: playerId,
    selectedCards: [],
    invalidCardIds: [],
    gameStatus: winner ? "finished" : "playing",
    winner,
    passCount: 0,
    turnNumber: state.turnNumber + 1,
    history: [
      ...state.history,
      {
        turn: state.turnNumber,
        playerId,
        playerName: currentPlayer.name,
        action: "play",
        cards: sortCards(cards),
        result: pattern.type
      }
    ],
    coachMessage: `${currentPlayer.role} 出了 ${pattern.type}。${compare.reason}`,
    tipMessage: null
  };

  return {
    state: nextState,
    ok: true,
    message: compare.reason
  };
}

export function passTurn(state: GameEngineState, playerId: PlayerId): PlayCardsResult {
  if (state.gameStatus !== "playing") {
    return { state, ok: false, message: "本局已经结束" };
  }

  const currentPlayer = state.players[state.currentTurn];

  if (!currentPlayer || currentPlayer.id !== playerId) {
    return { state, ok: false, message: "还没轮到你" };
  }

  if (state.lastPlayedCards.length === 0 || state.lastPlayerId === playerId) {
    return {
      state: {
        ...state,
        coachMessage: "你现在有牌权，需要主动出牌。",
        tipMessage: "有牌权时不能不出。"
      },
      ok: false,
      message: "有牌权时不能不出"
    };
  }

  const passCount = state.passCount + 1;
  const trickResets = passCount >= state.players.length - 1;
  const nextTurn =
    trickResets && state.lastPlayerId
      ? state.players.findIndex((player) => player.id === state.lastPlayerId)
      : getNextActiveTurn(state);

  const nextState: GameEngineState = {
    ...state,
    players: state.players.map((player) =>
      player.id === playerId ? { ...player, passed: true } : player
    ),
    currentTurn: nextTurn >= 0 ? nextTurn : getNextActiveTurn(state),
    lastPlayedCards: trickResets ? [] : state.lastPlayedCards,
    lastPlayerId: trickResets ? null : state.lastPlayerId,
    selectedCards: [],
    invalidCardIds: [],
    passCount: trickResets ? 0 : passCount,
    turnNumber: state.turnNumber + 1,
    history: [
      ...state.history,
      {
        turn: state.turnNumber,
        playerId,
        playerName: currentPlayer.name,
        action: "pass",
        cards: [],
        result: trickResets ? "重新获得牌权" : "不出"
      }
    ],
    coachMessage: trickResets ? "一圈不出，牌权回到上一位出牌者。" : `${currentPlayer.role} 选择不出。`,
    tipMessage: null
  };

  return {
    state: nextState,
    ok: true,
    message: "不出"
  };
}
