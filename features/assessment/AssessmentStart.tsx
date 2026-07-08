"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { abilityLabels, assessmentCases } from "@/content/assessment/cases";
import { useAssessmentStore } from "@/features/assessment/useAssessmentStore";
import type { AssessmentTier } from "@/types/assessment";

const tierOptions: Array<{
  id: AssessmentTier;
  title: string;
  description: string;
}> = [
  { id: "beginner", title: "新手", description: "先看牌型、牌权和基础残局。" },
  { id: "intermediate", title: "中级", description: "重点测炸弹、风险和配合。" },
  { id: "advanced", title: "高级", description: "用更严格的局势判断找短板。" }
];

export function AssessmentStart() {
  const router = useRouter();
  const { isReady, setTier, startSession, store } = useAssessmentStore();
  const selectedTier = store.selectedTier;
  const caseCount = assessmentCases.filter((item) => item.tier.includes(selectedTier)).length;

  function beginAssessment() {
    const sessionId = startSession(selectedTier);
    router.push(`/assessment/session/${sessionId}`);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_20px_60px_rgba(0,88,190,0.06)] lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-[#e7eeff] px-3 py-1.5 text-xs font-black text-[#0058be]">
              Assessment
            </span>
            <h2 className="mt-4 text-3xl font-black leading-10 text-[#12395a]">
              先做一轮判断。
              <br />
              Ace 再给你训练路线。
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#52657a]">
              测评会记录你的选择、提示使用和能力维度。完成后生成成长报告，不会接真实 AI。
            </p>
          </div>
          <div className="rounded-[24px] bg-[#f0f7ff] p-5">
            <p className="text-sm font-black text-[#0058be]">本轮测评</p>
            <p className="mt-2 text-4xl font-black text-[#12395a]">{caseCount} 题</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#52657a]">
              覆盖 {abilityLabels.bomb_timing}、{abilityLabels.initiative}、{abilityLabels.teamwork}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {tierOptions.map((tier) => {
          const active = tier.id === selectedTier;
          return (
            <button
              className={[
                "rounded-[24px] border p-5 text-left transition active:scale-[0.98]",
                active
                  ? "border-[#0058be] bg-[#e7eeff] shadow-[0_18px_48px_rgba(0,88,190,0.12)]"
                  : "border-[#d8e3fb] bg-white hover:border-[#64a8fe]"
              ].join(" ")}
              key={tier.id}
              onClick={() => setTier(tier.id)}
              type="button"
            >
              <p className="text-lg font-black text-[#12395a]">{tier.title}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#52657a]">{tier.description}</p>
              {active ? (
                <span className="mt-4 inline-flex rounded-full bg-[#0058be] px-3 py-1 text-xs font-black text-white">
                  已选择
                </span>
              ) : null}
            </button>
          );
        })}
      </section>

      <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
        <Button href="/" variant="secondary">
          返回首页
        </Button>
        <Button disabled={!isReady} onClick={beginAssessment}>
          开始测评
        </Button>
      </div>
    </div>
  );
}
