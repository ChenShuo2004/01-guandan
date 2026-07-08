import type { PlayerSeat } from "@/lib/guandan/player";

export type SeatPosition = PlayerSeat;

export type PlayerStatus = "ready" | "thinking" | "waiting" | "active" | "passed";

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
