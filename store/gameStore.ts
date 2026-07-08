import type { GameArenaState } from "@/types/game";

export const phaseOneArenaState: GameArenaState = {
  mode: "新手训练场",
  roundLabel: "第 1 轮 · 出牌判断",
  players: [
    {
      id: "ace-ai",
      name: "Ace AI",
      role: "对家",
      position: "top",
      cardCount: 25,
      status: "thinking",
      score: 2680
    },
    {
      id: "partner",
      name: "Blue Coach",
      role: "上家队友",
      position: "left",
      cardCount: 25,
      status: "waiting",
      score: 2150
    },
    {
      id: "opponent",
      name: "North AI",
      role: "下家对手",
      position: "right",
      cardCount: 25,
      status: "active",
      score: 2150
    },
    {
      id: "player",
      name: "KAI",
      role: "我",
      position: "bottom",
      cardCount: 18,
      status: "ready",
      score: 2000,
      isUser: true
    }
  ],
  handCards: [
    { id: "joker-red", rank: "BJ" },
    { id: "spade-2", rank: "2", suit: "spade" },
    { id: "heart-2", rank: "2", suit: "heart" },
    { id: "spade-a", rank: "A", suit: "spade" },
    { id: "heart-a", rank: "A", suit: "heart" },
    { id: "spade-k", rank: "K", suit: "spade" },
    { id: "club-k", rank: "K", suit: "club" },
    { id: "heart-q", rank: "Q", suit: "heart" },
    { id: "diamond-q", rank: "Q", suit: "diamond" },
    { id: "heart-j", rank: "J", suit: "heart" },
    { id: "spade-10", rank: "10", suit: "spade" },
    { id: "diamond-10", rank: "10", suit: "diamond" },
    { id: "club-9", rank: "9", suit: "club" },
    { id: "club-8", rank: "8", suit: "club" },
    { id: "diamond-7", rank: "7", suit: "diamond" },
    { id: "club-6", rank: "6", suit: "club" },
    { id: "heart-5", rank: "5", suit: "heart" },
    { id: "club-3", rank: "3", suit: "club" }
  ],
  tableCards: [
    { id: "table-heart-8", rank: "8", suit: "heart" },
    { id: "table-diamond-8", rank: "8", suit: "diamond" },
    { id: "table-spade-q", rank: "Q", suit: "spade" },
    { id: "table-club-q", rank: "Q", suit: "club" }
  ],
  coach: {
    mood: "teaching",
    message: "先观察牌权。对手可能留炸弹，别急着交大牌。"
  }
};
