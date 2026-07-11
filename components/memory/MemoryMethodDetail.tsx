"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { memoryMethods, categoryLabels, difficultyLabels, type MemoryMethod } from "@/content/memory-methods";
import { MethodMappingDemo, MethodPrincipleFlow, MethodScenarioDemo } from "@/components/memory/MemoryMethodVisuals";

const progressKey = "guandan-memory-method-progress";

export function MemoryMethodDetail({ method }: { method: MemoryMethod }) {
  const [demoViewed, setDemoViewed] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(progressKey);
      const progress = raw ? JSON.parse(raw) as Record<string, { proficiency?: number; status?: string; demoViewed?: boolean }> : {};
      const current = progress[method.id] ?? { proficiency: 0, status: "learning", demoViewed: false };
      progress[method.id] = { ...current, status: current.status === "not_started" ? "learning" : current.status, demoViewed: true, proficiency: Math.max(current.proficiency ?? 0, 10) };
      window.localStorage.setItem(progressKey, JSON.stringify(progress));
      setDemoViewed(true);
    } catch {
      setDemoViewed(false);
    }
  }, [method.id]);

  const previous = memoryMethods.find((item) => item.number === String(Number(method.number) - 1).padStart(2, "0"));
  const next = memoryMethods.find((item) => item.number === String(Number(method.number) + 1).padStart(2, "0"));

  return (
    <main className="min-h-screen bg-[#eaf6ff] px-4 py-6 text-[#12395a] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link className="inline-flex min-h-11 items-center rounded-xl border border-[#9fcbe5] bg-white px-4 text-sm font-black text-[#176192] transition hover:-translate-y-0.5" href="/training/memory-methods">
          ← 返回记牌方法库
        </Link>
        <header className="mt-4 rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_18px_46px_rgba(31,112,166,0.14)] sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-black">
            <span className="rounded-full bg-[#dff1fd] px-3 py-1 text-[#176192]">方法 {method.number}</span>
            <span className="rounded-full border border-[#bddced] px-3 py-1 text-[#4a7d99]">{categoryLabels[method.category]}</span>
            <span className="rounded-full border border-[#bddced] px-3 py-1 text-[#4a7d99]">{difficultyLabels[method.difficulty]}</span>
            {method.recommended ? <span className="rounded-full bg-[#fff0c9] px-3 py-1 text-[#8c5b06]">核心推荐</span> : null}
          </div>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{method.title}</h1>
              <p className="mt-3 text-lg font-black text-[#176192]">{method.summary}</p>
              <p className="mt-2 text-sm font-bold text-[#64849a]">{method.suitableFor.join(" · ")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="min-h-11 rounded-xl bg-[#12395a] px-4 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 active:scale-95" href={`/training/memory?method=${method.slug}`}>
                基础练习
              </Link>
              <span className="rounded-xl bg-[#eef8ff] px-4 py-2.5 text-sm font-black text-[#176192]">{demoViewed ? "演示已看过" : "演示未完成"}</span>
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel title="核心原理">
            <p className="mb-4 text-base font-bold leading-7 text-[#2b6388]">{method.slogan}</p>
            <MethodPrincipleFlow method={method} />
          </Panel>
          <Panel title="动作 / 记忆映射">
            <MethodMappingDemo method={method} />
          </Panel>
        </section>

        <section className="mt-5">
          <Panel title="分步骤教学">
            <div className="grid gap-3 md:grid-cols-2">
              {method.steps.map((step, index) => (
                <article className="rounded-2xl border border-[#d6eafa] bg-[#f7fbff] p-4" key={step.id}>
                  <div className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#12395a] text-sm font-black text-white">0{index + 1}</span>
                    <div>
                      <h3 className="font-black text-[#12395a]">{step.title}</h3>
                      <p className="mt-1 text-sm font-bold leading-6 text-[#48718b]">{step.description}</p>
                      {step.tip ? <p className="mt-2 rounded-lg bg-[#fff4d9] px-2 py-1 text-xs font-black text-[#8c5b06]">注意：{step.tip}</p> : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Panel title="实战示例"><MethodScenarioDemo method={method} /></Panel>
          <Panel title="常见错误">
            <div className="space-y-3">
              {method.mistakes.map((mistake, index) => (
                <div className="flex gap-3 rounded-xl bg-[#fff7e5] p-3" key={mistake.id}>
                  <span className="font-black text-[#d69312]">{index + 1}</span>
                  <div><p className="font-black text-[#6f520f]">{mistake.title}</p><p className="mt-1 text-sm font-bold leading-6 text-[#826d43]">{mistake.description}</p></div>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="mt-5 rounded-[24px] border border-[#b9dcf5] bg-[#eef8ff] p-5 sm:p-6">
          <h2 className="text-xl font-black">训练入口</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[#48718b]">从映射理解开始，再练数量更新，最后进入连续牌局实战。</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {["观看演示", "基础练习", "实战模拟"].map((label, index) => (
              <Link className="rounded-xl bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md" href={`/training/memory?method=${method.slug}&stage=${index === 0 ? "demo" : index === 1 ? "basic" : "practical"}`} key={label}>
                <p className="text-sm font-black text-[#12395a]">{label}</p>
                <p className="mt-1 text-xs font-bold text-[#64849a]">{index === 0 ? "重复查看映射和动作" : index === 1 ? "理解关系并更新数量" : "在连续出牌中保持记录"}</p>
              </Link>
            ))}
          </div>
        </section>

        <nav className="flex justify-between gap-3 py-6">
          {previous ? <Link className="min-h-11 rounded-xl border border-[#9fcbe5] bg-white px-4 py-2.5 text-sm font-black text-[#176192]" href={`/training/memory-methods/${previous.slug}`}>← 方法 {previous.number}</Link> : <span />}
          {next ? <Link className="min-h-11 rounded-xl border border-[#9fcbe5] bg-white px-4 py-2.5 text-sm font-black text-[#176192]" href={`/training/memory-methods/${next.slug}`}>方法 {next.number} →</Link> : <span />}
        </nav>
      </div>
    </main>
  );
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return <section className="rounded-[24px] border border-white/80 bg-white p-5 shadow-[0_12px_30px_rgba(31,112,166,0.1)] sm:p-6"><h2 className="mb-4 text-xl font-black">{title}</h2>{children}</section>;
}
