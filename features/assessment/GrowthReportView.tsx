"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { abilityLabels } from "@/content/assessment/cases";
import { useAssessmentStore } from "@/features/assessment/useAssessmentStore";

interface GrowthReportViewProps {
  reportId: string;
}

export function GrowthReportView({ reportId }: GrowthReportViewProps) {
  const router = useRouter();
  const { generatePath, isReady, store } = useAssessmentStore();
  const report = store.reports.find((item) => item.reportId === reportId);
  const sortedDimensions = useMemo(
    () => (report ? [...report.dimensions].sort((a, b) => a.score - b.score) : []),
    [report]
  );

  if (!isReady) {
    return <ReportEmpty text="正在读取成长报告。" />;
  }

  if (!report) {
    return <ReportEmpty href="/assessment/start" text="没有找到这份报告。先做一次能力测评。" />;
  }

  function openLearningPath() {
    generatePath(reportId);
    router.push("/learning-path");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
        <p className="text-sm font-black text-[#0058be]">Growth Report</p>
        <h1 className="mt-3 text-3xl font-black leading-10 text-[#12395a]">
          {report.currentLevel}
        </h1>
        <p className="mt-3 text-sm font-semibold leading-7 text-[#52657a]">
          {report.aceDiagnosis}
        </p>
      </section>

      <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
        <div className="flex items-center justify-between">
          <p className="text-sm font-black text-[#0058be]">七维能力</p>
          <span className="rounded-full bg-[#f0f7ff] px-3 py-1 text-xs font-black text-[#52657a]">
            本地规则评分
          </span>
        </div>
        <div className="mt-5 grid gap-3">
          {report.dimensions.map((dimension) => (
            <div key={dimension.dimension}>
              <div className="flex items-center justify-between text-sm font-black">
                <span className="text-[#12395a]">{abilityLabels[dimension.dimension]}</span>
                <span className={dimension.status === "weak" ? "text-[#b4232f]" : "text-[#0058be]"}>
                  {dimension.score}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7eeff]">
                <div
                  className={[
                    "h-full rounded-full",
                    dimension.status === "weak" ? "bg-[#FF6B6B]" : "bg-[#0058be]"
                  ].join(" ")}
                  style={{ width: `${dimension.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <InsightCard
          title="强项"
          items={report.topStrengths}
          tone="success"
        />
        <InsightCard
          title="短板"
          items={report.mainWeaknesses}
          tone="danger"
        />
      </section>

      <section className="rounded-[28px] border border-[#F6C65B] bg-[#fff7df] p-5">
        <p className="text-sm font-black text-[#924700]">下一步</p>
        <h2 className="mt-2 text-xl font-black text-[#12395a]">
          生成你的专项学习路线
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#52657a]">
          当前优先补：{abilityLabels[sortedDimensions[0]?.dimension ?? "bomb_timing"]}。
          路线会从一课一题开始，再进入训练牌桌。
        </p>
        <Button className="mt-5 w-full" onClick={openLearningPath}>
          生成学习路线
        </Button>
      </section>
    </div>
  );
}

function InsightCard({
  items,
  title,
  tone
}: {
  items: string[];
  title: string;
  tone: "success" | "danger";
}) {
  return (
    <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-5">
      <p className={["text-sm font-black", tone === "success" ? "text-[#17814d]" : "text-[#b4232f]"].join(" ")}>
        {title}
      </p>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div className="rounded-2xl bg-[#f0f7ff] px-4 py-3 text-sm font-bold text-[#334155]" key={item}>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportEmpty({ href, text }: { href?: string; text: string }) {
  return (
    <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-6">
      <p className="text-sm font-bold text-[#52657a]">{text}</p>
      {href ? <Button className="mt-4" href={href}>开始测评</Button> : null}
    </section>
  );
}
