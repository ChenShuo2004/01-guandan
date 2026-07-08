import type { AssessmentCase, AbilityDimension } from "@/types/assessment";

export const abilityLabels: Record<AbilityDimension, string> = {
  rules: "规则理解",
  pattern: "牌型识别",
  initiative: "牌权意识",
  bomb_timing: "炸弹时机",
  teamwork: "队友配合",
  risk_control: "风险控制",
  endgame: "残局能力"
};

export const assessmentCases: AssessmentCase[] = [
  {
    id: "assess-bomb-timing-001",
    tier: ["beginner", "intermediate", "advanced"],
    dimension: "bomb_timing",
    title: "炸弹要不要现在用",
    situation: "上家刚出一对 A，队友只剩 2 张，对手还有 7 张。你手里有四个 8。",
    coachHint: "先看炸弹能不能帮队友走完。",
    options: [
      { id: "a", text: "马上炸，自己抢牌权" },
      { id: "b", text: "不急，先让队友有机会接" },
      { id: "c", text: "随便过，等下一轮再说" }
    ],
    correctOptionId: "b",
    explanation: "队友只剩 2 张时，炸弹的价值是保护队友走完，不是提前消耗。",
    weight: 1.2
  },
  {
    id: "assess-initiative-001",
    tier: ["beginner", "intermediate", "advanced"],
    dimension: "initiative",
    title: "你拿到牌权后先出什么",
    situation: "你手里散牌很多，但有一组三带二和一个小顺子。当前没人压你。",
    coachHint: "有牌权时先处理最难走的结构。",
    options: [
      { id: "a", text: "先出小顺子，减少散牌压力" },
      { id: "b", text: "先出最大单张，试探对手" },
      { id: "c", text: "先拆三带二，保留顺子" }
    ],
    correctOptionId: "a",
    explanation: "主动轮要优先把难处理的连续结构走掉，别把散牌留到残局。",
    weight: 1
  },
  {
    id: "assess-teamwork-001",
    tier: ["beginner", "intermediate", "advanced"],
    dimension: "teamwork",
    title: "队友快走时怎么配合",
    situation: "对家剩 1 张，你能压住对手这一手，但压完会只剩小单张。",
    coachHint: "团队最优先于个人舒服。",
    options: [
      { id: "a", text: "压住，让队友下轮有机会走" },
      { id: "b", text: "不压，保留自己的牌型" },
      { id: "c", text: "拆炸弹压，保证自己有牌权" }
    ],
    correctOptionId: "a",
    explanation: "队友临门一脚时，先保护团队出路，个人牌型可以让位。",
    weight: 1
  },
  {
    id: "assess-risk-001",
    tier: ["intermediate", "advanced"],
    dimension: "risk_control",
    title: "能压不等于该压",
    situation: "下家只剩 3 张，你可以用大王压住，但压完只剩三张散牌。",
    coachHint: "先判断压完之后谁更舒服。",
    options: [
      { id: "a", text: "大王压住，先把牌权拿回来" },
      { id: "b", text: "不压，保留大王等关键轮次" },
      { id: "c", text: "拆对子压，减少手牌数量" }
    ],
    correctOptionId: "b",
    explanation: "压牌后自己没有连续出路时，保留控制牌比一时抢权更稳。",
    weight: 1.1
  },
  {
    id: "assess-endgame-001",
    tier: ["beginner", "intermediate", "advanced"],
    dimension: "endgame",
    title: "最后 5 张怎么收尾",
    situation: "你剩 3344K，当前你有牌权，对手最少还剩 4 张。",
    coachHint: "残局先找一次性减少手牌的打法。",
    options: [
      { id: "a", text: "先出 K" },
      { id: "b", text: "先出 3344" },
      { id: "c", text: "先出一对 3" }
    ],
    correctOptionId: "b",
    explanation: "先走连对能一次减少 4 张，残局要避免把自己拆成散张。",
    weight: 1
  },
  {
    id: "assess-pattern-001",
    tier: ["beginner"],
    dimension: "pattern",
    title: "先识别牌型",
    situation: "你看到 667788，这组牌最适合按什么理解？",
    coachHint: "看它是不是连续对子。",
    options: [
      { id: "a", text: "三连对" },
      { id: "b", text: "三张 6 带两张" },
      { id: "c", text: "普通顺子" }
    ],
    correctOptionId: "a",
    explanation: "667788 是连续三组对子，适合按连对处理。",
    weight: 0.9
  }
];
