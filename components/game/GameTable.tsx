"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PlayedCards } from "@/components/game/PlayedCards";
import { PlayerSeat } from "@/components/game/PlayerSeat";
import type { PlayerRoundAction, TurnActionState } from "@/lib/guandan/gameState";
import type { PlayerId } from "@/lib/guandan/player";
import type { ArenaPlayer } from "@/types/game";

interface GameTableProps {
  levelRank: string;
  players: ArenaPlayer[];
  roundActions: Partial<Record<PlayerId, PlayerRoundAction>>;
  settlementFocus?: {
    donorId: string;
    receiverId: string;
  };
  showTurnStatus?: boolean;
  turnAction: TurnActionState;
}

export function GameTable({
  levelRank,
  players,
  roundActions,
  settlementFocus,
  showTurnStatus = true,
  turnAction
}: GameTableProps) {
  return (
    <div className="training-game-table absolute inset-0">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="training-table-surface absolute inset-x-[4%] bottom-[8%] top-[15%] rounded-[50%] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(222,239,255,0.62)_18%,rgba(138,210,255,0.38)_100%)] p-[16px] shadow-[0_40px_70px_rgba(54,128,190,0.28),0_0_0_1px_rgba(255,255,255,0.72),inset_0_0_22px_rgba(255,255,255,0.9)]"
        initial={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
      >
        <div className="absolute inset-[2%] rounded-[50%] border border-[#d7f4ff]/90 shadow-[inset_0_0_26px_rgba(75,184,255,0.30)]" />
        <div className="relative h-full rounded-[50%] border border-white/76 bg-[radial-gradient(circle_at_50%_35%,rgba(235,250,255,0.82),rgba(75,184,255,0.46)_38%,rgba(59,168,235,0.62)_100%)] shadow-[inset_0_0_95px_rgba(255,255,255,0.45),inset_0_-38px_70px_rgba(33,112,184,0.18),0_0_56px_rgba(75,184,255,0.48)]">
          <div className="absolute inset-[8%] rounded-[50%] border border-white/30" />
          <div className="absolute inset-[15%] rounded-[50%] border border-dashed border-white/30" />
          {showTurnStatus ? <TurnStatusLabel players={players} turnAction={turnAction} /> : null}
          <div className="absolute inset-0 rounded-[50%] bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.22)_46%,transparent_54%)] opacity-70" />
        </div>
      </motion.div>

      <RoundActionZone action={roundActions.enemyAI2} className="left-[24%] top-[42%]" levelRank={levelRank} position="left" />
      <RoundActionZone action={roundActions.partnerAI} className="left-1/2 top-[24%] -translate-x-1/2" levelRank={levelRank} position="top" />
      <RoundActionZone action={roundActions.enemyAI1} className="right-[21%] top-[42%]" levelRank={levelRank} position="right" />
      <RoundActionZone action={roundActions.player} className="left-[44%] bottom-[39%] -translate-x-1/2 max-lg:left-[42%] max-lg:bottom-[36%]" compact={false} levelRank={levelRank} position="bottom" />

      {players.map((player) => (
        <PlayerSeat
          key={player.id}
          player={player}
          settlementFocus={
            settlementFocus
              ? player.id === settlementFocus.donorId || player.id === settlementFocus.receiverId
                ? "primary"
                : "muted"
              : undefined
          }
        />
      ))}
    </div>
  );
}

function TurnStatusLabel({ players, turnAction }: { players: ArenaPlayer[]; turnAction: TurnActionState }) {
  const activePlayer = players.find((player) => player.id === turnAction.playerId);
  const arrowByPosition = {
    bottom: "↓",
    left: "←",
    right: "→",
    top: "↑"
  } as const;
  const direction = activePlayer ? arrowByPosition[activePlayer.position] : "→";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="training-turn-status absolute left-1/2 top-[30%] z-[50] -translate-x-1/2 rounded-[22px] border border-white/75 bg-white/92 px-6 py-3 text-center text-[#12395a] shadow-[0_16px_34px_rgba(43,127,191,0.2)] backdrop-blur"
        exit={{ opacity: 0, scale: 0.94, y: -8 }}
        initial={{ opacity: 0, scale: 0.86, y: 10 }}
        key={`${turnAction.playerId}-${turnAction.status}`}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.span
          animate={{ x: direction === "←" ? [-2, -8, -2] : direction === "→" ? [2, 8, 2] : 0, y: direction === "↑" ? [-2, -8, -2] : direction === "↓" ? [2, 8, 2] : 0, opacity: [0.45, 1, 0.45] }}
          aria-hidden
          className="inline-block text-3xl font-black leading-none text-[#f0b72e]"
          transition={{ duration: 0.9, repeat: Infinity }}
        >
          {direction}
        </motion.span>
        {typeof turnAction.remainingSeconds === "number" ? (
          <span className="ml-1 text-lg font-black text-[#d27b00]">{turnAction.remainingSeconds} 秒</span>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}

function RoundActionZone({
  action,
  className,
  compact = false,
  levelRank,
  position
}: {
  action?: PlayerRoundAction;
  className: string;
  compact?: boolean;
  levelRank: string;
  position: "bottom" | "left" | "right" | "top";
}) {
  if (!action) return null;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`training-round-action absolute z-[35] ${className}`}
      data-action-position={position}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.85, ease: "easeOut" }}
    >
      {action.action === "pass" ? (
        <div className="rounded-full border border-white/70 bg-white/90 px-4 py-1.5 text-sm font-black text-[#34749c] shadow-[0_8px_20px_rgba(43,127,191,0.16)] backdrop-blur">
          不出
        </div>
      ) : (
        <PlayedCards cards={action.cards} compact={compact} levelRank={levelRank} />
      )}
    </motion.div>
  );
}
