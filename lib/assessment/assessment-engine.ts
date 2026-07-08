import { abilityLabels, assessmentCases } from "@/content/assessment/cases";
import type {
  AbilityDimension,
  AbilityDimensionScore,
  AssessmentAnswer,
  AssessmentCase,
  AssessmentSession,
  AssessmentStore,
  AssessmentTier,
  GrowthReport,
  LearningPath,
  LearningPathNode
} from "@/types/assessment";

export const assessmentStorageKey = "guandan-ai-coach-assessment-v2";

const allDimensions: AbilityDimension[] = [
  "rules",
  "pattern",
  "initiative",
  "bomb_timing",
  "teamwork",
  "risk_control",
  "endgame"
];

export const defaultAssessmentStore: AssessmentStore = {
  selectedTier: "beginner",
  sessions: [],
  reports: [],
  paths: []
};

export function createAssessmentSession(
  store: AssessmentStore,
  tier: AssessmentTier,
  mode: "initial" | "retest" = "initial"
): AssessmentStore {
  const availableCases = getCasesForTier(tier);
  const now = new Date().toISOString();
  const session: AssessmentSession = {
    id: `assessment-${Date.now()}`,
    tier,
    caseIds: availableCases.slice(0, 5).map((item) => item.id),
    currentIndex: 0,
    answers: [],
    status: "active",
    startedAt: now,
    mode
  };

  return {
    ...store,
    selectedTier: tier,
    activeSessionId: session.id,
    sessions: [session, ...store.sessions]
  };
}

export function getCasesForTier(tier: AssessmentTier) {
  return assessmentCases.filter((item) => item.tier.includes(tier));
}

export function getSession(store: AssessmentStore, sessionId: string) {
  return store.sessions.find((session) => session.id === sessionId);
}

export function getCase(caseId: string) {
  return assessmentCases.find((item) => item.id === caseId);
}

export function getCurrentCase(session?: AssessmentSession) {
  if (!session) return undefined;
  return getCase(session.caseIds[session.currentIndex]);
}

export function submitAssessmentAnswer(
  store: AssessmentStore,
  sessionId: string,
  optionId: string,
  hintUsed: boolean
): AssessmentStore {
  const session = getSession(store, sessionId);
  const currentCase = getCurrentCase(session);

  if (!session || !currentCase || session.status !== "active") {
    return store;
  }

  if (session.answers.some((answer) => answer.caseId === currentCase.id)) {
    return store;
  }

  const answer: AssessmentAnswer = {
    caseId: currentCase.id,
    optionId,
    isCorrect: optionId === currentCase.correctOptionId,
    answeredAt: new Date().toISOString(),
    hintUsed
  };

  return updateSession(store, {
    ...session,
    answers: [...session.answers, answer]
  });
}

export function goToNextAssessmentCase(store: AssessmentStore, sessionId: string): AssessmentStore {
  const session = getSession(store, sessionId);

  if (!session) return store;

  const nextIndex = session.currentIndex + 1;
  const completed = nextIndex >= session.caseIds.length;
  const nextSession: AssessmentSession = {
    ...session,
    currentIndex: completed ? session.currentIndex : nextIndex,
    status: completed ? "completed" : session.status,
    completedAt: completed ? new Date().toISOString() : session.completedAt
  };
  const nextStore = updateSession(store, nextSession);

  return completed ? ensureGrowthReport(nextStore, session.id) : nextStore;
}

export function pauseAssessmentSession(store: AssessmentStore, sessionId: string): AssessmentStore {
  const session = getSession(store, sessionId);
  return session ? updateSession(store, { ...session, status: "paused" }) : store;
}

export function ensureGrowthReport(store: AssessmentStore, sessionId: string): AssessmentStore {
  const existing = store.reports.find((report) => report.sessionId === sessionId);
  if (existing) {
    return {
      ...store,
      latestReportId: existing.reportId
    };
  }

  const session = getSession(store, sessionId);
  if (!session) return store;

  const report = buildGrowthReport(session);
  return {
    ...store,
    latestReportId: report.reportId,
    reports: [report, ...store.reports]
  };
}

export function generateLearningPathFromReport(
  store: AssessmentStore,
  reportId: string
): AssessmentStore {
  const existing = store.paths.find((path) => path.reportId === reportId);
  if (existing) {
    return {
      ...store,
      latestPathId: existing.id,
      reports: store.reports.map((report) =>
        report.reportId === reportId ? { ...report, linkedLearningPathId: existing.id } : report
      )
    };
  }

  const report = store.reports.find((item) => item.reportId === reportId);
  if (!report) return store;

  const path = buildLearningPath(report);

  return {
    ...store,
    latestPathId: path.id,
    paths: [path, ...store.paths],
    reports: store.reports.map((item) =>
      item.reportId === reportId ? { ...item, linkedLearningPathId: path.id } : item
    )
  };
}

export function markPathNodeInProgress(
  store: AssessmentStore,
  pathId: string,
  nodeId: string
): AssessmentStore {
  return {
    ...store,
    paths: store.paths.map((path) =>
      path.id === pathId
        ? {
            ...path,
            nodes: path.nodes.map((node) =>
              node.id === nodeId && node.status === "available"
                ? { ...node, status: "in_progress" }
                : node
            )
          }
        : path
    )
  };
}

function buildGrowthReport(session: AssessmentSession): GrowthReport {
  const dimensions = allDimensions.map((dimension) => scoreDimension(dimension, session.answers));
  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const weak = [...dimensions].sort((a, b) => a.score - b.score);
  const average = Math.round(
    dimensions.reduce((total, item) => total + item.score, 0) / dimensions.length
  );
  const weakestLabel = abilityLabels[weak[0]?.dimension ?? "bomb_timing"];

  return {
    reportId: `report-${Date.now()}`,
    sessionId: session.id,
    createdAt: new Date().toISOString(),
    currentLevel: mapLevel(average),
    dimensions,
    topStrengths: sorted.slice(0, 2).map((item) => `${abilityLabels[item.dimension]}稳定`),
    mainWeaknesses: weak.slice(0, 2).map((item) => `${abilityLabels[item.dimension]}待强化`),
    aceDiagnosis: `你现在能看懂局面，但${weakestLabel}还不够稳。先练一个判断，再进牌桌。`,
    nextRecommendation: `优先完成“${weakestLabel}”专项路径，训练后再做一次复测。`
  };
}

function scoreDimension(
  dimension: AbilityDimension,
  answers: AssessmentAnswer[]
): AbilityDimensionScore {
  const samples = answers
    .map((answer) => {
      const item = getCase(answer.caseId);
      return item && item.dimension === dimension ? { answer, item } : null;
    })
    .filter((item): item is { answer: AssessmentAnswer; item: AssessmentCase } => Boolean(item));
  const base = dimension === "rules" ? 72 : 58;

  if (samples.length === 0) {
    return {
      dimension,
      score: base,
      confidence: 0.42,
      sampleCount: 0,
      trendDelta: 0,
      status: base >= 75 ? "mastered" : base >= 60 ? "improving" : "weak"
    };
  }

  const weighted =
    samples.reduce((total, sample) => {
      const answerScore = sample.answer.isCorrect ? 1 : 0.22;
      const hintPenalty = sample.answer.hintUsed ? 0.12 : 0;
      return total + Math.max(0, answerScore - hintPenalty) * sample.item.weight;
    }, 0) / samples.reduce((total, sample) => total + sample.item.weight, 0);
  const score = Math.round(100 * weighted);

  return {
    dimension,
    score,
    confidence: Math.min(0.95, 0.58 + samples.length * 0.16),
    sampleCount: samples.length,
    trendDelta: score >= 70 ? 4 : score >= 50 ? 1 : -2,
    status: score >= 75 ? "mastered" : score >= 55 ? "improving" : "weak"
  };
}

function buildLearningPath(report: GrowthReport): LearningPath {
  const primary =
    [...report.dimensions].sort((a, b) => a.score - b.score)[0]?.dimension ?? "bomb_timing";
  const label = abilityLabels[primary];
  const nodes: LearningPathNode[] = [
    {
      id: `node-${primary}-lesson`,
      type: "lesson",
      targetAbility: primary,
      title: `${label}：先学一个判断`,
      description: "用一分钟记住今天最关键的出牌原则。",
      completionRule: "读完口诀并进入练习",
      linkedResourceId: "when-to-bomb",
      visualAssetId: "course-beginner-basics",
      status: "available"
    },
    {
      id: `node-${primary}-quiz`,
      type: "mini_quiz",
      targetAbility: primary,
      title: `${label}：做一次选择`,
      description: "先用选择题验证你是否真的看懂局面。",
      completionRule: "答对或完成复盘",
      linkedResourceId: "practice-when-to-bomb-001",
      visualAssetId: "course-card-patterns",
      status: "locked"
    },
    {
      id: `node-${primary}-case`,
      type: "case_drill",
      targetAbility: primary,
      title: `${label}：进牌桌训练`,
      description: "进入真实牌桌，用选牌、出牌和提示完成一次训练。",
      completionRule: "完成一次训练局",
      linkedResourceId: "practice-when-to-bomb-001",
      visualAssetId: "course-ai-sparring",
      status: "locked"
    },
    {
      id: `node-${primary}-retest`,
      type: "retest",
      targetAbility: primary,
      title: `${label}：专项复测`,
      description: "训练后再测一次，确认不是只记住答案。",
      completionRule: "复测趋势提升 5 分以上",
      linkedResourceId: report.sessionId,
      visualAssetId: "course-endgame-analysis",
      status: "locked"
    }
  ];

  return {
    id: `path-${Date.now()}`,
    reportId: report.reportId,
    title: `从${report.currentLevel}到下一阶段`,
    primaryDimension: primary,
    nodes,
    createdAt: new Date().toISOString()
  };
}

function updateSession(store: AssessmentStore, session: AssessmentSession): AssessmentStore {
  return {
    ...store,
    activeSessionId: session.id,
    sessions: store.sessions.map((item) => (item.id === session.id ? session : item))
  };
}

function mapLevel(score: number): GrowthReport["currentLevel"] {
  if (score >= 90) return "高阶收束";
  if (score >= 75) return "协同提升";
  if (score >= 60) return "进阶控牌";
  if (score >= 40) return "稳定判断";
  return "基础入门";
}
