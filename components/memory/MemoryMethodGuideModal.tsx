"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { MethodMappingDemo, MethodPrincipleFlow, MethodScenarioDemo } from "@/components/memory/MemoryMethodVisuals";
import { categoryLabels, difficultyLabels, getMemoryMethodBySlug } from "@/content/memory-methods";
import type { MemoryMethodGuideReason } from "@/lib/memory/ObserverMemoryTraining";

interface MemoryMethodGuideModalProps {
  reason: MemoryMethodGuideReason;
  onContinue: () => void;
}

const method = getMemoryMethodBySlug("foot-position");

export function MemoryMethodGuideModal({ reason, onContinue }: MemoryMethodGuideModalProps) {
  if (!method) return null;

  const isWrongStreak = reason === "wrong_streak";

  return (
    <div className="fixed inset-0 z-[260] overflow-y-auto bg-[#071426]/88 px-4 py-5 text-[#12395a] backdrop-blur-xl sm:px-6">
      <section className="mx-auto grid min-h-[calc(100dvh-2.5rem)] w-full max-w-5xl content-center">
        <div className="overflow-hidden rounded-[28px] border border-white/75 bg-[#f8fcff] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="bg-[#e8f6ff] p-4 sm:p-5">
              <div className="overflow-hidden rounded-2xl border border-white bg-white p-2 shadow-[0_14px_34px_rgba(31,112,166,0.14)]">
                <Image
                  alt={`${method.title}图解`}
                  className="h-auto w-full rounded-xl"
                  height={1536}
                  priority
                  src={method.infographic}
                  width={1024}
                />
              </div>
            </aside>

            <div className="max-h-[calc(100dvh-2.5rem)] overflow-y-auto p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2 text-xs font-black">
                <span className="rounded-full bg-[#dff1fd] px-3 py-1 text-[#176192]">方法 {method.number}</span>
                <span className="rounded-full border border-[#bddced] px-3 py-1 text-[#4a7d99]">{categoryLabels[method.category]}</span>
                <span className="rounded-full border border-[#bddced] px-3 py-1 text-[#4a7d99]">{difficultyLabels[method.difficulty]}</span>
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-[#0f64ff]">
                {isWrongStreak ? "Memory recovery" : "Before training"}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#12395a] sm:text-4xl">
                {isWrongStreak ? "先把方法稳住，再继续练" : "先学会一套记牌动作"}
              </h2>
              <p className="mt-3 text-base font-bold leading-7 text-[#2b6388]">{method.summary}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#64849a]">{method.slogan}</p>

              <div className="mt-5 space-y-4">
                <GuidePanel title="核心原理">
                  <MethodPrincipleFlow method={method} />
                </GuidePanel>

                <GuidePanel title="记忆映射">
                  <MethodMappingDemo method={method} />
                </GuidePanel>

                <GuidePanel title="实战示例">
                  <MethodScenarioDemo method={method} />
                </GuidePanel>
              </div>

              <button
                className="mt-6 min-h-12 w-full rounded-full bg-[#0f64ff] px-5 text-base font-black text-white shadow-[0_14px_30px_rgba(15,100,255,0.26)] transition hover:-translate-y-0.5 active:translate-y-0"
                onClick={onContinue}
                type="button"
              >
                我知道了，继续训练
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function GuidePanel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-2xl border border-[#dcecf7] bg-white p-4 shadow-[0_10px_24px_rgba(31,112,166,0.08)]">
      <h3 className="mb-3 text-base font-black text-[#12395a]">{title}</h3>
      {children}
    </section>
  );
}
