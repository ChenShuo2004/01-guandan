import type { CoachAction } from "@/types/coach";
import { CoachAvatar } from "./CoachAvatar";

interface CoachBubbleProps {
  text: string;
  action?: CoachAction;
  caption?: string;
}

export function CoachBubble({ text, action = "idle", caption }: CoachBubbleProps) {
  return (
    <div className="flex gap-3 rounded-3xl border border-guandan-border bg-guandan-card p-4">
      <CoachAvatar action={action} />
      <div>
        <p className="text-[13px] font-bold text-guandan-gold">AI 教练</p>
        <p className="mt-1 text-base font-bold leading-7">{text}</p>
        {caption ? <p className="mt-1 text-sm leading-6 text-guandan-subtext">{caption}</p> : null}
      </div>
    </div>
  );
}
