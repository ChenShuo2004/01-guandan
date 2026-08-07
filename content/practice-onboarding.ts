export const practiceOnboarding = {
  entryDescription: "看自动牌局，记住关键牌，然后完成一次小测试。",
  eyebrow: "第一次训练，从这一局开始",
  title: "先看牌，再记牌，最后答题",
  description: "不需要会出牌。牌局会自动推进，你只要跟着提示观察关键牌。",
  steps: [
    {
      icon: "visibility",
      label: "第 1 步",
      title: "观看牌局",
      description: "牌局会自动推进"
    },
    {
      icon: "playing_cards",
      label: "第 2 步",
      title: "记住关键牌",
      description: "留意高亮提示的牌"
    },
    {
      icon: "quiz",
      label: "第 3 步",
      title: "完成测试",
      description: "暂停后回答记牌问题"
    }
  ],
  startLabel: "开始示范局",
  startHint: "自动推进 · 只需观察",
  manualLabel: "想先了解记牌方法",
  manualHref: "/training/memory-methods?returnTo=/practice"
} as const;
