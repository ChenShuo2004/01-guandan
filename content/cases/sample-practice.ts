import type { PracticeCase } from "@/types/practice";

export const whenToBombPractice: PracticeCase = {
  id: "practice-when-to-bomb-001",
  title: "对手剩 2 张，你有炸",
  level: "beginner",
  tags: ["炸弹", "残局", "牌权"],
  situation: "下家刚出对子抢回牌权。队友只剩 2 张，你手里有四张 A。",
  players: [
    {
      id: "top",
      name: "对家",
      position: "top",
      remainingCards: 2,
      role: "partner"
    },
    {
      id: "right",
      name: "下家",
      position: "right",
      remainingCards: 2,
      role: "opponent"
    },
    {
      id: "bottom",
      name: "我",
      position: "bottom",
      remainingCards: 6,
      role: "me"
    },
    {
      id: "left",
      name: "上家",
      position: "left",
      remainingCards: 5,
      role: "opponent"
    }
  ],
  myHand: [
    { id: "my-ha", suit: "heart", rank: "A" },
    { id: "my-sa", suit: "spade", rank: "A" },
    { id: "my-da", suit: "diamond", rank: "A" },
    { id: "my-ca", suit: "club", rank: "A" },
    { id: "my-h10", suit: "heart", rank: "10" },
    { id: "my-s10", suit: "spade", rank: "10" }
  ],
  history: [
    {
      playerId: "right",
      label: "下家出对子 K",
      cards: [
        { id: "history-hk", suit: "heart", rank: "K" },
        { id: "history-sk", suit: "spade", rank: "K" }
      ]
    }
  ],
  options: [
    {
      id: "a",
      label: "A",
      text: "直接炸四张 A"
    },
    {
      id: "b",
      label: "B",
      text: "先不炸，等队友接"
    },
    {
      id: "c",
      label: "C",
      text: "拆 A 出对子"
    }
  ],
  correctOptionId: "a",
  coachFeedback: {
    correct: {
      summary: "很好。",
      recommendation: "这里要抢回牌权。",
      reasons: ["队友快走完了。", "对手只剩 2 张，不能放。"],
      action: "correct"
    },
    wrong: {
      summary: "这里要炸。",
      recommendation: "先抢回牌权。",
      reasons: ["对手只剩 2 张。", "让他继续出牌风险太高。"],
      warning: "别把主动权送出去。",
      action: "wrong"
    }
  },
  replaySteps: [
    {
      id: "replay-1",
      title: "第一步：炸回牌权",
      cards: [
        { id: "replay-ha", suit: "heart", rank: "A" },
        { id: "replay-sa", suit: "spade", rank: "A" },
        { id: "replay-da", suit: "diamond", rank: "A" },
        { id: "replay-ca", suit: "club", rank: "A" }
      ],
      coachText: "先把危险压住。"
    },
    {
      id: "replay-2",
      title: "第二步：送队友",
      cards: [
        { id: "replay-h10", suit: "heart", rank: "10" },
        { id: "replay-s10", suit: "spade", rank: "10" }
      ],
      coachText: "再给队友创造机会。"
    }
  ],
  experience: 30
};

export const samplePracticeCases = [whenToBombPractice];

export function getPracticeById(practiceId: string) {
  return samplePracticeCases.find((practiceCase) => practiceCase.id === practiceId);
}
