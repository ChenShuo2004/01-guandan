import { PokerHand } from "@/components/cards/PokerHand";
import type { PracticeCase } from "@/types/practice";

interface PokerTableProps {
  practiceCase: PracticeCase;
}

export function PokerTable({ practiceCase }: PokerTableProps) {
  const [partner, rightOpponent, me, leftOpponent] = practiceCase.players;

  return (
    <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4 lg:p-6">
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-guandan-subtext lg:gap-3 lg:text-sm">
        <div />
        <div className="rounded-2xl bg-guandan-muted p-3 lg:p-4">
          {partner.name}
          <br />剩 {partner.remainingCards}
        </div>
        <div />
        <div className="rounded-2xl bg-guandan-muted p-3 lg:p-4">
          {leftOpponent.name}
          <br />剩 {leftOpponent.remainingCards}
        </div>
        <div className="flex min-h-20 items-center justify-center rounded-2xl border border-dashed border-guandan-border p-3 text-guandan-gold lg:min-h-32 lg:text-lg">
          牌桌
        </div>
        <div className="rounded-2xl bg-guandan-muted p-3 lg:p-4">
          {rightOpponent.name}
          <br />剩 {rightOpponent.remainingCards}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-guandan-muted/70 p-3 lg:p-4">
        <p className="text-sm font-bold text-guandan-gold">{me.name}的手牌</p>
        <div className="mt-3">
          <PokerHand cards={practiceCase.myHand} />
        </div>
      </div>
    </section>
  );
}
