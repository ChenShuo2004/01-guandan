"use client";

import { cn } from "@/lib/utils";

interface CardSortButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export function CardSortButton({ disabled = false, onClick }: CardSortButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-full border border-white/55 bg-white/70 px-4 text-sm font-black text-[#17496d] shadow-[0_10px_22px_rgba(42,132,196,0.16)] transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      整理手牌
    </button>
  );
}
