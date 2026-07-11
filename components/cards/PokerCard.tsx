import type { CSSProperties } from "react";
import type { CardSize, CardType, CardVariant, PokerCardData } from "@/types/poker";
import Image from "next/image";
import { getPokerCardAsset } from "@/lib/cards/cardAssets";
import { PokerCardCornerIndex } from "@/components/cards/PokerCardCornerIndex";
import { cn } from "@/lib/utils";

interface PokerCardProps {
  card: PokerCardData;
  compact?: boolean;
  dimensions?: {
    height: number;
    width: number;
  };
  levelRank?: string;
  selected?: boolean;
  size?: CardSize;
  variant?: CardVariant;
}

const sizeClasses: Record<CardSize, string> = {
  sm: "h-[72px] w-[51px]",
  md: "h-[124px] w-[89px]",
  lg: "h-[148px] w-[106px]",
  joker: "h-[124px] w-[89px]",
  hero: "h-[clamp(148px,30vh,252px)] w-[clamp(106px,21.4vh,180px)]"
};

const playedSizeClasses: Record<CardSize, string> = {
  sm: "h-[104px] w-[74px]",
  md: "h-[132px] w-[95px]",
  lg: "h-[148px] w-[106px]",
  joker: "h-[132px] w-[95px]",
  hero: "h-[clamp(148px,30vh,252px)] w-[clamp(106px,21.4vh,180px)]"
};

export function PokerCard({
  card,
  compact = false,
  dimensions,
  levelRank = "10",
  selected = false,
  size,
  variant = "hand"
}: PokerCardProps) {
  const isJoker = card.rank === "SJ" || card.rank === "BJ";
  const isLevelCard = !isJoker && card.rank === levelRank;
  const cardType: CardType = isJoker ? "joker" : isLevelCard ? "levelCard" : "normal";
  const resolvedSize: CardSize = size ?? (compact ? "sm" : "md");
  const cardSizeClass = variant === "played" ? playedSizeClasses[resolvedSize] : sizeClasses[resolvedSize];

  return (
    <div
      className={cn(
        "relative flex shrink-0 select-none overflow-hidden rounded-[13px] border border-white/95 bg-[#ffffff] shadow-[0_12px_22px_rgba(17,24,39,0.30)] ring-1 ring-[#9aa7b0]/70 transition",
        dimensions ? null : cardSizeClass,
        variant === "played" && "shadow-[0_12px_22px_rgba(17,24,39,0.28)] ring-1 ring-white/70",
        cardType === "levelCard" &&
          (variant === "played"
            ? "shadow-[0_0_0_3px_rgba(255,215,0,0.92),0_0_28px_rgba(255,215,0,0.78),0_16px_30px_rgba(120,84,0,0.28)] ring-[3px] ring-[#ffd76a]"
            : "shadow-[0_0_0_2px_rgba(255,215,0,0.72),0_0_24px_rgba(255,215,0,0.70),0_14px_26px_rgba(120,84,0,0.24)] ring-2 ring-[#ffd76a]/80")
      )}
      data-card-type={cardType}
      data-card-variant={variant}
      style={dimensions ? ({ height: dimensions.height, width: dimensions.width } satisfies CSSProperties) : undefined}
    >
      <Image
        alt={`${card.rank}${card.suit ?? ""}`}
        className={cn(
          "h-full w-full object-contain",
          variant === "played" && "brightness-[1.03] contrast-[1.08] saturate-[1.06]"
        )}
        draggable={false}
        fill
        sizes={dimensions ? `${Math.ceil(dimensions.width)}px` : "(max-width: 640px) 89px, 106px"}
        src={getPokerCardAsset(card)}
      />
      <PokerCardCornerIndex
        card={card}
        isLevelCard={isLevelCard}
        size={resolvedSize}
        variant={variant}
      />
      {isLevelCard ? (
        <>
          <span className="pointer-events-none absolute inset-0 rounded-[12px] bg-[radial-gradient(circle_at_50%_10%,rgba(255,232,140,0.58),transparent_48%),linear-gradient(135deg,rgba(255,255,255,0.24),transparent_44%)]" />
          <span
            aria-label="级牌"
            className={cn(
              "pointer-events-none absolute right-0 top-0 z-20 grid place-items-center bg-[#2ecf74] font-black text-white shadow-[-2px_3px_10px_rgba(20,120,70,0.35)] [clip-path:polygon(100%_0,100%_100%,0_0)]",
              variant === "played" ? "h-11 w-11 pl-1.5 pb-1.5 text-xs" : "h-9 w-9 pl-1 pb-1 text-[10px]"
            )}
          >
            <span className={cn("translate-x-1 -translate-y-1", variant === "played" && "text-[11px]")}>级</span>
          </span>
        </>
      ) : null}
    </div>
  );
}
