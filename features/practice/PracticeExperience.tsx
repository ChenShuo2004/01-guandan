"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CoachBubble } from "@/components/coach/CoachBubble";
import { PokerHand } from "@/components/cards/PokerHand";
import { PokerTable } from "@/components/practice/PokerTable";
import { Button } from "@/components/ui/Button";
import { useProgress } from "@/features/progress/useProgress";
import type { PracticeCase } from "@/types/practice";
import type { PokerCardData } from "@/types/poker";

interface PracticeExperienceProps {
  practiceCase: PracticeCase;
}

export function PracticeExperience({ practiceCase }: PracticeExperienceProps) {
  const router = useRouter();
  const { completeDailyTraining, completePractice } = useProgress();
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const isAnswered = selectedOptionId !== null;
  const isCorrect = selectedOptionId === practiceCase.correctOptionId;
  const feedback = isCorrect
    ? practiceCase.coachFeedback.correct
    : practiceCase.coachFeedback.wrong;

  const aiHint = useMemo(() => {
    if (isAnswered) {
      return isCorrect
        ? "判断对了。关键是先抢回牌权，再帮助队友走完。"
        : "这里风险很高。对手只剩 2 张，不能把牌权继续交出去。";
    }

    if (selectedCardIds.length > 0) {
      return "你已经选到关键牌了。现在判断：这手牌是用来控局，还是继续等待？";
    }

    return "先找危险点：谁快走完？谁掌握牌权？你的炸弹能不能改变局势？";
  }, [isAnswered, isCorrect, selectedCardIds.length]);

  function toggleCard(card: PokerCardData) {
    if (isAnswered) {
      return;
    }

    setSelectedCardIds((current) =>
      current.includes(card.id)
        ? current.filter((cardId) => cardId !== card.id)
        : [...current, card.id]
    );
  }

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
    router.push("/complete");
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="grid gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)] lg:items-start lg:gap-6"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.34 }}
    >
      <div className="space-y-4">
        <section className="rounded-[24px] border border-white/70 bg-white/64 p-4 text-slate-950 shadow-[0_24px_70px_rgba(37,99,235,0.12)] backdrop-blur-2xl lg:p-5">
          <p className="text-xs font-black text-blue-600">今日残局</p>
          <h2 className="mt-2 text-2xl font-black leading-8">{practiceCase.title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {practiceCase.situation}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {practiceCase.tags.map((tag) => (
              <span
                className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <PokerTable
          aiHint={aiHint}
          onCardClick={toggleCard}
          practiceCase={practiceCase}
          selectedCardIds={selectedCardIds}
        />
      </div>

      <aside className="space-y-4 lg:sticky lg:top-8">
        <DecisionPanel
          isAnswered={isAnswered}
          onChoose={chooseOption}
          options={practiceCase.options}
          selectedOptionId={selectedOptionId}
          correctOptionId={practiceCase.correctOptionId}
        />

        {isAnswered ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.36, ease: "easeOut" }}
          >
            <CoachBubble
              action={feedback.action}
              caption={feedback.reasons.join(" ")}
              text={`${feedback.summary}${feedback.recommendation}`}
            />

            <section className="rounded-[24px] border border-white/70 bg-white/68 p-4 text-slate-950 shadow-[0_24px_70px_rgba(37,99,235,0.12)] backdrop-blur-2xl">
              <p className="text-xs font-black text-blue-600">正确复盘</p>
              <div className="mt-3 space-y-4">
                {practiceCase.replaySteps.map((step, index) => (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[20px] border border-slate-200 bg-white/72 p-3"
                    initial={{ opacity: 0, y: 12 }}
                    key={step.id}
                    transition={{ delay: index * 0.08, duration: 0.28 }}
                  >
                    <p className="mb-2 text-sm font-black">{step.title}</p>
                    <PokerHand cards={step.cards} compact />
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {step.coachText}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            <Button className="w-full bg-blue-600 text-white hover:bg-blue-500" onClick={finishTodayTraining}>
              完成今天训练
            </Button>
          </motion.div>
        ) : (
          <CoachBubble
            action={selectedCardIds.length > 0 ? "thinking" : "point"}
            caption="先选关键牌，再做出一个明确判断。"
            text={selectedCardIds.length > 0 ? "我在看你的选择。" : "先别急着点答案。"}
          />
        )}
      </aside>
    </motion.div>
  );
}

function DecisionPanel({
  correctOptionId,
  isAnswered,
  onChoose,
  options,
  selectedOptionId
}: {
  correctOptionId: string;
  isAnswered: boolean;
  onChoose: (optionId: string) => void;
  options: PracticeCase["options"];
  selectedOptionId: string | null;
}) {
  return (
    <section className="rounded-[24px] border border-white/70 bg-white/70 p-4 text-slate-950 shadow-[0_24px_70px_rgba(37,99,235,0.12)] backdrop-blur-2xl">
      <p className="text-xs font-black text-blue-600">你的决策</p>
      <h3 className="mt-2 text-xl font-black">这手牌怎么打？</h3>
      <div className="mt-4 grid gap-3">
        {options.map((option) => {
          const selected = selectedOptionId === option.id;
          const correct = option.id === correctOptionId;
          const showCorrect = isAnswered && correct;

          return (
            <motion.button
              className={[
                "rounded-[18px] border p-4 text-left text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                selected && correct
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "",
                selected && !correct
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : "",
                showCorrect && !selected
                  ? "border-emerald-200 bg-emerald-50/60 text-emerald-700"
                  : "",
                !selected && !showCorrect
                  ? "border-slate-200 bg-white/78 text-slate-800 hover:border-blue-300 hover:bg-blue-50"
                  : ""
              ].join(" ")}
              disabled={isAnswered}
              key={option.id}
              onClick={() => onChoose(option.id)}
              type="button"
              whileHover={isAnswered ? undefined : { y: -2 }}
              whileTap={isAnswered ? undefined : { scale: 0.98 }}
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                {option.label}
              </span>
              {option.text}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
