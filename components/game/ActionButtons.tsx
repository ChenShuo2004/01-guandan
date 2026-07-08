"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ActionButtonsProps {
  compact?: boolean;
}

export function ActionButtons({ compact = false }: ActionButtonsProps) {
  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "rounded-[28px] border border-white/65 bg-white/45 p-4 shadow-[0_18px_45px_rgba(38,126,190,0.18)] backdrop-blur-xl",
        compact && "p-3"
      )}
      initial={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.45, delay: 0.35 }}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#155175]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#32d583]" />
        本轮可出牌
      </div>
      <div className="flex flex-col gap-3">
        <ActionButton className="bg-[#4f8bc2] text-white" label="不出" />
        <ActionButton className="bg-[#ffd84d] text-[#5a4100]" label="提示" />
        <ActionButton className="bg-[#16c9bd] text-white" label="出牌" />
      </div>
    </motion.div>
  );
}

function ActionButton({ className, label }: { className: string; label: string }) {
  return (
    <button
      className={cn(
        "h-14 rounded-2xl px-5 text-lg font-black shadow-[0_12px_24px_rgba(28,109,172,0.20)] transition hover:-translate-y-0.5 active:scale-[0.98]",
        className
      )}
      type="button"
    >
      {label}
    </button>
  );
}
