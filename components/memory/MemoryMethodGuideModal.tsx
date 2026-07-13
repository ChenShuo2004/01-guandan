"use client";

import Link from "next/link";
import type { MemoryMethodGuideReason } from "@/lib/memory/ObserverMemoryTraining";

interface MemoryMethodGuideModalProps {
  reason: MemoryMethodGuideReason;
  onContinue: () => void;
}

export function MemoryMethodGuideModal({ reason, onContinue }: MemoryMethodGuideModalProps) {
  const isWrongStreak = reason === "wrong_streak";

  return (
    <div className="fixed inset-0 z-[260] overflow-y-auto bg-[#071426]/88 px-4 py-5 text-[#12395a] backdrop-blur-xl sm:px-6">
      <section className="mx-auto grid min-h-[calc(100dvh-2.5rem)] w-full max-w-xl content-center">
        <div className="overflow-hidden rounded-[28px] border border-white/75 bg-[#f8fcff] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff7900]">
            {isWrongStreak ? "Memory recovery" : "Before training"}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#101828]">
            {isWrongStreak ? "先把档位法稳住，再继续练" : "先学会一套记大小王的动作"}
          </h2>
          <p className="mt-3 text-base font-bold leading-7 text-[#344054]">
            陈硕档位法用左脚记小王、右脚记大王，用脚的位置表达出了几张。先看完 9 页手册，再回到牌局里观察，会更容易进入状态。
          </p>

          <div className="mt-5 grid gap-2 rounded-2xl bg-[#fff7ed] p-4 text-sm font-black text-[#9a4b00]">
            <p>左脚：小王</p>
            <p>右脚：大王</p>
            <p>垂放、前伸、后退：对应 0、1、2 张</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#ff7900]/30 bg-[#fff3e6] px-5 text-base font-black text-[#a64b00] transition hover:-translate-y-0.5"
              href="/training/memory-methods?returnTo=/practice"
            >
              查看档位法手册
            </Link>
            <button
              className="min-h-12 rounded-full bg-[#0f64ff] px-5 text-base font-black text-white shadow-[0_14px_30px_rgba(15,100,255,0.26)] transition hover:-translate-y-0.5 active:translate-y-0"
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
