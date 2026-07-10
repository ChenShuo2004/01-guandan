import type { CardSize, CardType, CardVariant, PokerCardData } from "@/types/poker";
import Image from "next/image";
import { getPokerCardAsset } from "@/lib/cards/cardAssets";
import { cn } from "@/lib/utils";

interface PokerCardProps {
  card: PokerCardData;
  compact?: boolean;
  levelRank?: string;
  selected?: boolean;
  size?: CardSize;
  variant?: CardVariant;
}

const sizeClasses: Record<CardSize, string> = {
  sm: "h-[72px] w-[51px]",
  md: "h-[124px] w-[89px]",
  lg: "h-[148px] w-[106px]",
  joker: "h-[134px] w-[96px]"
};

const playedSizeClasses: Record<CardSize, string> = {
  sm: "h-[104px] w-[74px]",
  md: "h-[132px] w-[95px]",
  lg: "h-[148px] w-[106px]",
  joker: "h-[136px] w-[97px]"
};

export function PokerCard({
  card,
  compact = false,
  levelRank = "10",
  selected = false,
  size,
  variant = "hand"
}: PokerCardProps) {
  const isJoker = card.rank === "SJ" || card.rank === "BJ";
  const isLevelCard = !isJoker && card.rank === levelRank;
  const cardType: CardType = isJoker ? "joker" : isLevelCard ? "levelCard" : "normal";
  const resolvedSize: CardSize = size ?? (isJoker ? "joker" : compact ? "sm" : "md");
  const cardSizeClass = variant === "played" ? playedSizeClasses[resolvedSize] : sizeClasses[resolvedSize];

  return (
    <div
      className={cn(
        "relative flex shrink-0 select-none overflow-hidden rounded-[13px] bg-white shadow-[0_10px_18px_rgba(17,24,39,0.20)] transition",
        cardSizeClass,
        cardType === "levelCard" && "shadow-[0_0_0_2px_rgba(255,215,0,0.72),0_0_24px_rgba(255,215,0,0.70),0_14px_26px_rgba(120,84,0,0.24)] ring-2 ring-[#ffd76a]/80"
      )}
      data-card-type={cardType}
    >
      <Image
        alt={`${card.rank}${card.suit ?? ""}`}
        className="h-full w-full object-contain"
        draggable={false}
        fill
        sizes="(max-width: 640px) 89px, 106px"
        src={getPokerCardAsset(card)}
      />
      {isLevelCard ? (
        <>
          <span className="pointer-events-none absolute inset-0 rounded-[12px] bg-[radial-gradient(circle_at_50%_10%,rgba(255,232,140,0.52),transparent_46%),linear-gradient(135deg,rgba(255,255,255,0.22),transparent_44%)]" />
          <span
            aria-label="级牌"
            className="pointer-events-none absolute right-0 top-0 z-10 grid h-9 w-9 place-items-center bg-[#43d27d] pl-1 pb-1 text-xs font-black text-white shadow-[-2px_2px_8px_rgba(20,120,70,0.25)] [clip-path:polygon(100%_0,100%_100%,0_0)]"
          >
            <span className="translate-x-1 -translate-y-1 text-[10px]">级</span>
          </span>
        </>
      ) : null}
    </div>
  );
}
