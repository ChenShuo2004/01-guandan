"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  fallbackHref?: string;
};

export function BackButton({ fallbackHref = "/" }: BackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      aria-label="返回"
      className="fixed left-4 top-4 z-50 inline-flex h-11 items-center gap-1.5 rounded-full border border-white/16 bg-[#061a35]/72 px-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-md transition hover:border-white/26 hover:bg-[#0a2548]/82 active:scale-[0.98] sm:left-6 sm:top-6"
      onClick={handleBack}
      type="button"
    >
      <span aria-hidden="true" className="text-base leading-none">
        ←
      </span>
      返回
    </button>
  );
}
