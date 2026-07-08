"use client";

import { useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  assessmentStorageKey,
  createAssessmentSession,
  defaultAssessmentStore,
  ensureGrowthReport,
  generateLearningPathFromReport,
  goToNextAssessmentCase,
  markPathNodeInProgress,
  pauseAssessmentSession,
  submitAssessmentAnswer
} from "@/lib/assessment/assessment-engine";
import type { AssessmentStore, AssessmentTier } from "@/types/assessment";

export function useAssessmentStore() {
  const [store, setStore, isReady] = useLocalStorage<AssessmentStore>(
    assessmentStorageKey,
    defaultAssessmentStore
  );
  const normalizedStore = useMemo(
    () => ({
      ...defaultAssessmentStore,
      ...store,
      sessions: store.sessions ?? [],
      reports: store.reports ?? [],
      paths: store.paths ?? []
    }),
    [store]
  );

  const actions = useMemo(
    () => ({
      setTier(tier: AssessmentTier) {
        setStore((current) => ({ ...defaultAssessmentStore, ...current, selectedTier: tier }));
      },
      startSession(tier: AssessmentTier, mode: "initial" | "retest" = "initial") {
        const next = createAssessmentSession(normalizedStore, tier, mode);
        setStore(next);
        return next.activeSessionId ?? "";
      },
      submitAnswer(sessionId: string, optionId: string, hintUsed: boolean) {
        setStore((current) =>
          submitAssessmentAnswer(
            { ...defaultAssessmentStore, ...current },
            sessionId,
            optionId,
            hintUsed
          )
        );
      },
      nextQuestion(sessionId: string) {
        setStore((current) =>
          goToNextAssessmentCase({ ...defaultAssessmentStore, ...current }, sessionId)
        );
      },
      pauseSession(sessionId: string) {
        setStore((current) =>
          pauseAssessmentSession({ ...defaultAssessmentStore, ...current }, sessionId)
        );
      },
      ensureReport(sessionId: string) {
        setStore((current) =>
          ensureGrowthReport({ ...defaultAssessmentStore, ...current }, sessionId)
        );
      },
      generatePath(reportId: string) {
        setStore((current) =>
          generateLearningPathFromReport({ ...defaultAssessmentStore, ...current }, reportId)
        );
      },
      startPathNode(pathId: string, nodeId: string) {
        setStore((current) =>
          markPathNodeInProgress({ ...defaultAssessmentStore, ...current }, pathId, nodeId)
        );
      }
    }),
    [normalizedStore, setStore]
  );

  return {
    store: normalizedStore,
    isReady,
    ...actions
  };
}
