export type MemoryMethodCategory = "body" | "spatial" | "number" | "visual" | "player" | "hybrid";
export type MemoryMethodDifficulty = "beginner" | "intermediate" | "advanced";
export type MemoryMethodStatus = "not_started" | "learning" | "learned" | "mastered";

export interface MemoryMethodStep {
  id: string;
  title: string;
  description: string;
  tip?: string;
  visualType?: "foot" | "zones" | "numbers" | "snapshots" | "players" | "hybrid";
}

export interface MemoryMethodMistake {
  id: string;
  title: string;
  description: string;
}

export interface MemoryMethodScenario {
  id: string;
  title: string;
  initialState: string;
  event: string;
  calculation: string;
  result: string;
}

export interface MemoryMethod {
  id: string;
  number: string;
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  slogan: string;
  infographic: string;
  category: MemoryMethodCategory;
  difficulty: MemoryMethodDifficulty;
  recommended: boolean;
  featured: boolean;
  suitableFor: string[];
  useCases: string[];
  advantages: string[];
  limitations: string[];
  steps: MemoryMethodStep[];
  mistakes: MemoryMethodMistake[];
  scenarios: MemoryMethodScenario[];
  recommendedCards: string[];
  maxCardTypes: number;
  practicalRating: number;
  concealmentRating: number;
  updateSpeedRating: number;
}

export const categoryLabels: Record<MemoryMethodCategory, string> = {
  body: "身体动作",
  spatial: "空间记忆",
  number: "数字记忆",
  visual: "视觉记忆",
  player: "玩家推理",
  hybrid: "组合方法"
};

export const difficultyLabels: Record<MemoryMethodDifficulty, string> = {
  beginner: "入门",
  intermediate: "进阶",
  advanced: "高阶"
};

export const memoryMethods: MemoryMethod[] = [
  {
    id: "foot-position",
    number: "01",
    slug: "foot-position",
    title: "脚步定位记牌法",
    shortTitle: "脚步定位",
    summary: "左脚负责牌种，右脚负责数量。",
    slogan: "左脚选牌，右脚记数，看到就减，减完归位。",
    infographic: "/assets/memory-methods/foot-position.png",
    category: "body",
    difficulty: "beginner",
    recommended: true,
    featured: true,
    suitableFor: ["双手一直抓牌的人", "希望动作隐蔽的人", "刚开始建立记牌动作的人"],
    useCases: ["新手训练", "日常实战", "多牌记忆"],
    advantages: ["不占用双手", "牌种和数量分离", "动作隐蔽，容易形成条件反射"],
    limitations: ["初学时不宜同时记录太多牌种", "需要注意动作自然和身体放松"],
    recommendedCards: ["王", "级牌", "A"],
    maxCardTypes: 3,
    practicalRating: 5,
    concealmentRating: 5,
    updateSpeedRating: 4,
    steps: [
      { id: "choose", title: "确定记录牌种", description: "初学先选择王、级牌和 A，不要一次加入过多牌种。", tip: "固定映射，不要中途换位置。", visualType: "foot" },
      { id: "locate", title: "左脚定位牌种", description: "用脚尖、前脚掌、脚跟或方向，快速找到当前牌种。", visualType: "foot" },
      { id: "observe", title: "观察并减去", description: "看到牌桌出牌后，在心中完成数量加减。", tip: "只记剩余数量，不追完整出牌过程。", visualType: "foot" },
      { id: "update", title: "右脚更新数量", description: "将右脚切换到最新剩余数量，然后恢复自然状态。", visualType: "foot" }
    ],
    mistakes: [
      { id: "stomp", title: "连续踩地计数", description: "不要用明显的连续动作代替心算。" },
      { id: "forget-reset", title: "忘记恢复自然", description: "每次更新后放松双脚，避免动作僵硬。" },
      { id: "too-many", title: "同时记录过多牌种", description: "先稳定王、级牌、A，再逐步增加。" },
      { id: "roles", title: "左右脚职责混乱", description: "左脚只定位牌种，右脚只表达数量。" }
    ],
    scenarios: [
      { id: "ace-pair", title: "一对 A 被打出", initialState: "A 剩余 5 张", event: "其他玩家打出一对 A", calculation: "5 - 2 = 3", result: "A 剩余 3 张，右脚切换到脚跟位置" }
    ]
  },
  {
    id: "mental-zones",
    number: "02",
    slug: "mental-zones",
    title: "脑内分区记牌法",
    shortTitle: "脑内分区",
    summary: "一牌一区，只改数字，不换位置。",
    slogan: "固定区域，快速更新，扫描确认。",
    infographic: "/assets/memory-methods/mental-zones.png",
    category: "spatial",
    difficulty: "intermediate",
    recommended: false,
    featured: false,
    suitableFor: ["空间记忆较好的人", "不希望使用身体动作的人", "能同时管理三到五类牌的人"],
    useCases: ["新手训练", "日常实战", "多牌记忆"],
    advantages: ["完全无身体动作", "熟练后更新速度快", "可以同时管理多种牌"],
    limitations: ["空间区域容易串位", "疲劳时可能丢失数据"],
    recommendedCards: ["王", "级牌", "A", "K"],
    maxCardTypes: 4,
    practicalRating: 4,
    concealmentRating: 5,
    updateSpeedRating: 4,
    steps: [
      { id: "assign", title: "分配固定区域", description: "给每类重点牌分配一个固定位置，整局不改变。", visualType: "zones" },
      { id: "init", title: "记录初始数量", description: "开局把牌种和剩余数量放入对应区域。", visualType: "zones" },
      { id: "change", title: "只更新对应区域", description: "看到某类牌打出时，只修改那个区域的数字。", tip: "不要回忆完整出牌过程。", visualType: "zones" },
      { id: "scan", title: "每轮快速扫描", description: "一轮结束后扫过所有区域，确认数字没有串位。", visualType: "zones" }
    ],
    mistakes: [
      { id: "move-zone", title: "中途改变牌种位置", description: "位置一变，整个记忆地图都会变得不可靠。" },
      { id: "same-zone", title: "不同牌放进同一区域", description: "每个区域只负责一种牌。" },
      { id: "history", title: "记出牌过程而非剩余", description: "目标是保留当前数字，不是复述牌局。" },
      { id: "no-scan", title: "一轮后没有复查", description: "用短暂扫描修正小错误。" }
    ],
    scenarios: [
      { id: "zone-ace", title: "A 区域更新", initialState: "A 区域显示 8", event: "打出两张 A", calculation: "8 - 2 = 6", result: "A 区域更新为 6，其他区域保持不动" }
    ]
  },
  {
    id: "number-sequence",
    number: "03",
    slug: "number-sequence",
    title: "数字口令记牌法",
    shortTitle: "数字口令",
    summary: "固定牌种顺序，只更新对应数字。",
    slogan: "顺序不变，只改数字。",
    infographic: "/assets/memory-methods/number-sequence.png",
    category: "number",
    difficulty: "intermediate",
    recommended: false,
    featured: false,
    suitableFor: ["对数字敏感的人", "喜欢使用口诀的人", "短期记忆较强的人"],
    useCases: ["新手训练", "日常实战", "多牌记忆"],
    advantages: ["信息压缩效率高", "更新速度快", "适合快速复盘"],
    limitations: ["数字顺序混乱后难以恢复", "容易记住数字却忘记对应牌种"],
    recommendedCards: ["王", "级牌", "A", "K"],
    maxCardTypes: 4,
    practicalRating: 4,
    concealmentRating: 5,
    updateSpeedRating: 5,
    steps: [
      { id: "order", title: "固定牌种顺序", description: "例如王、级牌、A、K，整局保持同一顺序。", visualType: "numbers" },
      { id: "compress", title: "压缩成数字串", description: "把每种牌当前数量排列成一组短数字。", visualType: "numbers" },
      { id: "update", title: "单点更新", description: "有牌打出时只修改对应位置，不重排整组数字。", visualType: "numbers" },
      { id: "repeat", title: "一轮后默念", description: "每轮结束默念一次最新数字串，确认对应关系。", tip: "数字不要超过自己能稳定复述的长度。", visualType: "numbers" }
    ],
    mistakes: [
      { id: "order-change", title: "牌种顺序变化", description: "顺序固定才能让数字串保持可读。" },
      { id: "no-repeat", title: "更新后没有重新默念", description: "用一次短默念确认新状态。" },
      { id: "too-long", title: "数字串过长", description: "先从三到四类重点牌开始。" },
      { id: "forget-map", title: "忘记数字对应牌种", description: "开局先重复一次牌种顺序。" }
    ],
    scenarios: [
      { id: "number-update", title: "三八六八", initialState: "王｜级牌｜A｜K = 4｜8｜8｜8", event: "打出 1 张王、2 张 A", calculation: "4 - 1，8 - 2", result: "最新口令为 3｜8｜6｜8" }
    ]
  },
  {
    id: "visual-snapshot",
    number: "04",
    slug: "visual-snapshot",
    title: "画面快照记牌法",
    shortTitle: "画面快照",
    summary: "不追每张牌，只记关键节点的牌桌画面。",
    slogan: "不追每张牌，只记关键画面。",
    infographic: "/assets/memory-methods/visual-snapshot.png",
    category: "visual",
    difficulty: "intermediate",
    recommended: false,
    featured: false,
    suitableFor: ["视觉记忆较好的人", "容易记住画面的人", "喜欢整体判断局势的人"],
    useCases: ["日常实战", "残局判断", "对手分析"],
    advantages: ["降低持续计算压力", "更接近整体局势判断", "适合观察配合关系"],
    limitations: ["数量精确度较低", "容易漏掉中间的小牌变化"],
    recommendedCards: ["王", "级牌", "炸弹", "长顺子"],
    maxCardTypes: 4,
    practicalRating: 4,
    concealmentRating: 5,
    updateSpeedRating: 3,
    steps: [
      { id: "observe", title: "观察一轮出牌", description: "先看完整一轮，不急着记录每一张牌。", visualType: "snapshots" },
      { id: "pause", title: "节点停顿一瞬", description: "在一轮结束、炸弹或王出现时形成画面。", visualType: "snapshots" },
      { id: "mark", title: "抓住关键变化", description: "记住谁出了重点牌、谁的手牌明显减少。", visualType: "snapshots" },
      { id: "compare", title: "对比前后快照", description: "下一节点只比较画面发生了什么变化。", visualType: "snapshots" }
    ],
    mistakes: [
      { id: "small-cards", title: "试图记住所有小牌", description: "快照只保留关键变化。" },
      { id: "no-node", title: "没有固定快照节点", description: "优先使用一轮结束或进入残局等节点。" },
      { id: "vague", title: "画面过于模糊", description: "每次至少锁定一个牌种和一个玩家位置。" }
    ],
    scenarios: [
      { id: "snapshot-endgame", title: "进入残局", initialState: "中盘快照：对家手牌较多", event: "对家连续出完一组长牌", calculation: "对比前后手牌轮廓", result: "更新为对家可能保留控制牌的残局画面" }
    ]
  },
  {
    id: "player-association",
    number: "05",
    slug: "player-association",
    title: "玩家归属记牌法",
    shortTitle: "玩家归属",
    summary: "不只记出了什么，还记住是谁打出的。",
    slogan: "不只记牌，还要记是谁出的。",
    infographic: "/assets/memory-methods/player-association.png",
    category: "player",
    difficulty: "advanced",
    recommended: false,
    featured: false,
    suitableFor: ["已经会基础记牌的人", "需要判断手牌结构的人", "希望提升配合判断的人"],
    useCases: ["日常实战", "残局判断", "对手分析"],
    advantages: ["帮助判断手牌结构", "能预测后续牌型", "提升配合判断"],
    limitations: ["信息量较大", "必须先具备基础剩余数量记忆"],
    recommendedCards: ["王", "级牌", "A", "炸弹", "长顺子"],
    maxCardTypes: 5,
    practicalRating: 5,
    concealmentRating: 4,
    updateSpeedRating: 3,
    steps: [
      { id: "focus", title: "只关注三个对手", description: "先锁定上家、下家和对家，不扩展到无关信息。", visualType: "players" },
      { id: "record", title: "绑定重点牌", description: "把王、级牌、A、炸弹和长顺子绑定到玩家位置。", visualType: "players" },
      { id: "infer", title: "反推剩余结构", description: "根据牌型和玩家手牌变化推测其控制牌。", visualType: "players" },
      { id: "endgame", title: "残局判断", description: "进入残局后判断谁可能还留有控制牌。", visualType: "players" }
    ],
    mistakes: [
      { id: "too-much", title: "一次记录所有牌", description: "先记录重点牌和关键牌型。" },
      { id: "no-position", title: "忽略玩家位置", description: "牌面必须与上家、下家或对家绑定。" },
      { id: "skip-basic", title: "基础数量还不稳定就进阶", description: "先保证能稳定记住剩余数量。" }
    ],
    scenarios: [
      { id: "player-bomb", title: "对家出现炸弹", initialState: "对家记录：未出现炸弹", event: "对家打出一组炸弹", calculation: "对家炸弹记录 +1", result: "更新对家控制牌标签，调整残局判断" }
    ]
  },
  {
    id: "hybrid-system",
    number: "06",
    slug: "hybrid-system",
    title: "混合组合记牌法",
    shortTitle: "混合组合",
    summary: "让不同方法各自负责一种信息，互不重复。",
    slogan: "一种方法管一类信息，不重复，不冲突。",
    infographic: "/assets/memory-methods/hybrid-system.png",
    category: "hybrid",
    difficulty: "advanced",
    recommended: false,
    featured: false,
    suitableFor: ["已经掌握一种基础方法的人", "需要记录更多信息的人", "从基础进入实战推理的人"],
    useCases: ["日常实战", "残局判断", "多牌记忆", "对手分析"],
    advantages: ["可按信息类型分工", "兼顾精确数量和整体局势", "适合逐步扩展"],
    limitations: ["组合过多容易混乱", "需要先熟练掌握单一方法"],
    recommendedCards: ["王", "级牌", "A", "K", "炸弹"],
    maxCardTypes: 5,
    practicalRating: 5,
    concealmentRating: 4,
    updateSpeedRating: 3,
    steps: [
      { id: "choose", title: "选择两种方法", description: "先从脚步、数字、分区或快照中选择两种。", visualType: "hybrid" },
      { id: "assign", title: "分配信息职责", description: "每种方法只负责一类信息，不让两种方法重复记录。", visualType: "hybrid" },
      { id: "practice", title: "单独验证", description: "分别测试每种方法，再放入同一局牌中。", visualType: "hybrid" },
      { id: "fallback", title: "混乱时退回单一方法", description: "疲劳或信息过载时，立即回到最稳定的方法。", tip: "最多同时使用三种方法。", visualType: "hybrid" }
    ],
    mistakes: [
      { id: "duplicate", title: "两种方法重复记录", description: "重复会增加负担，也容易产生冲突。" },
      { id: "too-many", title: "同时使用超过三种", description: "组合是为了减负，不是为了堆叠。" },
      { id: "skip-base", title: "没有单独练熟就组合", description: "先掌握单一方法，再进入组合训练。" }
    ],
    scenarios: [
      { id: "hybrid-plan", title: "脚步加快照", initialState: "脚步记录王、级牌、A", event: "快照记录对家手牌轮廓和炸弹", calculation: "精确数量与整体画面分工", result: "脚步负责精确，快照负责局势，信息互不冲突" }
    ]
  }
];

export function getMemoryMethodBySlug(slug: string) {
  return memoryMethods.find((method) => method.slug === slug);
}
