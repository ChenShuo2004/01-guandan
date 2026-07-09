import type { Card } from "@/lib/guandan/card";

export type PlayerId = "player" | "enemyAI1" | "partnerAI" | "enemyAI2";
export type PlayerKind = "human" | "ai";
export type PlayerSeat = "bottom" | "right" | "top" | "left";

export interface GuandanPlayer {
  id: PlayerId;
  name: string;
  role: string;
  team: "blue" | "red";
  kind: PlayerKind;
  seat: PlayerSeat;
  hand: Card[];
  passed: boolean;
  score: number;
}

const PLAYER_ORDER: Array<Omit<GuandanPlayer, "hand" | "passed">> = [
  {
    id: "player",
    name: "KAI",
    role: "我方",
    team: "blue",
    kind: "human",
    seat: "bottom",
    score: 2000
  },
  {
    id: "enemyAI1",
    name: "North AI",
    role: "下家",
    team: "red",
    kind: "ai",
    seat: "right",
    score: 2150
  },
  {
    id: "partnerAI",
    name: "Ace AI",
    role: "对家",
    team: "blue",
    kind: "ai",
    seat: "top",
    score: 2680
  },
  {
    id: "enemyAI2",
    name: "Blue AI",
    role: "上家",
    team: "red",
    kind: "ai",
    seat: "left",
    score: 2150
  }
];

export function initializePlayers(hands: Card[][]): GuandanPlayer[] {
  return PLAYER_ORDER.map((player, index) => ({
    ...player,
    hand: hands[index] ?? [],
    passed: false
  }));
}
