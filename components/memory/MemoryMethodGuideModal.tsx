"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { memoryManual } from "@/content/memory-manual";
import type { MemoryMethodGuideReason } from "@/lib/memory/ObserverMemoryTraining";

interface MemoryMethodGuideModalProps {
  reason: MemoryMethodGuideReason;
  onContinue: () => void;
}

export function MemoryMethodGuideModal({ reason, onContinue }: MemoryMethodGuideModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isWrongStreak = reason === "wrong_streak";
  const lastIndex = memoryManual.pages.length - 1;
  const activePage = memoryManual.pages[activeIndex] ?? memoryManual.pages[0];

  const goToPage = (index: number) => {
    setActiveIndex(Math.min(Math.max(index, 0), lastIndex));
  };

  return (
    <div className="fixed inset-0 z-[260] overflow-y-auto bg-[#071426]/88 px-4 py-4 text-white backdrop-blur-xl sm:px-6">
      <section className="mx-auto grid min-h-[calc(100dvh-2rem)] w-full max-w-[480px] content-center">
        <div className="overflow-hidden rounded-[28px] border border-white/14 bg-[#080808] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.42)] sm:p-4">
          <header className="flex items-center justify-between gap-3 px-1 pb-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff8a18]">
                {isWrongStreak ? "Memory recovery" : "Before training"}
              </p>
              <h2 className="mt-1 text-lg font-black tracking-tight text-white sm:text-xl">先看档位法手册</h2>
            </div>
            <span className="rounded-full border border-[#ff7900]/35 bg-[#ff7900]/12 px-3 py-1 text-xs font-black text-[#ff8a18]">
              {activeIndex + 1} / {memoryManual.pages.length}
            </span>
          </header>

          <div className="relative mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-[22px] bg-black shadow-[0_18px_46px_rgba(0,0,0,0.42)]">
            <Image
              alt={activePage.alt}
              className="object-contain"
              fill
              priority
              sizes="(max-width: 640px) 86vw, 360px"
              src={activePage.src}
            />
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5">
            {memoryManual.pages.map((page, index) => (
              <button
                aria-label={`跳到${page.title}`}
                className={`h-1.5 rounded-full transition-all ${activeIndex === index ? "w-7 bg-[#ff7900]" : "w-1.5 bg-white/24"}`}
                key={page.id}
                onClick={() => goToPage(index)}
                type="button"
              />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              className="min-h-11 rounded-2xl border border-white/14 bg-white/8 px-4 text-sm font-black text-white/86 transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-35"
              disabled={activeIndex === 0}
              onClick={() => goToPage(activeIndex - 1)}
              type="button"
            >
              上一页
            </button>
            <button
              className="min-h-11 rounded-2xl bg-[#ff7900] px-4 text-sm font-black text-black shadow-[0_14px_30px_rgba(255,121,0,0.3)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35"
              disabled={activeIndex === lastIndex}
              onClick={() => goToPage(activeIndex + 1)}
              type="button"
            >
              下一页
            </button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#ff7900]/35 bg-[#ff7900]/12 px-4 text-sm font-black text-[#ff8a18] transition hover:bg-[#ff7900]/18"
              href="/training/memory-methods?returnTo=/practice"
            >
              打开完整手册
            </Link>
            <button
              className="min-h-11 rounded-2xl bg-[#0f64ff] px-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(15,100,255,0.26)] transition hover:-translate-y-0.5"
              onClick={onContinue}
              type="button"
            >
              继续训练
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
