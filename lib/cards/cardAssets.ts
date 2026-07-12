import type { Card, CardSuit } from "@/lib/guandan/card";
import { getCardLabel } from "@/lib/guandan/card";
import type { PokerCardData } from "@/types/poker";

export type CardVisualStatus = "normal" | "selected" | "disabled" | "invalid";

const suitAssetName: Record<CardSuit, string> = {
  spade: "S",
  heart: "H",
  club: "C",
  diamond: "D"
};

export function getPlayingCardAsset(card: Card) {
  if (card.isJoker) {
    return card.rank === 17
      ? "/assets/poker-cards/card-deck/card_joker_big.png"
      : "/assets/poker-cards/card-deck/card_joker_small.png";
  }

  const suit = suitAssetName[card.suit as CardSuit];
  const label = getCardLabel(card).toUpperCase();
  return `/assets/poker-cards/card-deck/card_${label}${suit}.png`;
}

export function getPokerCardAsset(card: PokerCardData) {
  if (card.rank === "SJ") return "/assets/poker-cards/card-deck/card_joker_small.png";
  if (card.rank === "BJ") return "/assets/poker-cards/card-deck/card_joker_big.png";

  const suit = card.suit ? suitAssetName[card.suit] : "S";
  return `/assets/poker-cards/card-deck/card_${card.rank.toUpperCase()}${suit}.png`;
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
