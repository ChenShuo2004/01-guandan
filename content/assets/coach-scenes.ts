import type { CoachAction } from "@/types/coach";

export type CoachSceneStatus = "ready" | "reference" | "missing";

export interface CoachSceneAsset {
  id: string;
  promptIndex: number;
  title: string;
  usage: string;
  assetId?: string;
  status: CoachSceneStatus;
  sourceImage?: string;
  note?: string;
}

export const coachScenes: CoachSceneAsset[] = [
  {
    id: "home-welcome",
    promptIndex: 1,
    title: "首页欢迎场景",
    usage: "首页首屏",
    assetId: "coach-home-welcome",
    sourceImage: "Image #3",
    status: "ready",
    note: "当前文件是方形欢迎图，但 PNG 没有真实透明通道，正式首屏前建议重抠或替换。"
  },
  {
    id: "daily-training-briefing",
    promptIndex: 2,
    title: "今日训练任务发布",
    usage: "首页 Daily Training 卡片",
    status: "missing",
    note: "本批图片里没有清晰的单张任务面板图。"
  },
  {
    id: "analysis-mode",
    promptIndex: 3,
    title: "牌局分析模式",
    usage: "AI 分析页面",
    assetId: "coach-analysis-mode",
    sourceImage: "Image #7",
    status: "ready"
  },
  {
    id: "error-feedback",
    promptIndex: 4,
    title: "错误反馈 / 复盘提醒",
    usage: "训练失败反馈",
    assetId: "coach-error-feedback",
    sourceImage: "Image #8",
    status: "ready"
  },
  {
    id: "victory-celebration",
    promptIndex: 5,
    title: "胜利庆祝",
    usage: "完成训练、升级动画",
    assetId: "coach-victory-celebration",
    sourceImage: "Image #5",
    status: "ready",
    note: "当前更像完成后的开心挥手，可先用于成功反馈。"
  },
  {
    id: "endgame-thinking",
    promptIndex: 6,
    title: "思考残局模式",
    usage: "残局训练",
    assetId: "coach-endgame-thinking",
    sourceImage: "Image #1",
    status: "ready"
  },
  {
    id: "streak-encouragement",
    promptIndex: 7,
    title: "鼓励用户坚持训练",
    usage: "连续训练奖励",
    assetId: "coach-streak-encouragement",
    sourceImage: "Image #9",
    status: "ready"
  },
  {
    id: "lesson-teaching",
    promptIndex: 8,
    title: "高手教学模式",
    usage: "课程 Lesson",
    assetId: "coach-lesson-pose-sheet",
    sourceImage: "Image #2",
    status: "reference",
    note: "这是多姿态合成图，适合作为角色姿态参考；直接上 UI 前建议裁成单个教学姿势。"
  },
  {
    id: "coach-bubble",
    promptIndex: 9,
    title: "AI 提示助手浮现",
    usage: "游戏内 Coach Bubble",
    assetId: "coach-bubble-hologram",
    sourceImage: "Image #4",
    status: "ready"
  },
  {
    id: "master-certification",
    promptIndex: 10,
    title: "等级升级 / 大师认证",
    usage: "成长系统",
    assetId: "coach-master-certification",
    sourceImage: "Image #6",
    status: "ready"
  }
];

export const coachActionAssetId: Partial<Record<CoachAction, string>> = {
  idle: "coach-bubble-hologram",
  wave: "coach-bubble-hologram",
  thinking: "coach-endgame-thinking",
  point: "coach-analysis-mode",
  warning: "coach-error-feedback",
  wrong: "coach-error-feedback",
  happy: "coach-streak-encouragement",
  correct: "coach-streak-encouragement",
  celebrate: "coach-victory-celebration"
};

export function getCoachSceneByAssetId(assetId: string) {
  return coachScenes.find((scene) => scene.assetId === assetId);
}
