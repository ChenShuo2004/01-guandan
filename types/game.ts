import type { PokerCardData } from "@/types/poker";

export type SeatPosition = "top" | "left" | "right" | "bottom";

export type PlayerStatus = "ready" | "thinking" | "waiting" | "active";

export interface ArenaPlayer {
  id: string;
  name: string;
  role: string;
  position: SeatPosition;
  cardCount: number;
  status: PlayerStatus;
  score: number;
  isUser?: boolean;
}

export interface CoachState {
  mood: "idle" | "thinking" | "teaching" | "warning";
  message: string;
}

export interface GameArenaState {
  mode: string;
  roundLabel: string;
  players: ArenaPlayer[];
  handCards: PokerCardData[];
  tableCards: PokerCardData[];
  coach: CoachState;
}
