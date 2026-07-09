"use client";

import { motion } from "framer-motion";
import { PlayingCard } from "@/components/game/PlayingCard";
import { detectCardPattern } from "@/lib/guandan/cardRule";
import type { Card } from "@/lib/guandan/card";

interface PlayedCardsProps {
  cards: Card[];
}

export function PlayedCards({ cards }: PlayedCardsProps) {
  const pattern = cards.length > 0 ? detectCardPattern(cards) : null;

  return (
    <div className="flex flex-col items-center gap-3">
      {pattern?.valid ? (
        <span className="rounded-full border border-white/60 bg-white/62 px-4 py-1 text-sm font-black text-[#12517a] shadow-[0_12px_24px_rgba(35,114,180,0.16)] backdrop-blur">
          {patternLabel[pattern.type] ?? "有效牌型"}
        </span>
      ) : null}

      <div className="flex items-center justify-center gap-3">
        {cards.map((card, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1, rotate: index % 2 === 0 ? -1 : 1 }}
            initial={{ opacity: 0, y: 42, scale: 0.92 }}
            key={card.id}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <PlayingCard card={card} disabled />
          </motion.div>
        ))}

        {cards.length === 0 ? (
          <div className="flex h-[100px] min-w-[280px] items-center justify-center rounded-2xl border-2 border-dashed border-white/68 bg-white/18 px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(35,114,180,0.18)] backdrop-blur">
            等待第一手出牌
          </div>
        ) : (
          <div className="h-[100px] w-[70px] rounded-xl border-2 border-dashed border-white/62 bg-white/14" />
        )}
      </div>
    </div>
  );
}

const patternLabel = {
  single: "单牌",
  pair: "对子",
  triple: "三张",
  tripleWithPair: "三带二",
  straight: "顺子",
  bomb: "炸弹",
  fourJokers: "四王炸",
  invalid: "待判断"
};
