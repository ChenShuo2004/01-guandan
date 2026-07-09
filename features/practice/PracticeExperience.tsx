"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CoachBubble } from "@/components/coach/CoachBubble";
import { PokerHand } from "@/components/cards/PokerHand";
import { PokerTable } from "@/components/practice/PokerTable";
import { Button } from "@/components/ui/Button";
import { useProgress } from "@/features/progress/useProgress";
import type { PracticeCase } from "@/types/practice";

interface PracticeExperienceProps {
  practiceCase: PracticeCase;
}

export function PracticeExperience({ practiceCase }: PracticeExperienceProps) {
  const router = useRouter();
  const { completeDailyTraining, completePractice } = useProgress();
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
    completePractice(
      practiceCase.id,
      practiceCase.experience,
      optionId === practiceCase.correctOptionId
    );
  }

  function finishTodayTraining() {
    completeDailyTraining();
    router.push("/practice");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start lg:gap-6">
      <div className="space-y-4">
        <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4 lg:p-6">
          <p className="text-sm font-bold text-guandan-gold">当前局面</p>
          <h2 className="mt-2 text-xl font-black leading-8 lg:text-2xl">
            {practiceCase.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-guandan-subtext lg:text-base lg:leading-7">
            {practiceCase.situation}
          </p>
        </section>

        <PokerTable practiceCase={practiceCase} />
      </div>

      <aside className="space-y-4 lg:sticky lg:top-8">
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

            <Button className="w-full" onClick={finishTodayTraining}>
              完成训练
            </Button>
          </>
        ) : null}
      </aside>
    </div>
  );
}
