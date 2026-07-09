"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { PointerEvent } from "react";
import { getCardLabel } from "@/lib/guandan/card";
import type { Card } from "@/lib/guandan/card";
import { getCardVisualStatus, getPlayingCardAsset } from "@/lib/cards/cardAssets";
import { cn } from "@/lib/utils";

interface PlayingCardProps {
  card: Card;
  compact?: boolean;
  selected?: boolean;
  invalid?: boolean;
  invalidPulseKey?: number;
  disabled?: boolean;
  sizeScale?: number;
  onClick?: (card: Card) => void;
  onPointerDownCard?: (card: Card, event: PointerEvent<HTMLButtonElement>) => void;
  onPointerEnterCard?: (card: Card, event: PointerEvent<HTMLButtonElement>) => void;
}

const pokeTransition = {
  duration: 0.18,
  ease: "easeOut"
} as const;

export function PlayingCard({
  card,
  compact = false,
  selected = false,
  invalid = false,
  invalidPulseKey = 0,
  disabled = false,
  sizeScale = 1,
  onClick,
  onPointerDownCard,
  onPointerEnterCard
}: PlayingCardProps) {
  const status = getCardVisualStatus({ disabled, invalid, selected });
  const label = getCardLabel(card);
  const assetPath = getPlayingCardAsset(card);
  const baseSize = compact ? { height: 90, width: 64 } : { height: 122, width: 86 };
  const cardSize = {
    height: Math.round(baseSize.height * sizeScale),
    width: Math.round(baseSize.width * sizeScale)
  };
  const selectedTransform = { y: -20, scale: 1.08 };
  const normalTransform = { y: 0, scale: 1 };
  const hoverTransform = {
    boxShadow: "0 24px 42px rgba(6,20,34,0.32)",
    scale: 1.04,
    y: -10
  };

  return (
    <motion.button
      animate={
        invalid
          ? {
              ...selectedTransform,
              x: [0, -6, 6, -4, 4, 0]
            }
          : selected
            ? selectedTransform
            : normalTransform
      }
      aria-label={label}
      className={cn(
        "relative shrink-0 touch-manipulation select-none rounded-[14px] border bg-white p-0 outline-none transition-colors hover:z-30 focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-[#ffd700]",
        disabled ? "cursor-default opacity-80" : "cursor-pointer",
        status === "normal" && "border-white/90 shadow-[0_8px_16px_rgba(6,20,34,0.16)]",
        status === "selected" &&
          "z-20 border-[#ffd700] shadow-[0_0_0_2px_rgba(255,215,0,0.86),0_0_20px_rgba(255,215,0,0.80),0_22px_36px_rgba(6,20,34,0.34)]",
        status === "invalid" &&
          "z-20 border-[#ff5c6a] shadow-[0_0_0_2px_rgba(255,92,106,0.72),0_0_18px_rgba(255,92,106,0.64),0_22px_36px_rgba(6,20,34,0.34)]"
      )}
      data-card-id={card.id}
      data-card-status={status}
      disabled={disabled}
      key={`${card.id}-${invalid ? invalidPulseKey : "stable"}`}
      onClick={() => onClick?.(card)}
      onPointerDown={(event) => onPointerDownCard?.(card, event)}
      onPointerEnter={(event) => onPointerEnterCard?.(card, event)}
      style={cardSize}
      transition={invalid ? { duration: 0.24, ease: "easeOut" } : pokeTransition}
      type="button"
      whileHover={disabled ? undefined : selected ? { ...selectedTransform, boxShadow: "0 28px 48px rgba(6,20,34,0.34)" } : hoverTransform}
      whileTap={disabled ? undefined : { scale: selected ? 1.04 : 0.96, y: selected ? -16 : -2 }}
    >
      <Image
        alt=""
        className="rounded-[13px] object-cover"
        draggable={false}
        fill
        sizes={`${cardSize.width}px`}
        src={assetPath}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-[-3px] rounded-[17px] opacity-0 transition-opacity duration-150",
          selected && "opacity-100",
          invalid ? "bg-[radial-gradient(circle_at_50%_105%,rgba(255,92,106,0.42),transparent_58%)]" : "bg-[radial-gradient(circle_at_50%_105%,rgba(255,215,0,0.46),transparent_58%)]"
        )}
      />
    </motion.button>
  );
}
