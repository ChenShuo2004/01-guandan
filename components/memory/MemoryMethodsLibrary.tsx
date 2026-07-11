"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { categoryLabels, difficultyLabels, memoryMethods } from "@/content/memory-methods";

export function MemoryMethodsLibrary({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return <CompactMethodList />;
  }

  return <main className="min-h-screen bg-[#eaf6ff] px-4 py-8 text-[#12395a] sm:px-6 lg:px-10"><div className="mx-auto max-w-7xl">
    <div className="mb-5 flex items-center justify-between gap-3">
      <h1 className="text-2xl font-black sm:text-3xl">选择你的记牌方式</h1>
      <Link className="shrink-0 rounded-xl border border-[#8fc4e5] bg-white px-4 py-2.5 text-sm font-black text-[#176192]" href="/">返回</Link>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{memoryMethods.map((method, index) => <MethodCard key={method.id} method={method} index={index} />)}</div>
  </div></main>;
}

function CompactMethodList() {
  return <section className="rounded-2xl border border-[#cfe3f5] bg-[#f5fbff] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f64ff]">记牌方法</p><p className="mt-1 text-lg font-black text-[#12395a]">找到适合自己的记忆动作</p></div><Link className="rounded-full bg-[#0f64ff] px-3 py-2 text-xs font-black text-white" href="/training/memory-methods">查看方法库</Link></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{memoryMethods.map((method) => <Link className={`rounded-xl bg-white p-3 ring-1 ${method.featured ? "ring-[#f2c66c]" : "ring-[#dcecf7]"}`} href={`/training/memory-methods/${method.slug}`} key={method.id}><div className="flex items-center justify-between gap-2"><p className="text-xs font-black text-[#0f64ff]">方法 {method.number}</p>{method.recommended ? <span className="text-[10px] font-black text-[#b47a0c]">核心推荐</span> : null}</div><p className="mt-1 text-sm font-black text-[#12395a]">{method.shortTitle}</p><p className="mt-1 text-xs font-bold text-[#64849a]">{categoryLabels[method.category]} · {difficultyLabels[method.difficulty]}</p></Link>)}</div></section>;
}

function MethodCard({ method, index }: { method: typeof memoryMethods[number]; index: number }) {
  return <motion.article animate={{ opacity: 1, y: 0 }} className="flex h-full flex-col rounded-2xl border border-white/80 bg-white p-5 shadow-[0_12px_30px_rgba(31,112,166,0.11)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(31,112,166,0.17)]" initial={{ opacity: 0, y: 12 }} transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.36 }}><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-[#e3f3ff] px-3 py-1 text-xs font-black text-[#176192]">方法 {method.number}</span></div><h3 className="mt-4 text-xl font-black">{method.title}</h3><p className="mt-2 text-sm font-black leading-6 text-[#2b6388]">{method.summary}</p><div className="mt-3 flex flex-wrap gap-1.5 text-xs font-black text-[#5b7e93]"><span className="rounded-lg bg-[#f2f8fc] px-2 py-1">{categoryLabels[method.category]}</span><span className="rounded-lg bg-[#f2f8fc] px-2 py-1">{difficultyLabels[method.difficulty]}</span><span className="rounded-lg bg-[#f2f8fc] px-2 py-1">{method.maxCardTypes} 类牌</span></div><p className="mt-4 line-clamp-2 text-sm font-bold leading-6 text-[#64849a]">{method.suitableFor.join(" · ")}</p><div className="mt-auto pt-5"><Link className="block min-h-11 rounded-xl bg-[#12395a] px-3 py-2.5 text-center text-sm font-black text-white" href={`/training/memory-methods/${method.slug}`}>查看方法</Link></div></motion.article>;
}
