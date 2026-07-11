"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { categoryLabels, difficultyLabels, memoryMethods, type MemoryMethodCategory, type MemoryMethodStatus } from "@/content/memory-methods";
import { FootPositionDiagram } from "@/components/memory/MemoryMethodVisuals";

const progressKey = "guandan-memory-method-progress";
const statusLabels: Record<MemoryMethodStatus, string> = { not_started: "未开始", learning: "学习中", learned: "已学习", mastered: "已掌握" };

type Progress = { status: MemoryMethodStatus; proficiency: number; demoViewed?: boolean };

export function MemoryMethodsLibrary({ compact = false }: { compact?: boolean }) {
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = useState<MemoryMethodCategory | "all">("all");
  const [difficulty, setDifficulty] = useState<"all" | keyof typeof difficultyLabels>("all");
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [showRecommendation, setShowRecommendation] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(progressKey);
      if (raw) setProgress(JSON.parse(raw) as Record<string, Progress>);
    } catch { setProgress({}); }
  }, []);

  const methods = useMemo(() => memoryMethods.filter((method) => (category === "all" || method.category === category) && (difficulty === "all" || method.difficulty === difficulty)), [category, difficulty]);
  const learnedCount = Object.values(progress).filter((item) => item.status !== "not_started").length;
  const featured = memoryMethods[0];

  function start(methodId: string) {
    const current = progress[methodId] ?? { status: "not_started", proficiency: 0 };
    const next = { ...progress, [methodId]: { ...current, status: current.status === "not_started" ? "learning" : current.status } };
    setProgress(next);
    window.localStorage.setItem(progressKey, JSON.stringify(next));
  }

  if (compact) {
    return <CompactMethodList />;
  }

  return <main className="min-h-screen bg-[#eaf6ff] px-4 py-8 text-[#12395a] sm:px-6 lg:px-10"><div className="mx-auto max-w-7xl">
    <header className="flex flex-col gap-5 rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-[0_18px_46px_rgba(31,112,166,0.15)] backdrop-blur md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#4c91bc]">Memory Training System</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">记牌方法库</h1><p className="mt-2 max-w-xl text-sm font-bold leading-6 text-[#48718b]">找到最适合自己的记牌方式，把记忆动作变成下意识。</p></div><div className="grid grid-cols-2 gap-2 text-center"><Stat value={`${Math.min(learnedCount, 6)} / 6`} label="已学习" /><Stat value="脚步定位" label="当前推荐" /></div></header>
    <motion.section animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} className="mt-6 overflow-hidden rounded-[26px] border border-[#f2c66c] bg-[#fffaf0] p-5 shadow-[0_18px_42px_rgba(183,126,26,0.14)] sm:p-7" initial={reduceMotion ? false : { opacity: 0, y: 12 }}><div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"><div><div className="flex flex-wrap gap-2 text-xs font-black"><span className="rounded-full bg-[#f2b84b] px-3 py-1 text-[#5f4003]">方法 {featured.number}</span><span className="rounded-full border border-[#e5bd62] px-3 py-1 text-[#8b641a]">核心推荐</span><span className="rounded-full border border-[#e5bd62] px-3 py-1 text-[#8b641a]">双手持牌适用</span></div><h2 className="mt-3 text-2xl font-black">{featured.title}</h2><p className="mt-2 font-black text-[#8c5b06]">{featured.summary}</p><p className="mt-3 text-sm font-bold leading-6 text-[#6b6a55]">{featured.suitableFor.join(" · ")}</p><div className="mt-4 flex flex-wrap gap-2"><Link className="min-h-11 rounded-xl bg-[#12395a] px-4 py-2.5 text-sm font-black text-white" href={`/training/memory-methods/${featured.slug}`} onClick={() => start(featured.id)}>查看方法</Link><Link className="min-h-11 rounded-xl border border-[#d6a93f] px-4 py-2.5 text-sm font-black text-[#765006]" href={`/training/memory?method=${featured.slug}`} onClick={() => start(featured.id)}>开始训练</Link></div></div><FootPositionDiagram /></div></motion.section>
    <section className="mt-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">选择你的记牌方式</h2><p className="text-sm font-bold text-[#48718b]">按记忆方式和训练难度筛选。</p></div><button className="min-h-11 rounded-xl border border-[#8fc4e5] bg-white px-4 font-black text-[#176192]" onClick={() => setShowRecommendation((value) => !value)} type="button">{showRecommendation ? "收起选择建议" : "帮我选择"}</button></div>{showRecommendation && <Recommendation />}</section>
    <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-3"><div className="flex gap-2 overflow-x-auto pb-1">{(["all", "body", "spatial", "number", "visual", "player", "hybrid"] as const).map((item) => <button className={`min-h-10 shrink-0 rounded-xl px-3 text-sm font-black ${category === item ? "bg-[#12395a] text-white" : "bg-[#eef8ff] text-[#3c7497]"}`} key={item} onClick={() => setCategory(item)} type="button">{item === "all" ? "全部方式" : categoryLabels[item]}</button>)}</div><div className="mt-2 flex gap-2 overflow-x-auto">{(["all", "beginner", "intermediate", "advanced"] as const).map((item) => <button className={`min-h-10 shrink-0 rounded-xl px-3 text-sm font-black ${difficulty === item ? "bg-[#dff1fd] text-[#176192]" : "text-[#5b7e93]"}`} key={item} onClick={() => setDifficulty(item)} type="button">{item === "all" ? "全部难度" : difficultyLabels[item]}</button>)}</div></div>
    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{methods.map((method, index) => <MethodCard key={method.id} method={method} index={index} progress={progress[method.id]} compact={false} />)}</div>
  </div></main>;
}

function CompactMethodList() {
  return <section className="rounded-2xl border border-[#cfe3f5] bg-[#f5fbff] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f64ff]">记牌方法</p><p className="mt-1 text-lg font-black text-[#12395a]">找到适合自己的记忆动作</p></div><Link className="rounded-full bg-[#0f64ff] px-3 py-2 text-xs font-black text-white" href="/training/memory-methods">查看方法库</Link></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{memoryMethods.map((method) => <Link className={`rounded-xl bg-white p-3 ring-1 ${method.featured ? "ring-[#f2c66c]" : "ring-[#dcecf7]"}`} href={`/training/memory-methods/${method.slug}`} key={method.id}><div className="flex items-center justify-between gap-2"><p className="text-xs font-black text-[#0f64ff]">方法 {method.number}</p>{method.recommended ? <span className="text-[10px] font-black text-[#b47a0c]">核心推荐</span> : null}</div><p className="mt-1 text-sm font-black text-[#12395a]">{method.shortTitle}</p><p className="mt-1 text-xs font-bold text-[#64849a]">{categoryLabels[method.category]} · {difficultyLabels[method.difficulty]}</p></Link>)}</div></section>;
}

function MethodCard({ method, index, progress, compact }: { method: typeof memoryMethods[number]; index: number; progress?: Progress; compact: boolean }) {
  return <motion.article animate={{ opacity: 1, y: 0 }} className="flex h-full flex-col rounded-2xl border border-white/80 bg-white p-5 shadow-[0_12px_30px_rgba(31,112,166,0.11)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(31,112,166,0.17)]" initial={{ opacity: 0, y: 12 }} transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.36 }}><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-[#e3f3ff] px-3 py-1 text-xs font-black text-[#176192]">方法 {method.number}</span><span className="rounded-full border border-[#d4e8f4] px-2.5 py-1 text-xs font-black text-[#5a829a]">{statusLabels[progress?.status ?? "not_started"]} · {progress?.proficiency ?? 0}%</span></div><h3 className="mt-4 text-xl font-black">{method.title}</h3><p className="mt-2 text-sm font-black leading-6 text-[#2b6388]">{method.summary}</p><div className="mt-3 flex flex-wrap gap-1.5 text-xs font-black text-[#5b7e93]"><span className="rounded-lg bg-[#f2f8fc] px-2 py-1">{categoryLabels[method.category]}</span><span className="rounded-lg bg-[#f2f8fc] px-2 py-1">{difficultyLabels[method.difficulty]}</span><span className="rounded-lg bg-[#f2f8fc] px-2 py-1">{method.maxCardTypes} 类牌</span></div><p className="mt-4 line-clamp-2 text-sm font-bold leading-6 text-[#64849a]">{method.suitableFor.join(" · ")}</p><div className="mt-auto flex gap-2 pt-5"><Link className="min-h-11 flex-1 rounded-xl bg-[#12395a] px-3 py-2.5 text-center text-sm font-black text-white" href={`/training/memory-methods/${method.slug}`}>查看方法</Link>{!compact && <Link className="min-h-11 flex-1 rounded-xl border border-[#a9d0e8] px-3 py-2.5 text-center text-sm font-black text-[#176192]" href={`/training/memory?method=${method.slug}`}>训练</Link>}</div></motion.article>;
}

function Recommendation() { return <div className="mt-3 grid gap-2 rounded-2xl border border-[#b9dcf5] bg-[#eef8ff] p-4 sm:grid-cols-2 lg:grid-cols-4">{[["双手一直抓牌", "脚步定位记牌法", "foot-position"], ["擅长记数字", "数字口令记牌法", "number-sequence"], ["容易记画面", "画面快照记牌法", "visual-snapshot"], ["想分析玩家", "玩家归属记牌法", "player-association"]].map(([q, a, slug]) => <Link className="rounded-xl bg-white p-3" href={`/training/memory-methods/${slug}`} key={slug}><p className="text-xs font-black text-[#6b99b6]">{q}</p><p className="mt-1 font-black text-[#176192]">→ {a}</p></Link>)}</div>; }
function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-[#eef8ff] px-4 py-3"><p className="text-[10px] font-black text-[#6b99b6]">{label}</p><p className="mt-1 text-sm font-black text-[#176192]">{value}</p></div>; }
