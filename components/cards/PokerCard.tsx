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
  sm: "h-[72px] w-[50px]",
  md: "h-[124px] w-[86px]",
  lg: "h-[148px] w-[102px]",
  joker: "h-[134px] w-[92px]"
};

const playedSizeClasses: Record<CardSize, string> = {
  sm: "h-[78px] w-[54px]",
  md: "h-[104px] w-[72px]",
  lg: "h-[124px] w-[86px]",
  joker: "h-[112px] w-[78px]"
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
        selected && "-translate-y-5 shadow-[0_0_0_3px_rgba(255,215,0,0.78),0_18px_28px_rgba(17,24,39,0.30)]",
        cardType === "levelCard" && "shadow-[0_0_0_2px_rgba(255,215,0,0.72),0_0_24px_rgba(255,215,0,0.70),0_14px_26px_rgba(120,84,0,0.24)] ring-2 ring-[#ffd76a]/80"
      )}
      data-card-type={cardType}
    >
      <Image
        alt={`${card.rank}${card.suit ?? ""}`}
        className="h-full w-full object-cover"
        draggable={false}
        fill
        sizes="(max-width: 640px) 86px, 102px"
        src={getPokerCardAsset(card)}
      />
      {card.isWild ? (
        <span className="absolute bottom-9 right-1 rounded-[5px] border border-[#e3a900] bg-[#fff4b8] px-1 text-[10px] font-black leading-4 text-[#8c5d00]">
          Wild
        </span>
      ) : null}
      {isLevelCard ? (
        <span className="pointer-events-none absolute inset-0 rounded-[12px] bg-[radial-gradient(circle_at_50%_10%,rgba(255,232,140,0.52),transparent_46%),linear-gradient(135deg,rgba(255,255,255,0.22),transparent_44%)]" />
      ) : null}
    </div>
  );
}
