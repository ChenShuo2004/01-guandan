import type { PokerCardData } from "@/types/poker";
import type { CardSize, CardType, CardVariant } from "@/types/poker";
import { cn } from "@/lib/utils";

interface PokerCardProps {
  card: PokerCardData;
  compact?: boolean;
  levelRank?: string;
  selected?: boolean;
  size?: CardSize;
  variant?: CardVariant;
}

const suitSymbol = {
  spade: "♠",
  heart: "♥",
  club: "♣",
  diamond: "♦"
};

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
  const isRed = card.suit === "heart" || card.suit === "diamond";
  const isSmallJoker = card.rank === "SJ";
  const isBigJoker = card.rank === "BJ";
  const jokerLabel = isSmallJoker ? "SMALL" : isBigJoker ? "BIG" : null;
  const isJoker = Boolean(jokerLabel);
  const isLevelCard = !isJoker && card.rank === levelRank;
  const cardType: CardType = isJoker ? "joker" : isLevelCard ? "levelCard" : "normal";
  const resolvedSize: CardSize = size ?? (isJoker ? "joker" : compact ? "sm" : "md");
  const rankColor = isRed ? "text-[#c61922]" : "text-[#111827]";
  const cardSizeClass = variant === "played" ? playedSizeClasses[resolvedSize] : sizeClasses[resolvedSize];

  return (
    <div
      className={cn(
        "relative flex shrink-0 select-none flex-col overflow-hidden rounded-[13px] border bg-white font-black shadow-[0_10px_18px_rgba(17,24,39,0.20)] transition",
        cardSizeClass,
        selected && "-translate-y-5 border-[#ffd700] shadow-[0_0_0_3px_rgba(255,215,0,0.78),0_18px_28px_rgba(17,24,39,0.30)]",
        cardType === "normal" && "border-[#c8d0d8]",
        cardType === "levelCard" && "border-[#f0b72f] ring-2 ring-[#ffd76a]/70",
        isSmallJoker && "border-[#2b7cff] bg-[linear-gradient(180deg,#ffffff,#eaf4ff)]",
        isBigJoker && "border-[#d62d2d] bg-[linear-gradient(180deg,#ffffff,#fff0f0)]"
      )}
      data-card-type={cardType}
    >
      {isLevelCard ? (
        <span className="absolute right-1 top-1 z-10 rounded-[5px] bg-[#ffd76a] px-1.5 py-0.5 text-[10px] font-black text-[#7a4a00] shadow">
          级
        </span>
      ) : null}
      {isJoker ? (
        <JokerFace big={isBigJoker} />
      ) : (
        <NormalFace rank={card.rank} rankColor={rankColor} suit={card.suit} />
      )}
      {card.isWild ? (
        <span className="absolute bottom-9 right-1 rounded-[5px] border border-[#e3a900] bg-[#fff4b8] px-1 text-[10px] font-black leading-4 text-[#8c5d00]">
          配
        </span>
      ) : null}
      {isLevelCard ? (
        <span className="pointer-events-none absolute inset-0 rounded-[12px] bg-[radial-gradient(circle_at_50%_10%,rgba(255,224,126,0.42),transparent_42%)]" />
      ) : null}
    </div>
  );
}

function NormalFace({
  rank,
  rankColor,
  suit
}: {
  rank: string;
  rankColor: string;
  suit?: keyof typeof suitSymbol;
}) {
  const suitText = suit ? suitSymbol[suit] : "";

  return (
    <div className={cn("relative flex h-full flex-col justify-between p-2", rankColor)}>
      <div className="flex flex-col items-start leading-none">
        <span className="text-[28px] leading-[0.88] tracking-[-0.04em]">{rank}</span>
        <span className="mt-1 text-[22px] leading-none">{suitText}</span>
      </div>
      <span className="self-center text-[54px] leading-none">{suitText}</span>
      <div className="flex rotate-180 flex-col items-start self-end leading-none">
        <span className="text-[28px] leading-[0.88] tracking-[-0.04em]">{rank}</span>
        <span className="mt-1 text-[22px] leading-none">{suitText}</span>
      </div>
    </div>
  );
}

function JokerFace({ big }: { big: boolean }) {
  const color = big ? "text-[#d62d2d]" : "text-[#1267d8]";
  const accent = big ? "bg-[#ffe1e1] text-[#b51717]" : "bg-[#e0efff] text-[#0f5fca]";

  return (
    <div className={cn("relative flex h-full flex-col items-center justify-between p-2", color)}>
      <span className="self-start text-[16px] leading-none tracking-[-0.04em]">
        {big ? "BJ" : "SJ"}
      </span>
      <div className="flex flex-1 flex-col items-center justify-center gap-1">
        <span className={cn("rounded-full px-2 py-1 text-[10px] font-black", accent)}>
          {big ? "BIG" : "SMALL"}
        </span>
        <span className="text-center text-[18px] font-black leading-none tracking-[0.08em]">
          JOKER
        </span>
        <span className="text-[42px] leading-none">{big ? "★" : "◆"}</span>
      </div>
      <span className="rotate-180 self-end text-[16px] leading-none tracking-[-0.04em]">
        {big ? "BJ" : "SJ"}
      </span>
    </div>
  );
}
