import type { MemoryQuestion } from "./MemoryQuestionGenerator";

export interface MemoryAnswerRecord {
  question: MemoryQuestion;
  answer: string;
  correct: boolean;
}

export function buildMemoryReport(records: MemoryAnswerRecord[]) {
  const correct = records.filter((record) => record.correct).length;
  const rate = records.length ? Math.round((correct / records.length) * 100) : 0;
  const score = (category: MemoryQuestion["category"]) => {
    const group = records.filter((record) => record.question.category === category);
    if (!group.length) return 0;
    return Math.max(1, Math.round((group.filter((record) => record.correct).length / group.length) * 5));
  };
  const weakest = ["大牌追踪", "数量计算", "残局判断"]
    .map((category) => ({ category: category as MemoryQuestion["category"], score: score(category as MemoryQuestion["category"]) }))
    .sort((left, right) => left.score - right.score)[0];

  return {
    accuracy: rate,
    categories: {
      大牌追踪: score("大牌追踪"),
      数量计算: score("数量计算"),
      残局判断: score("残局判断")
    },
    advice: weakest?.score < 4 ? `下一阶段建议加强${weakest.category}的追踪。` : "保持这个节奏，下一阶段可以挑战更复杂的残局推理。"
  };
}
