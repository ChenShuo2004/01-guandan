"use client";

import { motion } from "framer-motion";
import type { TrainingPhase } from "@/lib/guandan/gameState";
import { cn } from "@/lib/utils";

interface ActionToolbarProps {
  canAct: boolean;
  cardCounterVisible: boolean;
  isArranging: boolean;
  isAIThinking: boolean;
  phase: TrainingPhase;
  selectedCount: number;
  onBackToLobby: () => void;
  onContinue: () => void;
  onPass: () => void;
  onPlay: () => void;
  onRestart: () => void;
  onShowSolution: () => void;
  onSortHand: () => void;
  onStart: () => void;
  onTip: () => void;
  onToggleCardCounter: () => void;
  onUndo: () => void;
  onSkipAIWait: () => void;
  onRestoreHand: () => void;
  restoreEnabled: boolean;
}

export function ActionToolbar({
  canAct,
  cardCounterVisible,
  isArranging,
  isAIThinking,
  phase,
  selectedCount,
  onBackToLobby,
  onContinue,
  onPass,
  onPlay,
  onRestart,
  onShowSolution,
  onSortHand,
  onStart,
  onTip,
  onToggleCardCounter,
  onUndo,
  onSkipAIWait,
  onRestoreHand,
  restoreEnabled
}: ActionToolbarProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="training-action-toolbar mx-auto mb-3 flex w-fit max-w-full flex-nowrap items-center justify-center gap-2 rounded-full border border-white/62 bg-white/54 px-4 py-2.5 shadow-[0_16px_36px_rgba(28,109,172,0.20)] backdrop-blur-md max-lg:mb-1 max-lg:gap-1.5 max-lg:px-2 max-lg:py-1.5"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      {phase === "idle" ? (
        <>
          <ToolbarButton icon="play_arrow" label="开始训练" onClick={onStart} tone="primary" />
          <ToolbarButton icon="home" label="返回大厅" onClick={onBackToLobby} />
        </>
      ) : null}

      {phase === "playing" ? (
        <>
          <ToolbarButton disabled={!canAct} icon="block" label="不出" onClick={onPass} tone="quiet" />
          <ToolbarButton disabled={!canAct} icon="tips_and_updates" label="提示" onClick={onTip} tone="warning" />
          <ToolbarButton active={cardCounterVisible} icon="casino" label="记牌器" onClick={onToggleCardCounter} />
          <ToolbarButton
            disabled={isArranging}
            icon={restoreEnabled ? "undo" : "sort"}
            label={restoreEnabled ? "恢复" : "理牌"}
            onClick={restoreEnabled ? onRestoreHand : onSortHand}
          />
          <ToolbarButton
            disabled={!canAct || selectedCount === 0}
            icon="send"
            label={selectedCount > 0 ? `出牌 ${selectedCount}` : "出牌"}
            onClick={onPlay}
            tone="primary"
          />
          {isAIThinking ? (
            <ToolbarButton icon="skip_next" label="跳过" onClick={onSkipAIWait} tone="quiet" />
          ) : null}
          {selectedCount > 0 ? (
            <button className="sr-only" onClick={onUndo} type="button">
              撤销
            </button>
          ) : null}
        </>
      ) : null}

      {phase === "analysis" ? (
        <>
          <ToolbarButton icon="psychology" label="推荐方案" onClick={onShowSolution} tone="warning" />
          <ToolbarButton icon="play_arrow" label="继续训练" onClick={onContinue} tone="primary" />
          <ToolbarButton icon="refresh" label="重新训练" onClick={onRestart} />
        </>
      ) : null}

      {phase === "completed" ? (
        <>
          <ToolbarButton icon="refresh" label="重新训练" onClick={onRestart} tone="primary" />
          <ToolbarButton icon="home" label="返回大厅" onClick={onBackToLobby} />
        </>
      ) : null}
    </motion.div>
  );
}

function ToolbarButton({
  active = false,
  disabled,
  icon,
  label,
  onClick,
  tone = "default"
}: {
  active?: boolean;
  disabled?: boolean;
  icon: string;
  label: string;
  onClick?: () => void;
  tone?: "default" | "primary" | "quiet" | "warning";
}) {
  return (
    <button
      className={cn(
        "inline-flex h-14 min-w-[92px] items-center justify-center gap-2 rounded-full border px-5 text-base font-black shadow-[0_10px_22px_rgba(28,109,172,0.18)] transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 max-lg:h-12 max-lg:min-w-12 max-lg:px-3 max-lg:text-xs",
        tone === "primary" && "border-[#0a57e5] bg-[#0f64ff] text-white",
        tone === "warning" && "border-[#ffd36d] bg-[#ffe08a] text-[#755000]",
        tone === "quiet" && "border-white/80 bg-white/85 text-[#17496d]",
        tone === "default" && "border-white/80 bg-white/76 text-[#17496d]",
        active && "border-[#0f64ff] bg-[#e8f2ff] text-[#0f64ff] ring-2 ring-[#0f64ff]/18"
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="material-symbols-outlined text-[19px] max-lg:text-[17px]">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
