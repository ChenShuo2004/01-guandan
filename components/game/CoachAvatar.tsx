"use client";

import { CoachAvatar as CoachImageAvatar } from "@/components/coach/CoachAvatar";
import type { CoachAction } from "@/types/coach";
import type { CoachState } from "@/types/game";

interface TrainingCoachAvatarProps {
  mood: CoachState["mood"];
}

const moodAction: Record<CoachState["mood"], CoachAction> = {
  idle: "idle",
  thinking: "thinking",
  teaching: "point",
  warning: "warning"
};

export function CoachAvatar({ mood }: TrainingCoachAvatarProps) {
  return (
    <CoachImageAvatar
      action={moodAction[mood]}
      assetId={mood === "warning" ? "coach-analysis-mode" : undefined}
      className="rounded-[30px] border-white/70 bg-white/58 shadow-[0_18px_48px_rgba(45,125,188,0.24)] backdrop-blur-xl"
      imageClassName="p-1"
      size="arena"
    />
  );
}
