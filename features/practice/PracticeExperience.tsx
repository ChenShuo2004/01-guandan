"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CoachBubble } from "@/components/coach/CoachBubble";
import { PokerHand } from "@/components/cards/PokerHand";
import { Button } from "@/components/ui/Button";
import { useProgress } from "@/features/progress/useProgress";
import type { PracticeCase } from "@/types/practice";

interface PracticeExperienceProps {
  practiceCase: PracticeCase;
}

export function PracticeExperience({ practiceCase }: PracticeExperienceProps) {
  const router = useRouter();
  const { completePractice } = useProgress();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const isAnswered = selectedOptionId !== null;
  const isCorrect = selectedOptionId === practiceCase.correctOptionId;
  const feedback = isCorrect
    ? practiceCase.coachFeedback.correct
    : practiceCase.coachFeedback.wrong;

  function chooseOption(optionId: string) {
    if (isAnswered) {
      return;
    }

    setSelectedOptionId(optionId);
    completePractice(practiceCase.id, practiceCase.experience, optionId === practiceCase.correctOptionId);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4">
        <p className="text-sm font-bold text-guandan-gold">当前局面</p>
        <h2 className="mt-2 text-xl font-black leading-8">{practiceCase.title}</h2>
        <p className="mt-2 text-sm leading-6 text-guandan-subtext">
          {practiceCase.situation}
        </p>
      </section>

      <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4">
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-guandan-subtext">
          <div />
          <div className="rounded-2xl bg-guandan-muted p-3">
            {practiceCase.players[0].name}
            <br />剩 {practiceCase.players[0].remainingCards}
          </div>
          <div />
          <div className="rounded-2xl bg-guandan-muted p-3">
            {practiceCase.players[3].name}
            <br />剩 {practiceCase.players[3].remainingCards}
          </div>
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-guandan-border p-3 text-guandan-gold">
            牌桌
          </div>
          <div className="rounded-2xl bg-guandan-muted p-3">
            {practiceCase.players[1].name}
            <br />剩 {practiceCase.players[1].remainingCards}
          </div>
        </div>
        <p className="mt-4 text-sm font-bold text-guandan-gold">我的手牌</p>
        <div className="mt-3">
          <PokerHand cards={practiceCase.myHand} />
        </div>
      </section>

      <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4">
        <p className="text-sm font-bold text-guandan-gold">你会怎么出？</p>
        <div className="mt-3 grid gap-2">
          {practiceCase.options.map((option) => {
            const selected = selectedOptionId === option.id;
            const correct = option.id === practiceCase.correctOptionId;

            return (
              <button
                className={[
                  "rounded-2xl border p-3 text-left text-sm font-bold transition",
                  selected && correct
                    ? "border-guandan-success bg-guandan-success/10 text-guandan-success"
                    : "",
                  selected && !correct
                    ? "border-guandan-danger bg-guandan-danger/10 text-guandan-danger"
                    : "",
                  !selected
                    ? "border-guandan-border bg-guandan-muted text-guandan-text"
                    : ""
                ].join(" ")}
                disabled={isAnswered}
                key={option.id}
                onClick={() => chooseOption(option.id)}
                type="button"
              >
                {option.label}. {option.text}
              </button>
            );
          })}
        </div>
      </section>

      {isAnswered ? (
        <>
          <CoachBubble
            action={feedback.action}
            caption={feedback.reasons.join(" ")}
            text={`${feedback.summary}${feedback.recommendation}`}
          />

          <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4">
            <p className="text-sm font-bold text-guandan-gold">正确复盘</p>
            <div className="mt-3 space-y-4">
              {practiceCase.replaySteps.map((step) => (
                <div key={step.id}>
                  <p className="mb-2 text-sm font-bold">{step.title}</p>
                  <PokerHand cards={step.cards} compact />
                  <p className="mt-2 text-sm leading-6 text-guandan-subtext">
                    {step.coachText}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <Button className="w-full" onClick={() => router.push("/complete")}>
            完成今天训练
          </Button>
        </>
      ) : null}
    </div>
  );
}
