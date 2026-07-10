import type { Card, CardSuit } from "@/lib/guandan/card";
import { getCardLabel } from "@/lib/guandan/card";
import type { PokerCardData } from "@/types/poker";

export type CardVisualStatus = "normal" | "selected" | "disabled" | "invalid";

const suitAssetName: Record<CardSuit, string> = {
  spade: "spade",
  heart: "heart",
  club: "club",
  diamond: "diamond"
};

export function getPlayingCardAsset(card: Card) {
  if (card.isJoker) {
    return card.rank === 17
      ? "/assets/poker-cards/fronts/joker-big.png"
      : "/assets/poker-cards/fronts/joker-small.png";
  }

  const suit = suitAssetName[card.suit as CardSuit];
  const label = getCardLabel(card).toLowerCase();
  return `/assets/poker-cards/fronts/${suit}-${label}.png`;
}

export function getPokerCardAsset(card: PokerCardData) {
  if (card.rank === "SJ") return "/assets/poker-cards/fronts/joker-small.png";
  if (card.rank === "BJ") return "/assets/poker-cards/fronts/joker-big.png";

  const suit = card.suit ? suitAssetName[card.suit] : "spade";
  return `/assets/poker-cards/fronts/${suit}-${card.rank.toLowerCase()}.png`;
}

export function getCardVisualStatus({
  disabled,
  invalid,
  selected
}: {
  disabled?: boolean;
  invalid?: boolean;
  selected?: boolean;
}): CardVisualStatus {
  if (disabled) return "disabled";
  if (invalid) return "invalid";
  if (selected) return "selected";
  return "normal";
}
