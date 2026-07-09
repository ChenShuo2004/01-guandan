import type { CoachResponse } from "@/types/coach";
import type { PracticeCase, PracticePlayerState } from "@/types/practice";
import type { PokerCardData } from "@/types/poker";

const defaultPlayers: PracticePlayerState[] = [
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
];

function card(id: string, suit: NonNullable<PokerCardData["suit"]>, rank: PokerCardData["rank"]): PokerCardData {
  return { id, suit, rank };
}

function correctFeedback(summary: string, recommendation: string, reasons: string[]): CoachResponse {
  return {
    summary,
    recommendation,
    reasons,
    action: "correct"
  };
}

function wrongFeedback(
  summary: string,
  recommendation: string,
  reasons: string[],
  warning: string
): CoachResponse {
  return {
    summary,
    recommendation,
    reasons,
    warning,
    action: "wrong"
  };
}

export const whenToBombPractice: PracticeCase = {
  id: "practice-when-to-bomb-001",
  title: "对手剩 2 张，你有炸",
  level: "beginner",
  tags: ["炸弹", "残局", "牌权"],
  situation: "下家刚出对子抢回牌权。队友只剩 2 张，你手里有四张 A。",
  players: defaultPlayers,
  myHand: [
    card("bomb-1-ha", "heart", "A"),
    card("bomb-1-sa", "spade", "A"),
    card("bomb-1-da", "diamond", "A"),
    card("bomb-1-ca", "club", "A"),
    card("bomb-1-h10", "heart", "10"),
    card("bomb-1-s10", "spade", "10")
  ],
  history: [
    {
      playerId: "right",
      label: "下家出对子 K",
      cards: [card("bomb-1-hk", "heart", "K"), card("bomb-1-sk", "spade", "K")]
    }
  ],
  options: [
    { id: "a", label: "A", text: "直接炸四张 A" },
    { id: "b", label: "B", text: "先不炸，等队友接" },
    { id: "c", label: "C", text: "拆 A 出对子" }
  ],
  correctOptionId: "a",
  coachFeedback: {
    correct: correctFeedback("很好。", "这里要抢回牌权。", [
      "队友快走完了。",
      "对手只剩 2 张，不能放。"
    ]),
    wrong: wrongFeedback("这里要炸。", "先抢回牌权。", [
      "对手只剩 2 张。",
      "让他继续出牌风险太高。"
    ], "别把主动权送出去。")
  },
  replaySteps: [
    {
      id: "replay-bomb-1",
      title: "第一步：炸回牌权",
      cards: [
        card("replay-bomb-1-ha", "heart", "A"),
        card("replay-bomb-1-sa", "spade", "A"),
        card("replay-bomb-1-da", "diamond", "A"),
        card("replay-bomb-1-ca", "club", "A")
      ],
      coachText: "先把危险压住。"
    },
    {
      id: "replay-bomb-2",
      title: "第二步：送队友走",
      cards: [card("replay-bomb-2-h10", "heart", "10"), card("replay-bomb-2-s10", "spade", "10")],
      coachText: "再给队友创造机会。"
    }
  ],
  experience: 30
};

export const whenNotToBombPractice: PracticeCase = {
  id: "practice-when-not-to-bomb-001",
  title: "能压，不等于该炸",
  level: "beginner",
  tags: ["炸弹", "克制", "牌权"],
  situation: "上家出了单张 Q。你能用四张 9 炸掉，但对手手牌还多，队友也没有冲刺机会。",
  players: [
    { ...defaultPlayers[0], remainingCards: 7 },
    { ...defaultPlayers[1], remainingCards: 8 },
    { ...defaultPlayers[2], remainingCards: 8 },
    { ...defaultPlayers[3], remainingCards: 9 }
  ],
  myHand: [
    card("restraint-1-h9", "heart", "9"),
    card("restraint-1-s9", "spade", "9"),
    card("restraint-1-d9", "diamond", "9"),
    card("restraint-1-c9", "club", "9"),
    card("restraint-1-ha", "heart", "A"),
    card("restraint-1-s7", "spade", "7")
  ],
  history: [
    {
      playerId: "left",
      label: "上家出单 Q",
      cards: [card("restraint-1-sq", "spade", "Q")]
    }
  ],
  options: [
    { id: "a", label: "A", text: "炸四张 9 抢牌权" },
    { id: "b", label: "B", text: "用 A 压住，保留炸弹" },
    { id: "c", label: "C", text: "直接过牌" }
  ],
  correctOptionId: "b",
  coachFeedback: {
    correct: correctFeedback("这手很稳。", "用大牌过渡，炸弹先留着。", [
      "对手手牌还多。",
      "现在炸收益不集中。"
    ]),
    wrong: wrongFeedback("这里别急着炸。", "炸弹要换关键牌权。", [
      "当前只是单张 Q。",
      "四张 9 后面更有价值。"
    ], "别用炸弹换情绪。")
  },
  replaySteps: [
    {
      id: "replay-restraint-1",
      title: "第一步：用 A 接住",
      cards: [card("replay-restraint-ha", "heart", "A")],
      coachText: "先用低成本方式拿回节奏。"
    },
    {
      id: "replay-restraint-2",
      title: "第二步：保留炸弹",
      cards: [
        card("replay-restraint-h9", "heart", "9"),
        card("replay-restraint-s9", "spade", "9"),
        card("replay-restraint-d9", "diamond", "9"),
        card("replay-restraint-c9", "club", "9")
      ],
      coachText: "炸弹留给对手冲刺或队友需要保护时。"
    }
  ],
  experience: 20
};

export const partnerSupportPractice: PracticeCase = {
  id: "practice-partner-support-001",
  title: "队友剩 1 张，先看能不能送",
  level: "beginner",
  tags: ["队友", "配合", "送牌"],
  situation: "对家只剩 1 张牌。你刚拿回牌权，手里有一张小 6 和一对 J。",
  players: [
    { ...defaultPlayers[0], remainingCards: 1 },
    { ...defaultPlayers[1], remainingCards: 6 },
    { ...defaultPlayers[2], remainingCards: 5 },
    { ...defaultPlayers[3], remainingCards: 8 }
  ],
  myHand: [
    card("support-1-h6", "heart", "6"),
    card("support-1-hj", "heart", "J"),
    card("support-1-sj", "spade", "J"),
    card("support-1-da", "diamond", "A"),
    card("support-1-ca", "club", "A")
  ],
  history: [
    {
      playerId: "right",
      label: "下家过牌，你获得牌权",
      cards: []
    }
  ],
  options: [
    { id: "a", label: "A", text: "先出单 6，给队友接" },
    { id: "b", label: "B", text: "出对 J，减少手数" },
    { id: "c", label: "C", text: "出 A 控制局面" }
  ],
  correctOptionId: "a",
  coachFeedback: {
    correct: correctFeedback("方向对。", "队友快走时，先送他能接的牌。", [
      "对家只剩 1 张。",
      "单 6 成本最低。"
    ]),
    wrong: wrongFeedback("先看队友。", "这手目标不是自己减手数。", [
      "队友只剩 1 张。",
      "你要先创造出牌口。"
    ], "别只看自己的手牌。")
  },
  replaySteps: [
    {
      id: "replay-support-1",
      title: "第一步：出低单",
      cards: [card("replay-support-h6", "heart", "6")],
      coachText: "让队友有机会直接走完。"
    },
    {
      id: "replay-support-2",
      title: "第二步：保留控制牌",
      cards: [card("replay-support-da", "diamond", "A"), card("replay-support-ca", "club", "A")],
      coachText: "如果队友没接上，再用大牌重新控场。"
    }
  ],
  experience: 20
};

export const defenseBlockingPractice: PracticeCase = {
  id: "practice-defense-blocking-001",
  title: "对手快走，先拦住",
  level: "beginner",
  tags: ["防守", "拦截", "风险"],
  situation: "下家只剩 1 张。上家打出单 8 后轮到你，你手里有 K 和小对子。",
  players: [
    { ...defaultPlayers[0], remainingCards: 4 },
    { ...defaultPlayers[1], remainingCards: 1 },
    { ...defaultPlayers[2], remainingCards: 5 },
    { ...defaultPlayers[3], remainingCards: 6 }
  ],
  myHand: [
    card("block-1-hk", "heart", "K"),
    card("block-1-s7", "spade", "7"),
    card("block-1-d7", "diamond", "7"),
    card("block-1-h4", "heart", "4"),
    card("block-1-c4", "club", "4")
  ],
  history: [
    {
      playerId: "left",
      label: "上家出单 8",
      cards: [card("block-1-h8", "heart", "8")]
    }
  ],
  options: [
    { id: "a", label: "A", text: "用 K 压住单 8" },
    { id: "b", label: "B", text: "过牌，省一张 K" },
    { id: "c", label: "C", text: "拆对子出 7" }
  ],
  correctOptionId: "a",
  coachFeedback: {
    correct: correctFeedback("必须拦。", "对手只剩 1 张，不能让他舒服接牌。", [
      "单张最容易让下家走。",
      "K 的价值是挡住风险。"
    ]),
    wrong: wrongFeedback("这里不能放。", "先切断下家的单张通道。", [
      "下家只剩 1 张。",
      "过牌会把机会送过去。"
    ], "防守局别太省牌。")
  },
  replaySteps: [
    {
      id: "replay-block-1",
      title: "第一步：K 压住",
      cards: [card("replay-block-hk", "heart", "K")],
      coachText: "先阻断对手的出牌口。"
    },
    {
      id: "replay-block-2",
      title: "第二步：再处理对子",
      cards: [card("replay-block-s7", "spade", "7"), card("replay-block-d7", "diamond", "7")],
      coachText: "安全后再考虑减少自己的手数。"
    }
  ],
  experience: 20
};

export const looseHandManagementPractice: PracticeCase = {
  id: "practice-loose-hand-management-001",
  title: "散牌要早点找出口",
  level: "beginner",
  tags: ["散牌", "手数", "整理"],
  situation: "你拿到牌权，手里有多张小散牌和一对 Q。当前没有人冲刺。",
  players: [
    { ...defaultPlayers[0], remainingCards: 6 },
    { ...defaultPlayers[1], remainingCards: 7 },
    { ...defaultPlayers[2], remainingCards: 7 },
    { ...defaultPlayers[3], remainingCards: 8 }
  ],
  myHand: [
    card("loose-1-h3", "heart", "3"),
    card("loose-1-s5", "spade", "5"),
    card("loose-1-d8", "diamond", "8"),
    card("loose-1-hq", "heart", "Q"),
    card("loose-1-sq", "spade", "Q"),
    card("loose-1-ca", "club", "A")
  ],
  history: [],
  options: [
    { id: "a", label: "A", text: "先出单 3 处理散牌" },
    { id: "b", label: "B", text: "先出对 Q 减少手数" },
    { id: "c", label: "C", text: "先出 A 抢节奏" }
  ],
  correctOptionId: "a",
  coachFeedback: {
    correct: correctFeedback("很好。", "散牌越早处理，后面越轻。", [
      "现在没人冲刺。",
      "小单张后期更难走。"
    ]),
    wrong: wrongFeedback("先清散牌。", "别把小牌留到残局。", [
      "当前有主动权。",
      "小 3 是最难处理的牌。"
    ], "别只盯着成组牌。")
  },
  replaySteps: [
    {
      id: "replay-loose-1",
      title: "第一步：先走小单",
      cards: [card("replay-loose-h3", "heart", "3")],
      coachText: "主动权在手时，先清最难走的散牌。"
    },
    {
      id: "replay-loose-2",
      title: "第二步：保留成组牌",
      cards: [card("replay-loose-hq", "heart", "Q"), card("replay-loose-sq", "spade", "Q")],
      coachText: "对子后面更容易找到出手机会。"
    }
  ],
  experience: 20
};

export const highCardDecisionPractice: PracticeCase = {
  id: "practice-high-card-decision-001",
  title: "大牌要服务节奏",
  level: "beginner",
  tags: ["大牌", "节奏", "取舍"],
  situation: "上家出单 J。你有大王和 A，但对家手牌还多，对手也没有明显冲刺。",
  players: [
    { ...defaultPlayers[0], remainingCards: 8 },
    { ...defaultPlayers[1], remainingCards: 6 },
    { ...defaultPlayers[2], remainingCards: 6 },
    { ...defaultPlayers[3], remainingCards: 7 }
  ],
  myHand: [
    { id: "high-1-bj", rank: "BJ" },
    card("high-1-ha", "heart", "A"),
    card("high-1-sq", "spade", "Q"),
    card("high-1-d9", "diamond", "9"),
    card("high-1-c6", "club", "6")
  ],
  history: [
    {
      playerId: "left",
      label: "上家出单 J",
      cards: [card("high-1-hj", "heart", "J")]
    }
  ],
  options: [
    { id: "a", label: "A", text: "用 A 压住" },
    { id: "b", label: "B", text: "直接出大王" },
    { id: "c", label: "C", text: "过牌保留大牌" }
  ],
  correctOptionId: "a",
  coachFeedback: {
    correct: correctFeedback("选择合理。", "A 能接住局面，大王先留。", [
      "当前风险不高。",
      "最大牌要留给关键回合。"
    ]),
    wrong: wrongFeedback("大王别太早交。", "先用足够大的牌接住。", [
      "单 J 不值得用最大牌。",
      "后面可能需要大王救场。"
    ], "大牌不是越早出越好。")
  },
  replaySteps: [
    {
      id: "replay-high-1",
      title: "第一步：A 接住",
      cards: [card("replay-high-ha", "heart", "A")],
      coachText: "用刚好够的牌拿回节奏。"
    },
    {
      id: "replay-high-2",
      title: "第二步：保留大王",
      cards: [{ id: "replay-high-bj", rank: "BJ" }],
      coachText: "最大牌留给对手冲刺或关键送队友。"
    }
  ],
  experience: 20
};

export const fullGameReviewPractice: PracticeCase = {
  id: "practice-full-game-review-001",
  title: "复盘先找最大问题",
  level: "beginner",
  tags: ["复盘", "总结", "成长"],
  situation: "这局你输了。关键回合里，你早早交出炸弹，后面没牌权拦住对手收尾。",
  players: [
    { ...defaultPlayers[0], remainingCards: 0 },
    { ...defaultPlayers[1], remainingCards: 1 },
    { ...defaultPlayers[2], remainingCards: 3 },
    { ...defaultPlayers[3], remainingCards: 0 }
  ],
  myHand: [
    card("review-1-h5", "heart", "5"),
    card("review-1-s8", "spade", "8"),
    card("review-1-dk", "diamond", "K")
  ],
  history: [
    {
      playerId: "bottom",
      label: "你在中局炸了四张 8",
      cards: [
        card("review-1-h8", "heart", "8"),
        card("review-1-s8-history", "spade", "8"),
        card("review-1-d8", "diamond", "8"),
        card("review-1-c8", "club", "8")
      ]
    }
  ],
  options: [
    { id: "a", label: "A", text: "最大问题是早交炸弹" },
    { id: "b", label: "B", text: "最大问题是手牌太散" },
    { id: "c", label: "C", text: "最大问题是没有出大牌" }
  ],
  correctOptionId: "a",
  coachFeedback: {
    correct: correctFeedback("复盘抓对了。", "这局输在关键资源交得太早。", [
      "炸弹是残局控制牌。",
      "早交后就拦不住对手。"
    ]),
    wrong: wrongFeedback("先看最大损失。", "这局关键不是散牌，而是炸弹时机。", [
      "你中局交了控制资源。",
      "残局没有办法拦截。"
    ], "复盘一次只抓一个主因。")
  },
  replaySteps: [
    {
      id: "replay-review-1",
      title: "第一步：标记关键错误",
      cards: [
        card("replay-review-h8", "heart", "8"),
        card("replay-review-s8", "spade", "8"),
        card("replay-review-d8", "diamond", "8"),
        card("replay-review-c8", "club", "8")
      ],
      coachText: "这手炸弹应该留到对手进入冲刺时。"
    },
    {
      id: "replay-review-2",
      title: "第二步：形成下一次规则",
      cards: [card("replay-review-dk", "diamond", "K")],
      coachText: "下次先问：这手牌能不能改变局势。"
    }
  ],
  experience: 30
};

export const samplePracticeCases = [
  whenToBombPractice,
  whenNotToBombPractice,
  partnerSupportPractice,
  defenseBlockingPractice,
  looseHandManagementPractice,
  highCardDecisionPractice,
  fullGameReviewPractice
];

export function getPracticeById(practiceId: string) {
  return samplePracticeCases.find((practiceCase) => practiceCase.id === practiceId);
}
