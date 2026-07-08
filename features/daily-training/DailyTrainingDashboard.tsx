"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { abilityLabels } from "@/content/assessment/cases";
import { getNextRecommendation, getTodayTraining } from "@/features/daily-training";
import { useAssessmentStore } from "@/features/assessment/useAssessmentStore";
import { useProgress } from "@/features/progress/useProgress";

export function DailyTrainingDashboard() {
  const { progress, isReady: progressReady } = useProgress();
  const { isReady: assessmentReady, store } = useAssessmentStore();
  const todayTraining = getTodayTraining(progress);
  const recommendation = getNextRecommendation(progress);
  const latestReport =
    store.reports.find((report) => report.reportId === store.latestReportId) ??
    store.reports[0];
  const latestPath =
    store.paths.find((path) => path.id === store.latestPathId) ??
    store.paths[0];
  const weakest = latestReport
    ? [...latestReport.dimensions].sort((a, b) => a.score - b.score)[0]
    : null;
  const mainHref = latestReport ? "/learning-path" : "/assessment/start";
  const mainLabel = latestReport ? "继续路线" : "开始测评";

  return (
    <div className="space-y-5">
      <section className="grid min-h-[420px] gap-6 rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_20px_60px_rgba(0,88,190,0.06)] lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center lg:p-8">
        <div>
          <span className="inline-flex rounded-full bg-[#e7eeff] px-3 py-1.5 text-xs font-black text-[#0058be]">
            Daily Training
          </span>
          <h2 className="mt-4 text-3xl font-black leading-10 text-[#12395a] lg:text-4xl lg:leading-[3.2rem]">
            {latestReport ? "今天补一个短板。" : "先测一轮。"}
            <br />
            {latestReport
              ? `${weakest ? abilityLabels[weakest.dimension] : "炸弹时机"}专项`
              : "Ace 再安排训练。"}
          </h2>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#52657a] lg:text-base lg:leading-8">
            {latestReport
              ? latestReport.nextRecommendation
              : "完成 5 个判断题，系统会生成能力画像、成长报告和下一步学习路线。"}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
            <Button className="h-14 text-base" href={mainHref}>
              {mainLabel}
            </Button>
            <Button href="/practice" variant="secondary">
              直接训练
            </Button>
          </div>
        </div>

        <div className="flex justify-center rounded-[26px] bg-[#f0f7ff] p-4">
          <Image
            alt="Ace 教练"
            className="h-56 w-56 object-contain drop-shadow-[0_22px_40px_rgba(0,88,190,0.18)]"
            height={224}
            src="/assets/coach/coach-victory-celebration.png"
            width={224}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
        <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[#0058be]">成长状态</p>
              <h3 className="mt-1 text-2xl font-black text-[#12395a]">
                Lv{progressReady ? progress.level : 1}
              </h3>
            </div>
            <span className="rounded-full bg-[#fff7df] px-3 py-2 text-xs font-black text-[#924700]">
              {progressReady ? progress.experience : 0} XP
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <Metric label="连续" value={`${progressReady ? progress.streakDays : 0} 天`} />
            <Metric label="完成" value={`${progressReady ? progress.completedTrainingIds.length : 0}`} />
            <Metric label="错题" value={`${progressReady ? progress.wrongPracticeIds.length : 0}`} />
          </div>
        </section>

        <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-[#0058be]">今日任务</p>
              <h3 className="mt-1 text-xl font-black leading-7 text-[#12395a]">
                {todayTraining?.theme ?? recommendation.title}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#52657a]">
                {todayTraining?.coachTip ?? recommendation.description}
              </p>
            </div>
            <span className="rounded-full bg-[#e7eeff] px-3 py-2 text-xs font-black text-[#0058be]">
              {todayTraining ? `Day ${todayTraining.day}` : "Ready"}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button href={todayTraining ? `/lessons/${todayTraining.lessonId}` : "/assessment/start"}>
              开始
            </Button>
            <Button href={latestPath ? "/learning-path" : "/paths"} variant="secondary">
              看路线
            </Button>
          </div>
        </section>
      </div>

      {assessmentReady && latestReport ? (
        <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-[#0058be]">最近报告</p>
              <h3 className="mt-1 text-xl font-black text-[#12395a]">
                {latestReport.currentLevel}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#52657a]">
                {latestReport.aceDiagnosis}
              </p>
            </div>
            <Button href={`/growth-report/${latestReport.reportId}`} variant="secondary">
              查看画像
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f0f7ff] px-3 py-4">
      <p className="text-xs font-black text-[#657488]">{label}</p>
      <p className="mt-1 text-lg font-black text-[#0058be]">{value}</p>
    </div>
  );
}
