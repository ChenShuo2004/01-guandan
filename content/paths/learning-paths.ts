export const learningPath = {
  id: "main-path",
  title: "新手到实战",
  currentLevel: 4,
  nodes: [
    {
      id: "rules",
      level: "Lv1",
      title: "认识规则",
      status: "completed",
      lessonId: undefined
    },
    {
      id: "cards",
      level: "Lv2",
      title: "识别牌型",
      status: "completed",
      lessonId: undefined
    },
    {
      id: "power",
      level: "Lv3",
      title: "判断牌力",
      status: "completed",
      lessonId: undefined
    },
    {
      id: "bomb-basics",
      level: "Lv4",
      title: "什么时候该炸",
      status: "current",
      lessonId: "when-to-bomb"
    },
    {
      id: "endgame",
      level: "Lv5",
      title: "残局训练",
      status: "locked",
      lessonId: undefined
    }
  ]
} as const;
