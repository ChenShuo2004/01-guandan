import type { CardTrackerSnapshot } from "./CardTracker";

export type MemoryQuestionType = "quantity" | "joker" | "inference";

export interface MemoryQuestion {
  type: MemoryQuestionType;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  category: "大牌追踪" | "数量计算" | "残局判断";
}

const playerLabels: Record<string, string> = {
  player: "AI1",
  enemyAI1: "AI2",
  partnerAI: "AI3",
  enemyAI2: "AI4"
};

export function createMemoryQuestion(snapshot: CardTrackerSnapshot, checkpoint: number): MemoryQuestion {
  if (checkpoint % 3 === 0) {
    const answer = String(snapshot.jokerAppeared);
    return {
      type: "joker",
      prompt: "目前大小王出了几张？",
      options: ["0", "1", "2", "3", "4"],
      answer,
      explanation: `你需要同时追踪小王和大王。目前已出现 ${answer} 张。`,
      category: "大牌追踪"
    };
  }

  if (checkpoint % 3 === 2) {
    const counts = Object.entries(snapshot.remaining)
      .filter(([label]) => ["A", "2", "SJ", "BJ"].includes(label))
      .sort(([, left], [, right]) => left - right);
    const [target, left] = counts[0] ?? ["A", 4];
    return {
      type: "quantity",
      prompt: `目前还有多少张${target}没有出现？`,
      options: ["0", "1", "2", "3", "4"],
      answer: String(left),
      explanation: `${target}总共有 ${target === "SJ" || target === "BJ" ? 1 : 4} 张，已出现的牌要从总数中扣除。`,
      category: "数量计算"
    };
  }

  const counts = Object.entries(snapshot.remaining).filter(([label]) => ["A", "2", "SJ", "BJ"].includes(label));
  const strongest = counts.sort(([, left], [, right]) => left - right)[0]?.[0] ?? "A";
  const answer = playerLabels[snapshot.events.at(-1)?.player ?? "player"] ?? "AI1";
  return {
    type: "inference",
    prompt: `根据目前牌面，你认为谁更可能拥有${strongest}的控制牌？`,
    options: ["AI1", "AI2", "AI3", "AI4"],
    answer,
    explanation: "先回忆最近几轮谁保留了更多手牌，再结合关键大牌的出现情况做推理。",
    category: "残局判断"
  };
}
