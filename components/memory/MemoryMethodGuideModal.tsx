"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { memoryManual } from "@/content/memory-manual";
import type { MemoryMethodGuideReason } from "@/lib/memory/ObserverMemoryTraining";

interface MemoryMethodGuideModalProps {
  reason: MemoryMethodGuideReason;
  onContinue: () => void;
}

export function MemoryMethodGuideModal({ onContinue }: MemoryMethodGuideModalProps) {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndex = memoryManual.pages.length - 1;
  const activePage = memoryManual.pages[activeIndex] ?? memoryManual.pages[0];
  const fullManualHref = `/training/memory-methods?returnTo=${encodeURIComponent(pathname)}`;

  const goToPage = (index: number) => {
    setActiveIndex(Math.min(Math.max(index, 0), lastIndex));
  };

  return (
    <div
      className="fixed inset-0 z-[260] overflow-y-auto bg-[#071426]/24 px-3 py-2 text-white sm:px-6"
      onClick={onContinue}
    >
      <section className="mx-auto grid min-h-[calc(100dvh-1rem)] w-full max-w-[760px] content-center">
        <div
          className="rounded-[30px] border border-white/14 bg-[#080808] p-2 shadow-[0_30px_90px_rgba(0,0,0,0.42)] sm:p-4"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="relative mx-auto w-full max-w-[620px]">
            <span className="absolute right-3 top-3 z-20 rounded-full border border-[#ff7900]/35 bg-black/45 px-3 py-1 text-xs font-black text-[#ff8a18] backdrop-blur">
              {activeIndex + 1} / {memoryManual.pages.length}
            </span>

            <button
              aria-label="上一页"
              className="absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/18 bg-black/28 text-white shadow-[0_12px_28px_rgba(0,0,0,0.32)] backdrop-blur transition hover:bg-black/42 disabled:cursor-not-allowed disabled:opacity-25"
              disabled={activeIndex === 0}
              onClick={() => goToPage(activeIndex - 1)}
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_left</span>
            </button>

            <div
              className="relative aspect-[9/16] overflow-hidden rounded-[24px] bg-black shadow-[0_18px_46px_rgba(0,0,0,0.42)]"
              style={{ width: "min(94vw, calc((100dvh - 122px) * 9 / 16), 620px)" }}
            >
              <Image
                alt={activePage.alt}
                className="object-contain"
                fill
                priority
                sizes="(max-width: 640px) 94vw, 620px"
                src={activePage.src}
              />
            </div>

            <button
              aria-label="下一页"
              className="absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/18 bg-black/28 text-white shadow-[0_12px_28px_rgba(0,0,0,0.32)] backdrop-blur transition hover:bg-black/42 disabled:cursor-not-allowed disabled:opacity-25"
              disabled={activeIndex === lastIndex}
              onClick={() => goToPage(activeIndex + 1)}
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_right</span>
            </button>
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

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#ff7900]/35 bg-[#ff7900]/12 px-4 text-sm font-black text-[#ff8a18] transition hover:bg-[#ff7900]/18"
              href={fullManualHref}
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
