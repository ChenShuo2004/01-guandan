import type { CoachAction } from "@/types/coach";
import { coachActionAssetId } from "@/content/assets/coach-scenes";
import { cn } from "@/lib/utils";
import { CoachSceneImage } from "./CoachSceneImage";

interface CoachAvatarProps {
  action?: CoachAction;
  assetId?: string;
  className?: string;
  imageClassName?: string;
  size?: "sm" | "md" | "lg" | "arena";
}

const actionLabel: Record<CoachAction, string> = {
  idle: "Ace",
  wave: "Hi",
  thinking: "想",
  point: "讲",
  warning: "看",
  happy: "好",
  correct: "准",
  wrong: "改",
  celebrate: "稳"
};

const actionClasses: Partial<Record<CoachAction, string>> = {
  idle: "border-guandan-border bg-guandan-muted text-guandan-gold",
  wave: "border-guandan-blue/50 bg-guandan-blue/10 text-guandan-blue",
  thinking: "border-guandan-cyan/50 bg-guandan-cyan/10 text-guandan-cyan",
  point: "border-guandan-gold/55 bg-guandan-gold/10 text-guandan-gold",
  warning: "border-guandan-danger/55 bg-guandan-danger/10 text-guandan-danger",
  wrong: "border-guandan-danger/55 bg-guandan-danger/10 text-guandan-danger",
  happy: "border-guandan-success/55 bg-guandan-success/10 text-guandan-success",
  correct: "border-guandan-success/55 bg-guandan-success/10 text-guandan-success",
  celebrate: "border-guandan-reward/60 bg-guandan-reward/10 text-guandan-reward"
};

const sizeClasses: Record<NonNullable<CoachAvatarProps["size"]>, string> = {
  sm: "h-14 w-14 text-base",
  md: "h-16 w-16 text-lg",
  lg: "h-24 w-24 text-xl",
  arena: "h-28 w-28 text-xl sm:h-32 sm:w-32"
};

export function CoachAvatar({
  action = "idle",
  assetId,
  className,
  imageClassName,
  size = "md"
}: CoachAvatarProps) {
  const resolvedAssetId = assetId ?? coachActionAssetId[action] ?? coachActionAssetId.idle;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border font-black shadow-panel transition-colors",
        sizeClasses[size],
        actionClasses[action] ?? actionClasses.idle,
        className
      )}
      aria-label={`AI 教练状态：${action}`}
    >
      <CoachSceneImage
        assetId={resolvedAssetId}
        imageClassName={cn("object-contain", imageClassName)}
        sizes={size === "arena" ? "128px" : "64px"}
      />
      <span className="sr-only">{actionLabel[action]}</span>
    </div>
  );
}
