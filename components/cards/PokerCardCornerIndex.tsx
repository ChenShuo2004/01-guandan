import type { CardSize, CardVariant, PokerCardData } from "@/types/poker";
import { cn } from "@/lib/utils";

const SUIT_SYMBOL = {
  spade: "♠",
  heart: "♥",
  club: "♣",
  diamond: "♦"
} as const;

const SUIT_COLOR = {
  spade: "#0f172a",
  heart: "#d81f35",
  club: "#0f172a",
  diamond: "#d81f35"
} as const;

interface PokerCardCornerIndexProps {
  card: PokerCardData;
  isLevelCard: boolean;
  size: CardSize;
  variant: CardVariant;
}

function getCornerScale(size: CardSize, variant: CardVariant) {
  if (variant === "played") {
    if (size === "sm") return 0.92;
    if (size === "lg") return 1.08;
    if (size === "hero") return 1.48;
    return 1;
  }

  if (size === "sm") return 0.88;
  if (size === "lg") return 1.04;
  return 0.96;
}

export function PokerCardCornerIndex({ card, isLevelCard, size, variant }: PokerCardCornerIndexProps) {
  const isJoker = card.rank === "SJ" || card.rank === "BJ";
  if (variant !== "played" || isJoker || !card.suit) {
    return null;
  }

  const scale = getCornerScale(size, variant);
  const rankSize = Math.round((variant === "played" ? 17 : 15) * scale);
  const suitSize = Math.round((variant === "played" ? 14 : 12) * scale);
  const suitColor = isLevelCard ? "#9a6200" : SUIT_COLOR[card.suit];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute left-[5px] top-[5px] z-20 flex min-w-[22px] flex-col items-center rounded-[7px] px-[5px] py-[3px]",
        isLevelCard
          ? "bg-[linear-gradient(180deg,#fff8df_0%,#ffe9a8_100%)] shadow-[0_2px_10px_rgba(246,198,91,0.45)] ring-[1.5px] ring-[#f6c65b]/90"
          : "bg-white/95 shadow-[0_2px_10px_rgba(15,23,42,0.28)] ring-1 ring-black/10"
      )}
      style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
    >
      <span
        className="font-black leading-none tracking-[-0.04em]"
        style={{ color: suitColor, fontSize: `${rankSize}px`, textShadow: "0 1px 0 rgba(255,255,255,0.85)" }}
      >
        {card.rank}
      </span>
      <span
        className="mt-[1px] font-black leading-none"
        style={{ color: suitColor, fontSize: `${suitSize}px`, textShadow: "0 1px 0 rgba(255,255,255,0.85)" }}
      >
        {SUIT_SYMBOL[card.suit]}
      </span>
    </div>
  );
}
