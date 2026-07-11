"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { PlayingCard } from "@/components/cards/PlayingCard";
import { getRankLabel, type Card } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";

export interface SettlementSequenceNotice {
  tributeCard: Card | null;
  returnCard: Card | null;
  tributeFrom: string;
  tributeTo: string;
  leadPlayer: string;
  resisted: boolean;
}

type SequenceStage = "tribute" | "tribute-pause" | "return" | "complete" | "resisted" | "lead";

interface SettlementSequenceOverlayProps {
  levelRank?: string;
  notice: SettlementSequenceNotice;
  onComplete: () => void;
}

export function SettlementSequenceOverlay({
  levelRank = "10",
  notice,
  onComplete
}: SettlementSequenceOverlayProps) {
  const stages = useMemo<SequenceStage[]>(
    () =>
      notice.resisted
        ? ["resisted", "lead"]
        : [
            ...(notice.tributeCard ? (["tribute", "tribute-pause"] as SequenceStage[]) : []),
            ...(notice.returnCard ? (["return"] as SequenceStage[]) : []),
            "complete",
            "lead"
          ],
    [notice.resisted, notice.returnCard, notice.tributeCard]
  );
  const [stageIndex, setStageIndex] = useState(0);
  const stage = stages[stageIndex] ?? "complete";
  const isReturn = stage === "return";
  const isLead = stage === "lead";

  function advance() {
    if (stageIndex >= stages.length - 1) {
      onComplete();
      return;
    }
    setStageIndex((current) => current + 1);
  }

  const card = isReturn ? notice.returnCard : notice.tributeCard;
  const title = notice.resisted
    ? "抗贡成功"
    : stage === "complete"
      ? "换贡完成"
      : isLead
      ? `${notice.leadPlayer} 首发`
        : isReturn
          ? `${notice.tributeTo} 向 ${notice.tributeFrom} 还贡`
          : `${notice.tributeFrom} 向 ${notice.tributeTo} 上贡`;

  return (
    <div className="pointer-events-none fixed inset-0 z-[210] grid place-items-center overflow-hidden bg-[#071426]/42 px-5 backdrop-blur-[2px]">
      <div
        className={cn(
          "absolute inset-0",
          notice.resisted
            ? "bg-[radial-gradient(circle_at_50%_48%,rgba(255,218,93,0.42),transparent_42%)]"
            : isReturn
              ? "bg-[radial-gradient(circle_at_50%_48%,rgba(72,226,189,0.24),transparent_40%)]"
              : "bg-[radial-gradient(circle_at_50%_48%,rgba(255,136,104,0.25),transparent_40%)]"
        )}
      />

      <AnimatePresence mode="wait">
        <motion.section
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={cn(
            "relative flex w-full max-w-sm flex-col items-center rounded-[30px] border px-6 py-7 text-center shadow-[0_26px_80px_rgba(4,24,50,0.34)] backdrop-blur-xl",
            notice.resisted
              ? "border-[#ffe38a]/65 bg-[#7c5d16]/88 text-[#fff4c2]"
              : isReturn
                ? "border-[#75f3d4]/55 bg-[#063f4a]/90 text-white"
                : "border-[#ffd28a]/60 bg-[#632b2c]/90 text-white"
          )}
          exit={{ opacity: 0, scale: 0.94, y: -12 }}
          initial={{ opacity: 0, scale: 0.88, y: 18 }}
          key={`${stage}-${stageIndex}`}
          onAnimationComplete={advance}
          transition={{
            duration:
              stage === "tribute-pause"
                ? 0.3
                : stage === "tribute" || stage === "return"
                  ? 0.72
                  : stage === "complete" || stage === "resisted"
                    ? 0.8
                    : 1.2,
            ease: "easeOut"
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/65">
            {notice.resisted ? "TRIBUTE RESISTED" : isLead ? "NEXT DEAL" : "HAND SETTLEMENT"}
          </p>
          <motion.div
            animate={
              notice.resisted
                ? { scale: [1, 1.12, 1], rotate: [0, -2, 2, 0] }
                : isLead
                  ? { scale: [0.78, 1.08, 1], opacity: [0, 1, 1] }
                  : { scale: 1, opacity: 1 }
            }
            className="mt-3 text-3xl font-black tracking-tight"
            transition={{ duration: notice.resisted ? 0.9 : 0.6, ease: "easeOut" }}
          >
            {title}
          </motion.div>

          {stage === "tribute-pause" ? (
            <p className="mt-2 text-sm font-bold text-white/72">准备还贡</p>
          ) : null}
          {(stage === "tribute" || stage === "return") && card ? (
            <p className="mt-2 text-base font-black text-[#ffe58c]">{formatCard(card)}</p>
          ) : null}

          {card && (stage === "tribute" || stage === "return") ? (
            <motion.div
              animate={{ offsetDistance: "100%", opacity: [0, 1, 1, 0.9], scale: [0.58, 0.92, 1, 0.62] }}
              className="absolute left-1/2 top-1/2 z-20"
              initial={{ offsetDistance: "0%", opacity: 0, scale: 0.58 }}
              style={{
                offsetPath: isReturn
                  ? "path('M 0 0 C -100 -120, -220 -120, -310 0')"
                  : "path('M 0 0 C 100 -120, 220 -120, 310 0')",
                offsetRotate: "0deg"
              }}
              transition={{ duration: 0.72, ease: [0.22, 0.8, 0.32, 1] }}
            >
              <PlayingCard card={card} compact disabled levelRank={levelRank} />
            </motion.div>
          ) : null}

          {stage === "complete" ? (
            <motion.div
              animate={{ opacity: [0, 1, 0.8, 1], scale: [0.9, 1.08, 1] }}
              className="mt-5 h-16 w-16 rounded-full border border-[#ffe38a]/80 bg-[#ffd84d]/20 shadow-[0_0_42px_rgba(255,216,77,0.7)]"
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          ) : null}

          {isLead ? (
            <p className="mt-3 text-base font-black text-[#ffe58c]">
              本局由 {notice.leadPlayer} 首发
            </p>
          ) : null}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

function formatCard(card: Card) {
  if (card.isJoker) return getRankLabel(card.rank);
  const suitLabels: Record<Card["suit"], string> = {
    spade: "♠",
    heart: "♥",
    club: "♣",
    diamond: "♦",
    joker: ""
  };
  return `${getRankLabel(card.rank)}${suitLabels[card.suit]}`;
}
