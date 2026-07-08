"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { abilityLabels } from "@/content/assessment/cases";
import { useAssessmentStore } from "@/features/assessment/useAssessmentStore";
import { ensureGrowthReport, getSession } from "@/lib/assessment/assessment-engine";

interface AssessmentResultViewProps {
  sessionId: string;
}

export function AssessmentResultView({ sessionId }: AssessmentResultViewProps) {
  const router = useRouter();
  const { isReady, startSession, store } = useAssessmentStore();
  const session = getSession(store, sessionId);
  const hydratedStore = ensureGrowthReport(store, sessionId);
  const report = hydratedStore.reports.find((item) => item.sessionId === sessionId);
  const correctCount = session?.answers.filter((answer) => answer.isCorrect).length ?? 0;
  const total = session?.caseIds.length ?? 0;

  useEffect(() => {
    if (isReady && session && !report) {
      window.localStorage.setItem(
        "guandan-ai-coach-assessment-v2",
        JSON.stringify(hydratedStore)
      );
    }
  }, [hydratedStore, isReady, report, session]);

  if (!isReady) {
    return <ResultShell title="正在生成结果" description="Ace 正在整理你的判断信号。" />;
  }

  if (!session || !report) {
    return (
      <ResultShell title="结果不存在" description="请先完成一轮测评。">
        <Button href="/assessment/start">开始测评</Button>
      </ResultShell>
    );
  }

  const weakest = [...report.dimensions].sort((a, b) => a.score - b.score)[0];

  function restart() {
    const nextId = startSession(session?.tier ?? "beginner");
    router.push(`/assessment/session/${nextId}`);
  }

  return (
    <div className="space-y-5">
      <ResultShell
        description={report.aceDiagnosis}
        eyebrow={`${correctCount}/${total} 个判断命中`}
        title={report.currentLevel}
      />

      <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
        <p className="text-sm font-black text-[#0058be]">主要短板</p>
        <h2 className="mt-2 text-2xl font-black text-[#12395a]">
          {weakest ? abilityLabels[weakest.dimension] : "炸弹时机"}
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#52657a]">
          {report.nextRecommendation}
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button href={`/growth-report/${report.reportId}`}>查看报告</Button>
        <Button href="/practice" variant="secondary">
          先去训练
        </Button>
        <Button onClick={restart} variant="secondary">
          重新测评
        </Button>
      </div>
    </div>
  );
}

function ResultShell({
  children,
  description,
  eyebrow,
  title
}: {
  children?: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
      <p className="text-sm font-black text-[#0058be]">{eyebrow ?? "Assessment Result"}</p>
      <h1 className="mt-3 text-3xl font-black leading-10 text-[#12395a]">{title}</h1>
      <p className="mt-3 text-sm font-semibold leading-7 text-[#52657a]">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
