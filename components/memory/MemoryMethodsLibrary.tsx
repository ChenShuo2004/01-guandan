"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { categoryLabels, difficultyLabels, memoryMethods } from "@/content/memory-methods";

function buildMethodDetailHref(slug: string, returnTo?: string | null) {
  return returnTo
    ? `/training/memory-methods/${slug}?returnTo=${encodeURIComponent(returnTo)}`
    : `/training/memory-methods/${slug}`;
}

export function MemoryMethodCardGrid({ returnTo = null }: { returnTo?: string | null }) {
  const pathname = usePathname();
  const resolvedReturnTo = returnTo ?? (pathname?.startsWith("/") ? pathname : "/practice");

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {memoryMethods.map((method) => (
        <Link
          className={`rounded-xl bg-white p-3 ring-1 transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(31,112,166,0.14)] ${method.featured ? "ring-[#f2c66c]" : "ring-[#dcecf7]"}`}
          href={buildMethodDetailHref(method.slug, resolvedReturnTo)}
          key={method.id}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-black text-[#0f64ff]">方法 {method.number}</p>
            {method.recommended ? <span className="text-[10px] font-black text-[#b47a0c]">核心推荐</span> : null}
          </div>
          <p className="mt-1 text-sm font-black text-[#12395a]">{method.shortTitle}</p>
          <p className="mt-1 text-xs font-bold text-[#64849a]">
            {categoryLabels[method.category]} · {difficultyLabels[method.difficulty]}
          </p>
        </Link>
      ))}
    </div>
  );
}

export function MemoryMethodsLibrary({ returnTo = null }: { returnTo?: string | null }) {
  const router = useRouter();

  const handleBack = () => {
    if (returnTo?.startsWith("/")) {
      router.push(returnTo);
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/practice");
  };

  return (
    <main className="min-h-screen bg-[#eaf6ff] px-4 py-8 text-[#12395a] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black sm:text-3xl">选择你的记牌方式</h1>
          <button
            className="shrink-0 rounded-xl border border-[#8fc4e5] bg-white px-4 py-2.5 text-sm font-black text-[#176192]"
            onClick={handleBack}
            type="button"
          >
            返回
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {memoryMethods.map((method, index) => (
            <MethodCard key={method.id} method={method} index={index} returnTo={returnTo} />
          ))}
        </div>
      </div>
    </main>
  );
}

function MethodCard({
  method,
  index,
  returnTo,
}: {
  method: (typeof memoryMethods)[number];
  index: number;
  returnTo?: string | null;
}) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col rounded-2xl border border-white/80 bg-white p-5 shadow-[0_12px_30px_rgba(31,112,166,0.11)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(31,112,166,0.17)]"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.36 }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-[#e3f3ff] px-3 py-1 text-xs font-black text-[#176192]">方法 {method.number}</span>
      </div>
      <h3 className="mt-4 text-xl font-black">{method.title}</h3>
      <p className="mt-2 text-sm font-black leading-6 text-[#2b6388]">{method.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-black text-[#5b7e93]">
        <span className="rounded-lg bg-[#f2f8fc] px-2 py-1">{categoryLabels[method.category]}</span>
        <span className="rounded-lg bg-[#f2f8fc] px-2 py-1">{difficultyLabels[method.difficulty]}</span>
        <span className="rounded-lg bg-[#f2f8fc] px-2 py-1">{method.maxCardTypes} 类牌</span>
      </div>
      <p className="mt-4 line-clamp-2 text-sm font-bold leading-6 text-[#64849a]">{method.suitableFor.join(" · ")}</p>
      <div className="mt-auto pt-5">
        <Link
          className="block min-h-11 rounded-xl bg-[#12395a] px-3 py-2.5 text-center text-sm font-black text-white"
          href={buildMethodDetailHref(method.slug, returnTo)}
        >
          查看方法
        </Link>
      </div>
    </motion.article>
  );
}
