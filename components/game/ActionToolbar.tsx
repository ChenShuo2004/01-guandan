"use client";

import { motion } from "framer-motion";
import type { TrainingPhase } from "@/lib/guandan/gameState";
import { cn } from "@/lib/utils";

interface ActionToolbarProps {
  canAct: boolean;
  cardCounterVisible: boolean;
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
}

export function ActionToolbar({
  canAct,
  cardCounterVisible,
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
  onSkipAIWait
}: ActionToolbarProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mb-3 flex w-fit max-w-full flex-nowrap items-center justify-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2.5 shadow-[0_16px_36px_rgba(28,109,172,0.18)] backdrop-blur-md max-lg:mb-1 max-lg:gap-1.5 max-lg:px-2 max-lg:py-1.5"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      {phase === "idle" ? (
        <>
          <ToolbarButton icon="play_arrow" label="Start" onClick={onStart} tone="primary" />
          <ToolbarButton icon="home" label="Home" onClick={onBackToLobby} />
        </>
      ) : null}

      {phase === "playing" ? (
        <>
          <ToolbarButton disabled={!canAct} icon="block" label="Pass" onClick={onPass} tone="quiet" />
          <ToolbarButton disabled={!canAct} icon="tips_and_updates" label="Hint" onClick={onTip} tone="warning" />
          <ToolbarButton active={cardCounterVisible} icon="casino" label="Count" onClick={onToggleCardCounter} />
          <ToolbarButton icon="sort" label="Sort" onClick={onSortHand} />
          <ToolbarButton
            disabled={!canAct || selectedCount === 0}
            icon="send"
            label={selectedCount > 0 ? `Play ${selectedCount}` : "Play"}
            onClick={onPlay}
            tone="primary"
          />
          {isAIThinking ? (
            <ToolbarButton icon="skip_next" label="Skip" onClick={onSkipAIWait} tone="quiet" />
          ) : null}
          {selectedCount > 0 ? (
            <button className="sr-only" onClick={onUndo} type="button">
              Undo
            </button>
          ) : null}
        </>
      ) : null}

      {phase === "analysis" ? (
        <>
          <ToolbarButton icon="psychology" label="Solution" onClick={onShowSolution} tone="warning" />
          <ToolbarButton icon="play_arrow" label="Continue" onClick={onContinue} tone="primary" />
          <ToolbarButton icon="refresh" label="Restart" onClick={onRestart} />
        </>
      ) : null}

      {phase === "completed" ? (
        <>
          <ToolbarButton icon="refresh" label="Restart" onClick={onRestart} tone="primary" />
          <ToolbarButton icon="home" label="Home" onClick={onBackToLobby} />
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
        "inline-flex h-14 min-w-[92px] items-center justify-center gap-2 rounded-full border px-5 text-base font-black shadow-[0_10px_22px_rgba(28,109,172,0.16)] transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 max-lg:h-11 max-lg:min-w-0 max-lg:px-3 max-lg:text-xs",
        tone === "primary" && "border-[#0a57e5] bg-[#0f64ff] text-white",
        tone === "warning" && "border-[#ffd36d] bg-[#ffe08a] text-[#755000]",
        tone === "quiet" && "border-white/80 bg-white/90 text-[#17496d]",
        tone === "default" && "border-white/80 bg-white/80 text-[#17496d]",
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
