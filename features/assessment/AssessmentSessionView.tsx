"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { abilityLabels } from "@/content/assessment/cases";
import { useAssessmentStore } from "@/features/assessment/useAssessmentStore";
import { getCurrentCase, getSession } from "@/lib/assessment/assessment-engine";

interface AssessmentSessionViewProps {
  sessionId: string;
}

export function AssessmentSessionView({ sessionId }: AssessmentSessionViewProps) {
  const router = useRouter();
  const { isReady, nextQuestion, pauseSession, store, submitAnswer } = useAssessmentStore();
  const [hintUsed, setHintUsed] = useState(false);
  const session = getSession(store, sessionId);
  const currentCase = getCurrentCase(session);
  const answer = session?.answers.find((item) => item.caseId === currentCase?.id);
  const isAnswered = Boolean(answer);

  if (!isReady) {
    return <EmptyState text="正在读取测评。" />;
  }

  if (!session || !currentCase) {
    return <EmptyState text="没有找到这次测评。请重新开始。" href="/assessment/start" />;
  }

  function chooseOption(optionId: string) {
    if (isAnswered) return;
    submitAnswer(sessionId, optionId, hintUsed);
  }

  function goNext() {
    if (!session) return;
    const isLast = session.currentIndex >= session.caseIds.length - 1;
    nextQuestion(sessionId);
    setHintUsed(false);
    if (isLast) {
      router.push(`/assessment/result/${sessionId}`);
    }
  }

  function pause() {
    pauseSession(sessionId);
    router.push("/");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-[#0058be]">
              第 {session.currentIndex + 1} / {session.caseIds.length} 题
            </p>
            <h2 className="mt-2 text-2xl font-black leading-8 text-[#12395a]">
              {currentCase.title}
            </h2>
          </div>
          <span className="rounded-full bg-[#e7eeff] px-3 py-2 text-xs font-black text-[#0058be]">
            {abilityLabels[currentCase.dimension]}
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e7eeff]">
          <div
            className="h-full rounded-full bg-[#0058be]"
            style={{ width: `${((session.currentIndex + 1) / session.caseIds.length) * 100}%` }}
          />
        </div>
        <p className="mt-5 rounded-[22px] bg-[#f0f7ff] p-4 text-base font-semibold leading-8 text-[#334155]">
          {currentCase.situation}
        </p>
      </section>

      <section className="grid gap-3">
        {currentCase.options.map((option) => {
          const selected = answer?.optionId === option.id;
          const correct = currentCase.correctOptionId === option.id;
          return (
            <button
              className={[
                "rounded-[22px] border p-4 text-left text-sm font-black leading-6 transition active:scale-[0.99]",
                !isAnswered ? "border-[#d8e3fb] bg-white hover:border-[#64a8fe]" : "",
                isAnswered && selected && correct ? "border-[#45D483] bg-[#45D483]/10 text-[#17814d]" : "",
                isAnswered && selected && !correct ? "border-[#FF6B6B] bg-[#FF6B6B]/10 text-[#b4232f]" : "",
                isAnswered && !selected ? "border-[#d8e3fb] bg-[#f9f9ff] text-[#6f7b91]" : ""
              ].join(" ")}
              disabled={isAnswered}
              key={option.id}
              onClick={() => chooseOption(option.id)}
              type="button"
            >
              {option.id.toUpperCase()}. {option.text}
            </button>
          );
        })}
      </section>

      {hintUsed || isAnswered ? (
        <section className="rounded-[24px] border border-[#adc6ff] bg-[#e7eeff] p-4">
          <p className="text-sm font-black text-[#0058be]">Ace 提示</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#334155]">
            {isAnswered ? currentCase.explanation : currentCase.coachHint}
          </p>
        </section>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <Button onClick={pause} variant="secondary">
          暂停
        </Button>
        <Button disabled={isAnswered} onClick={() => setHintUsed(true)} variant="secondary">
          提示
        </Button>
        <Button disabled={!isAnswered} onClick={goNext}>
          {session.currentIndex >= session.caseIds.length - 1 ? "看结果" : "下一题"}
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ href, text }: { href?: string; text: string }) {
  return (
    <div className="rounded-[28px] border border-[#d8e3fb] bg-white p-6">
      <p className="text-sm font-bold text-[#52657a]">{text}</p>
      {href ? (
        <Button className="mt-4" href={href}>
          重新开始
        </Button>
      ) : null}
    </div>
  );
}
