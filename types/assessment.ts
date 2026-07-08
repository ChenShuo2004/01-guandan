export type AssessmentTier = "beginner" | "intermediate" | "advanced";

export type AbilityDimension =
  | "rules"
  | "pattern"
  | "initiative"
  | "bomb_timing"
  | "teamwork"
  | "risk_control"
  | "endgame";

export type AbilityStatus = "mastered" | "improving" | "weak";

export interface AssessmentOption {
  id: string;
  text: string;
}

export interface AssessmentCase {
  id: string;
  tier: AssessmentTier[];
  dimension: AbilityDimension;
  title: string;
  situation: string;
  coachHint: string;
  options: AssessmentOption[];
  correctOptionId: string;
  explanation: string;
  weight: number;
}

export interface AssessmentAnswer {
  caseId: string;
  optionId: string;
  isCorrect: boolean;
  answeredAt: string;
  hintUsed: boolean;
}

export type AssessmentSessionStatus = "active" | "paused" | "completed";

export interface AssessmentSession {
  id: string;
  tier: AssessmentTier;
  caseIds: string[];
  currentIndex: number;
  answers: AssessmentAnswer[];
  status: AssessmentSessionStatus;
  startedAt: string;
  completedAt?: string;
  mode: "initial" | "retest";
}

export interface AbilityDimensionScore {
  dimension: AbilityDimension;
  score: number;
  confidence: number;
  sampleCount: number;
  trendDelta: number;
  status: AbilityStatus;
}

export interface GrowthReport {
  reportId: string;
  sessionId: string;
  createdAt: string;
  currentLevel: "基础入门" | "稳定判断" | "进阶控牌" | "协同提升" | "高阶收束";
  dimensions: AbilityDimensionScore[];
  topStrengths: string[];
  mainWeaknesses: string[];
  aceDiagnosis: string;
  nextRecommendation: string;
  linkedLearningPathId?: string;
}

export type LearningPathNodeType = "lesson" | "mini_quiz" | "case_drill" | "review" | "retest";
export type LearningPathNodeStatus = "locked" | "available" | "in_progress" | "completed" | "deferred";

export interface LearningPathNode {
  id: string;
  type: LearningPathNodeType;
  targetAbility: AbilityDimension;
  title: string;
  description: string;
  completionRule: string;
  linkedResourceId: string;
  status: LearningPathNodeStatus;
}

export interface LearningPath {
  id: string;
  reportId: string;
  title: string;
  primaryDimension: AbilityDimension;
  nodes: LearningPathNode[];
  createdAt: string;
}

export interface AssessmentStore {
  selectedTier: AssessmentTier;
  sessions: AssessmentSession[];
  reports: GrowthReport[];
  paths: LearningPath[];
  activeSessionId?: string;
  latestReportId?: string;
  latestPathId?: string;
}
