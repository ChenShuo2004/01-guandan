"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { TrainingPhase } from "@/lib/guandan/gameState";
import { cn } from "@/lib/utils";

interface ActionButtonsProps {
  compact?: boolean;
  canAct?: boolean;
  phase: TrainingPhase;
  selectedCount?: number;
  onBackToLobby?: () => void;
  onContinue?: () => void;
  onPass?: () => void;
  onPlay?: () => void;
  onRestart?: () => void;
  onShowSolution?: () => void;
  onSortHand?: () => void;
  onStart?: () => void;
  onTip?: () => void;
}

export function ActionButtons({
  compact = false,
  canAct = true,
  phase,
  selectedCount = 0,
  onBackToLobby,
  onContinue,
  onPass,
  onPlay,
  onRestart,
  onShowSolution,
  onSortHand,
  onStart,
  onTip
}: ActionButtonsProps) {
  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "rounded-[26px] border border-white/65 bg-[#6db8e8]/32 p-4 shadow-[0_18px_45px_rgba(38,126,190,0.18)] backdrop-blur-xl",
        compact && "p-3"
      )}
      initial={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.45, delay: 0.2 }}
    >
      <StatusPill canAct={canAct} phase={phase} />

      {phase === "idle" ? (
        <div className="flex flex-col gap-3">
          <ActionButton className="bg-[#ffd84d] text-[#6a4b00]" label="开始训练" onClick={onStart} />
          <ActionButton className="border border-white/65 bg-white/55 text-[#17496d]" label="返回大厅" onClick={onBackToLobby} />
        </div>
      ) : null}

      {phase === "playing" ? (
        <div className="flex flex-col gap-3">
          <ActionButton className="bg-[#0f74ef] text-white" disabled={!canAct} label="不出" onClick={onPass} />
          <ActionButton className="relative bg-[#ffd84d] text-[#6a4b00]" disabled={!canAct} label="提示" onClick={onTip}>
            <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-[#ff335a] text-[10px] text-white">
              2
            </span>
          </ActionButton>
          {!compact || selectedCount === 0 ? (
            <ActionButton className="bg-[#16c9bd] text-white" disabled={!canAct || selectedCount === 0} label={selectedCount > 0 ? `出牌 ${selectedCount}` : "出牌"} onClick={onPlay} />
          ) : null}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <MiniAction label="理牌" onClick={onSortHand} />
            <MiniAction label="上一步" />
          </div>
        </div>
      ) : null}

      {phase === "analysis" ? (
        <div className="flex flex-col gap-3">
          <ActionButton className="bg-[#ffd84d] text-[#6a4b00]" label="查看推荐方案" onClick={onShowSolution} />
          <ActionButton className="bg-[#16c9bd] text-white" label="继续训练" onClick={onContinue} />
          <ActionButton className="border border-white/65 bg-white/55 text-[#17496d]" label="重新训练" onClick={onRestart} />
        </div>
      ) : null}

      {phase === "completed" ? (
        <div className="flex flex-col gap-3">
          <ActionButton className="bg-[#ffd84d] text-[#6a4b00]" label="重新训练" onClick={onRestart} />
          <ActionButton className="border border-white/65 bg-white/55 text-[#17496d]" label="返回训练大厅" onClick={onBackToLobby} />
        </div>
      ) : null}
    </motion.div>
  );
}

function StatusPill({ canAct, phase }: { canAct: boolean; phase: TrainingPhase }) {
  const label: Record<TrainingPhase, string> = {
    idle: "准备开始",
    playing: canAct ? "等待你的判断" : "等待 AI 行动",
    analysis: "AI 分析中",
    completed: "训练完成"
  };

  return (
    <div className="mb-4 flex items-center justify-center gap-2 rounded-full bg-white/42 px-3 py-2 text-sm font-black text-[#155175]">
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          phase === "playing" && canAct ? "bg-[#21d071]" : phase === "analysis" ? "bg-[#ffd84d]" : "bg-[#90a4b8]"
        )}
      />
      {label[phase]}
    </div>
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
        "relative min-h-14 rounded-2xl px-4 py-3 text-[20px] font-black shadow-[0_12px_24px_rgba(28,109,172,0.22)] transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0",
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

function MiniAction({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      className="min-h-16 rounded-2xl bg-[#2f78b8]/62 px-3 py-2 text-base font-black text-white shadow-[0_10px_22px_rgba(28,109,172,0.18)] transition hover:-translate-y-0.5 active:scale-[0.98]"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
