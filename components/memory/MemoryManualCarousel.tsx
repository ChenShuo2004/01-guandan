"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import type { MemoryManual } from "@/content/memory-manual";

function getSafeReturnTo(returnTo?: string | null) {
  return returnTo?.startsWith("/") ? returnTo : "/practice";
}

export function MemoryManualCarousel({
  manual,
  returnTo
}: {
  manual: MemoryManual;
  returnTo?: string | null;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const safeReturnTo = getSafeReturnTo(returnTo);
  const lastIndex = manual.pages.length - 1;
  const nextPage = manual.pages[Math.min(activeIndex + 1, lastIndex)];

  const pageLabel = useMemo(() => `${activeIndex + 1} / ${manual.pages.length}`, [activeIndex, manual.pages.length]);

  const goToPage = useCallback((index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), lastIndex);
    setActiveIndex(nextIndex);

    const scroller = scrollerRef.current;
    const target = scroller?.children.item(nextIndex) as HTMLElement | null;
    target?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [lastIndex]);

  const handleScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const nextIndex = Math.round(scroller.scrollLeft / Math.max(scroller.clientWidth, 1));
    setActiveIndex(Math.min(Math.max(nextIndex, 0), lastIndex));
  }, [lastIndex]);

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-5xl flex-col">
        <header className="flex items-center justify-between gap-3">
          <Link
            className="inline-flex min-h-10 items-center gap-1 rounded-full border border-white/12 bg-white/8 px-3 text-sm font-black text-white/86 backdrop-blur transition hover:bg-white/14"
            href={safeReturnTo}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            返回
          </Link>
          <div className="rounded-full border border-[#ff7900]/35 bg-[#ff7900]/12 px-3 py-1 text-sm font-black text-[#ff8a18]">
            {pageLabel}
          </div>
        </header>

        <section className="mt-5 text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#ff8a18]">Memory manual</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">{manual.title}</h1>
          <p className="mt-2 text-sm font-bold text-white/62 sm:text-base">{manual.subtitle}</p>
        </section>

        <section className="mt-5 min-h-0 flex-1">
          <div
            className="flex h-full snap-x snap-mandatory overflow-x-auto rounded-[28px] border border-white/10 bg-[#111] shadow-[0_24px_70px_rgba(0,0,0,0.45)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onScroll={handleScroll}
            ref={scrollerRef}
          >
            {manual.pages.map((page, index) => (
              <article className="grid min-w-full snap-center place-items-center px-2 py-3 sm:px-5 sm:py-5" key={page.id}>
                <div className="relative aspect-[9/16] w-full max-w-[min(78vw,430px)] overflow-hidden rounded-[22px] bg-black shadow-[0_18px_46px_rgba(0,0,0,0.42)] sm:max-w-[430px]">
                  <Image
                    alt={page.alt}
                    className="object-contain"
                    fill
                    priority={index === 0}
                    sizes="(max-width: 640px) 92vw, 430px"
                    src={page.src}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-5">
          <div className="flex items-center justify-center gap-1.5">
            {manual.pages.map((page, index) => (
              <button
                aria-label={`跳到${page.title}`}
                className={`h-1.5 rounded-full transition-all ${activeIndex === index ? "w-7 bg-[#ff7900]" : "w-1.5 bg-white/24"}`}
                key={page.id}
                onClick={() => goToPage(index)}
                type="button"
              />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-[1fr_1.35fr] gap-3 sm:mx-auto sm:max-w-xl">
            <button
              className="min-h-12 rounded-2xl border border-white/14 bg-white/8 px-4 text-sm font-black text-white/86 transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-35"
              disabled={activeIndex === 0}
              onClick={() => goToPage(activeIndex - 1)}
              type="button"
            >
              上一页
            </button>

            {activeIndex === lastIndex ? (
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#ff7900] px-4 text-sm font-black text-black shadow-[0_14px_30px_rgba(255,121,0,0.32)] transition hover:-translate-y-0.5"
                href={manual.trainingHref}
              >
                开始训练
              </Link>
            ) : (
              <button
                className="min-h-12 rounded-2xl bg-[#ff7900] px-4 text-sm font-black text-black shadow-[0_14px_30px_rgba(255,121,0,0.32)] transition hover:-translate-y-0.5"
                onClick={() => goToPage(activeIndex + 1)}
                type="button"
              >
                下一页 · {nextPage?.title}
              </button>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}
