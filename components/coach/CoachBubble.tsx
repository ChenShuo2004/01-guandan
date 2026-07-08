import type { CoachAction } from "@/types/coach";
import { cn } from "@/lib/utils";
import { CoachAvatar } from "./CoachAvatar";

interface CoachBubbleProps {
  text: string;
  action?: CoachAction;
  caption?: string;
  label?: string;
}

const bubbleClasses: Partial<Record<CoachAction, string>> = {
  idle: "border-white/75 bg-white/72",
  wave: "border-blue-200 bg-white/72",
  thinking: "border-cyan-200 bg-cyan-50/76",
  point: "border-amber-200 bg-amber-50/76",
  warning: "border-amber-300 bg-amber-50/82",
  wrong: "border-rose-300 bg-rose-50/82",
  happy: "border-emerald-300 bg-emerald-50/82",
  correct: "border-emerald-300 bg-emerald-50/82",
  celebrate: "border-amber-300 bg-amber-50/82"
};

const labelClasses: Partial<Record<CoachAction, string>> = {
  warning: "text-amber-700",
  wrong: "text-rose-700",
  happy: "text-emerald-700",
  correct: "text-emerald-700",
  celebrate: "text-amber-700",
  wave: "text-blue-700",
  thinking: "text-cyan-700"
};

export function CoachBubble({
  text,
  action = "idle",
  caption,
  label = "Ace AI 教练"
}: CoachBubbleProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-[24px] border p-4 text-slate-950 shadow-[0_24px_70px_rgba(37,99,235,0.12)] backdrop-blur-2xl",
        bubbleClasses[action] ?? bubbleClasses.idle
      )}
    >
      <CoachAvatar action={action} />
      <div className="min-w-0">
        <p className={cn("text-[13px] font-black text-blue-700", labelClasses[action])}>
          {label}
        </p>
        <p className="mt-1 text-base font-bold leading-7">{text}</p>
        {caption ? <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{caption}</p> : null}
      </div>
    </div>
  );
}
