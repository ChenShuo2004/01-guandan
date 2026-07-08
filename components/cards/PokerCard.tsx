import type { PokerCardData } from "@/types/poker";
import { cn } from "@/lib/utils";

interface PokerCardProps {
  card: PokerCardData;
  compact?: boolean;
  selected?: boolean;
  interactive?: boolean;
}

const suitSymbol = {
  spade: "♠",
  heart: "♥",
  club: "♣",
  diamond: "♦"
};

export function PokerCard({
  card,
  compact = false,
  interactive = false,
  selected = false
}: PokerCardProps) {
  const isRed = card.suit === "heart" || card.suit === "diamond";
  const jokerLabel = card.rank === "SJ" ? "小王" : card.rank === "BJ" ? "大王" : null;

  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-col justify-between rounded-xl border bg-white p-2 font-bold shadow-sm transition",
        compact ? "h-16 w-11" : "h-20 w-14",
        interactive && "shadow-[0_10px_24px_rgba(37,99,235,0.16)]",
        selected &&
          "-translate-y-3 scale-105 border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.18),0_18px_34px_rgba(37,99,235,0.22)]",
        isRed ? "text-red-600" : "text-slate-950"
      )}
    >
      <span className={cn("leading-none", compact ? "text-sm" : "text-base")}>
        {jokerLabel ?? card.rank}
      </span>
      <span className={cn("self-center leading-none", compact ? "text-lg" : "text-2xl")}>
        {jokerLabel ? "★" : card.suit ? suitSymbol[card.suit] : ""}
      </span>
      <span className={cn("self-end leading-none", compact ? "text-sm" : "text-base")}>
        {jokerLabel ?? card.rank}
      </span>
      {card.isWild ? (
        <span className="absolute -right-1 -top-1 rounded-full bg-guandan-gold px-1 text-[9px] text-guandan-background">
          配
        </span>
      ) : null}
    </div>
  );
}
