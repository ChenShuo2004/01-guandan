import type { Quiz } from "@/types/quiz";

export const whenToBombQuiz: Quiz = {
  id: "quiz-when-to-bomb-001",
  question: "对手刚抢回牌权，队友还有 2 张。你现在该怎么做？",
  options: [
    {
      id: "a",
      label: "A",
      text: "直接炸，自己先爽"
    },
    {
      id: "b",
      label: "B",
      text: "先观察队友能不能接"
    },
    {
      id: "c",
      label: "C",
      text: "随便过，等下一轮"
    }
  ],
  correctOptionId: "b",
  coachFeedback: {
    correct: {
      summary: "很好。",
      recommendation: "先看队友。",
      reasons: ["队友快走完了。", "炸弹要改变局势。"],
      action: "correct"
    },
    wrong: {
      summary: "别急。",
      recommendation: "这里先看队友。",
      reasons: ["现在乱炸，可能断掉队友节奏。"],
      warning: "炸弹不是用来爽的。",
      action: "wrong"
    }
  }
};

export const sampleQuizzes = [whenToBombQuiz];
