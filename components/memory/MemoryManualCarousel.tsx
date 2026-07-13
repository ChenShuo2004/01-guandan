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
    <main className="min-h-screen bg-[#080808] px-3 py-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col">
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

        <section className="mt-3 text-center sm:mt-4">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#ff8a18]">Memory manual</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">{manual.title}</h1>
          <p className="mt-1 text-sm font-bold text-white/62 sm:text-base">{manual.subtitle}</p>
        </section>

        <section className="relative mt-3 grid min-h-0 flex-1 place-items-center sm:mt-4">
          <div className="relative w-full max-w-[860px] px-10 sm:px-16 lg:px-20">
            <button
              aria-label="上一页"
              className="absolute left-0 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/16 bg-white/10 text-white shadow-[0_16px_34px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-25 sm:h-14 sm:w-14"
              disabled={activeIndex === 0}
              onClick={() => goToPage(activeIndex - 1)}
              type="button"
            >
              <span className="material-symbols-outlined text-[26px]">chevron_left</span>
            </button>

            <div
              className="flex snap-x snap-mandatory overflow-x-auto rounded-[28px] border border-white/10 bg-[#111] shadow-[0_24px_70px_rgba(0,0,0,0.45)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onScroll={handleScroll}
              ref={scrollerRef}
            >
              {manual.pages.map((page, index) => (
                <article className="grid min-w-full snap-center place-items-center px-2 py-3 sm:px-4 sm:py-4" key={page.id}>
                  <div
                    className="relative aspect-[9/16] overflow-hidden rounded-[22px] bg-black shadow-[0_18px_46px_rgba(0,0,0,0.42)]"
                    style={{ width: "min(82vw, calc((100dvh - 190px) * 9 / 16), 560px)" }}
                  >
                    <Image
                      alt={page.alt}
                      className="object-contain"
                      fill
                      priority={index === 0}
                      sizes="(max-width: 640px) 82vw, 560px"
                      src={page.src}
                    />
                  </div>
                </article>
              ))}
            </div>

            <button
              aria-label="下一页"
              className="absolute right-0 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[#ff7900] text-black shadow-[0_16px_34px_rgba(255,121,0,0.32)] transition hover:-translate-y-[52%] disabled:cursor-not-allowed disabled:opacity-35 sm:h-14 sm:w-14"
              disabled={activeIndex === lastIndex}
              onClick={() => goToPage(activeIndex + 1)}
              type="button"
            >
              <span className="material-symbols-outlined text-[26px]">chevron_right</span>
            </button>
          </div>
        </section>

        <footer className="mt-4 flex flex-col items-center gap-3">
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

          {activeIndex === lastIndex ? (
            <Link
              className="inline-flex min-h-11 min-w-44 items-center justify-center rounded-2xl bg-[#ff7900] px-5 text-sm font-black text-black shadow-[0_14px_30px_rgba(255,121,0,0.32)] transition hover:-translate-y-0.5"
              href={manual.trainingHref}
            >
              开始训练
            </Link>
          ) : null}
        </footer>
      </div>
    </main>
  );
}
