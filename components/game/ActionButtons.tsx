"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ActionButtonsProps {
  compact?: boolean;
  canAct?: boolean;
  selectedCount?: number;
  onPass?: () => void;
  onTip?: () => void;
  onPlay?: () => void;
}

export function ActionButtons({
  compact = false,
  canAct = true,
  selectedCount = 0,
  onPass,
  onTip,
  onPlay
}: ActionButtonsProps) {
  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "rounded-[26px] border border-white/65 bg-[#6db8e8]/32 p-4 shadow-[0_18px_45px_rgba(38,126,190,0.18)] backdrop-blur-xl",
        compact && "p-3"
      )}
      initial={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.45, delay: 0.35 }}
    >
      <div className="mb-4 flex items-center justify-center gap-2 rounded-full bg-white/42 px-3 py-2 text-sm font-black text-[#155175]">
        <span className={cn("h-2.5 w-2.5 rounded-full", canAct ? "bg-[#21d071]" : "bg-[#90a4b8]")} />
        {canAct ? "本轮可出牌" : "等待 AI"}
      </div>
      <div className="flex flex-col gap-3">
        <ActionButton className="bg-[#0f74ef] text-white" disabled={!canAct} label="不出" onClick={onPass} />
        <ActionButton className="relative bg-[#ffd84d] text-[#6a4b00]" disabled={!canAct} label="提示" onClick={onTip}>
          <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-[#ff335a] text-[10px] text-white">
            2
          </span>
        </ActionButton>
        <ActionButton
          className="bg-[#16c9bd] text-white"
          disabled={!canAct || selectedCount === 0}
          label={selectedCount > 0 ? `出牌 ${selectedCount}` : "出牌"}
          onClick={onPlay}
        />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <MiniButton label="理牌" />
        <MiniButton label="上一步" />
      </div>
    </motion.div>
  );
}

function ActionButton({
  children,
  className,
  disabled,
  label,
  onClick
}: {
  children?: ReactNode;
  className: string;
  disabled?: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      className={cn(
        "relative h-14 rounded-2xl px-5 text-lg font-black shadow-[0_12px_24px_rgba(28,109,172,0.22)] transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0",
        className
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
      {label}
    </button>
  );
}

function MiniButton({ label }: { label: string }) {
  return (
    <button
      className="h-12 rounded-2xl bg-[#2f78b8]/56 text-sm font-black text-white shadow-[0_10px_20px_rgba(43,117,178,0.18)] transition hover:-translate-y-0.5"
      type="button"
    >
      {label}
    </button>
  );
}
