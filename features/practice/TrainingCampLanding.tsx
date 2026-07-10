"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { samplePracticeCases } from "@/content/cases/sample-practice";

const trainingEntries = [
  {
    title: "AI实战牌桌",
    description: "AI陪练真实牌局，练习判断、出牌与策略。",
    href: "/training",
    eyebrow: "LIVE ARENA",
    icon: "♠",
    primary: true
  },
  {
    title: "记牌训练模式",
    description: "训练记忆能力，掌握牌型、概率与局势。",
    href: `/practice/${samplePracticeCases[0]?.id ?? "practice-when-to-bomb-001"}`,
    eyebrow: "MEMORY LAB",
    icon: "◈",
    primary: false
  }
];

function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      aria-labelledby="about-training-camp-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#020711]/80 p-4 backdrop-blur-md"
      role="dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article className="relative max-h-[min(760px,calc(100dvh-2rem))] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[#72d9ff]/25 bg-[#09182a]/95 p-6 text-[#e9f5ff] shadow-[0_24px_100px_rgba(0,0,0,0.52)] sm:p-8">
        <button
          aria-label="关闭介绍"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-xl text-[#a8c4dc] transition hover:border-[#72d9ff]/60 hover:text-white"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6ddaff]">TRAINING SYSTEM</p>
        <h2 id="about-training-camp-title" className="mt-3 pr-10 text-2xl font-black tracking-tight sm:text-3xl">
          关于 AI 掼蛋训练营
        </h2>

        <div className="mt-7 space-y-7 text-sm leading-7 text-[#b9cde0]">
          <section>
            <h3 className="text-base font-bold text-white">AI掼蛋训练营：汇聚掼蛋高手经验，打造智能记牌训练体系</h3>
            <p className="mt-2">我们重新整理了掼蛋高手多年积累的经验，致力于打造真正有效、可持续练习的 AI 掼蛋训练系统。</p>
            <p className="mt-2">训练体系参考了公开资料、比赛案例、技巧分享与高手经验，包括高水平牌局、冠军选手公开复盘、教学资料，以及记牌、算牌和牌局判断方法。</p>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="font-bold text-white">孙寅贵</h3>
              <p className="mt-2">作为掼蛋文化推广的重要推动者之一，长期参与赛事组织与推广，推动竞技化发展、赛事体系建设与文化传播。</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="font-bold text-white">赵冬</h3>
              <p className="mt-2">长期参与赛事活动与竞技交流，在公开赛事和推广活动中积累了丰富的实战经验。</p>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-white">全国掼蛋赛事优秀选手体系</h3>
            <p className="mt-2">我们通过分析高水平牌局，研究高手如何快速记忆关键牌、判断剩余牌型、控制出牌节奏，以及与队友进行策略配合。</p>
          </section>

          <section>
            <h3 className="font-bold text-white">从高手经验，到 AI 训练模型</h3>
            <p className="mt-2">高手的成长依赖长期实战，但其中的经验可以被结构化整理为高手经验库、经典牌局数据、AI 分析模型与记牌训练算法。</p>
            <p className="mt-2">我们训练的不是“记住更多牌”，而是培养高手一样的信息处理能力：快速捕捉信息、建立牌局判断、预测未来变化，并做出更优选择。</p>
          </section>

          <section className="border-l-2 border-[#6ddaff]/60 pl-4">
            <h3 className="font-bold text-white">产品理念</h3>
            <p className="mt-2 text-[#d8efff]">AI不是替用户打牌，而是帮助玩家理解为什么这样打。每一次训练，都是一次能力提升。</p>
          </section>
        </div>
      </article>
    </div>
  );
}

export default function TrainingCampLanding() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    if (!isAboutOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsAboutOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isAboutOpen]);

  return (
    <main className="relative flex min-h-[100dvh] items-center overflow-hidden bg-[#050b16] px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(54,184,255,0.22),transparent_38%),radial-gradient(circle_at_100%_100%,rgba(31,83,190,0.18),transparent_36%),linear-gradient(145deg,#071426_0%,#050b16_58%,#07111f_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(119,215,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(119,215,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />

      <button
        aria-label="关于 AI 掼蛋训练营"
        className="camp-help-button fixed left-4 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[#72d9ff]/35 bg-[#0d2035]/70 text-xl font-semibold text-[#bceeff] shadow-[0_0_28px_rgba(64,188,255,0.22)] backdrop-blur-xl transition hover:scale-105 hover:border-[#72d9ff] hover:bg-[#123457] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#72d9ff]/60 sm:left-6"
        onClick={() => setIsAboutOpen(true)}
        type="button"
      >
        ?
      </button>

      <section className="relative z-10 mx-auto w-full max-w-5xl">
        <header className="text-center">
          <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">AI掼蛋训练营</h1>
        </header>

        <section className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2 md:gap-6 lg:mt-16">
          {trainingEntries.map((entry, index) => (
            <Link
              className={`training-entry group relative min-h-[270px] overflow-hidden rounded-[28px] border p-6 shadow-[0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:min-h-[300px] sm:p-8 ${entry.primary ? "training-entry-primary border-[#68d8ff]/45 bg-[#0e2944]/80" : "border-white/14 bg-white/[0.065]"}`}
              href={entry.href}
              key={entry.title}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-bold tracking-[0.2em] text-[#74dfff]">{entry.eyebrow}</span>
                  <span className="training-entry-icon grid h-12 w-12 place-items-center rounded-2xl border border-white/12 bg-white/[0.07] text-2xl text-[#93e8ff]">
                    {entry.icon}
                  </span>
                </div>
                <div className="mt-auto">
                  <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{entry.title}</h2>
                  <p className="mt-3 max-w-xs text-sm font-medium leading-6 text-[#b8cde0]">{entry.description}</p>
                  <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#bceeff]">
                    {entry.primary ? "进入牌桌" : "开始训练"} <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </section>

      {isAboutOpen ? <AboutModal onClose={() => setIsAboutOpen(false)} /> : null}
    </main>
  );
}
