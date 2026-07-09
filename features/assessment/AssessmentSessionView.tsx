"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { abilityLabels } from "@/content/assessment/cases";
import { useAssessmentStore } from "@/features/assessment/useAssessmentStore";
import {
  getGuandanAssessmentQuestions,
  getGuandanCourse,
  type GuandanQuestion
} from "@/lib/guandan/catalog";
import { getCurrentCase, getSession } from "@/lib/assessment/assessment-engine";

interface AssessmentSessionViewProps {
  sessionId: string;
}

export function AssessmentSessionView({ sessionId }: AssessmentSessionViewProps) {
  if (sessionId === "simple" || sessionId === "full") {
    return <CatalogAssessmentSession mode={sessionId} />;
  }

  return <StoredAssessmentSession sessionId={sessionId} />;
}

function CatalogAssessmentSession({ mode }: { mode: "simple" | "full" }) {
  const questions = useMemo(
    () => getGuandanAssessmentQuestions(mode).slice(0, mode === "simple" ? 20 : 50),
    [mode]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const currentQuestion = questions[currentIndex];
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === currentQuestion.answer;
  const relatedCourse = getGuandanCourse(currentQuestion.relatedCourse);

  function goNext() {
    if (currentIndex >= questions.length - 1) {
      return;
    }
    setCurrentIndex((value) => value + 1);
    setSelectedOption(null);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-[#0058be]">
              {mode === "simple" ? "简单能力测试" : "全面能力测试"} · 第 {currentIndex + 1} / {questions.length} 题
            </p>
            <h1 className="mt-2 text-2xl font-black leading-8 text-[#12395a]">
              {currentQuestion.type} · {currentQuestion.difficulty}
            </h1>
          </div>
          <Button href="/assessment/start" variant="secondary">
            返回
          </Button>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e7eeff]">
          <div
            className="h-full rounded-full bg-[#0058be]"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <article className="rounded-[28px] border border-[#d8e3fb] bg-white p-5">
            <p className="text-base font-black leading-8 text-[#12395a]">
              {currentQuestion.question}
            </p>
            <div className="mt-4 grid gap-2">
              {currentQuestion.options.map((option, index) => {
                const selected = selectedOption === option;
                const correct = currentQuestion.answer === option;
                return (
                  <button
                    className={[
                      "rounded-[20px] border px-4 py-3 text-left text-sm font-bold leading-6 transition",
                      !isAnswered ? "border-[#d8e3fb] bg-[#fbfdff] hover:border-[#64a8fe]" : "",
                      isAnswered && selected && correct ? "border-[#45D483] bg-[#45D483]/10 text-[#17814d]" : "",
                      isAnswered && selected && !correct ? "border-[#FF6B6B] bg-[#FF6B6B]/10 text-[#b4232f]" : "",
                      isAnswered && !selected ? "border-[#d8e3fb] bg-[#f9f9ff] text-[#6f7b91]" : ""
                    ].join(" ")}
                    disabled={isAnswered}
                    key={`${currentQuestion.id}-${option}`}
                    onClick={() => setSelectedOption(option)}
                    type="button"
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </button>
                );
              })}
            </div>
          </article>

          {isAnswered ? (
            <ReviewPanel
              isCorrect={isCorrect}
              question={currentQuestion}
              relatedCourseTitle={relatedCourse?.title ?? currentQuestion.relatedCourse}
            />
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[26px] border border-[#d8e3fb] bg-white">
            <Image
              alt={`${currentQuestion.id} PDF 题图`}
              className="object-contain p-2"
              fill
              sizes="(min-width: 1024px) 360px, 100vw"
              src={currentQuestion.image}
            />
          </div>
          <div className="rounded-[24px] border border-[#d8e3fb] bg-white p-4">
            <p className="text-sm font-black text-[#0058be]">推荐课程</p>
            <Link
              className="mt-2 block text-base font-black leading-7 text-[#12395a] hover:text-[#0058be]"
              href={`/lessons/${currentQuestion.relatedCourse}`}
            >
              {relatedCourse?.title ?? currentQuestion.relatedCourse}
            </Link>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#52657a]">
              答错后优先回看这门课，再进入对应训练。
            </p>
          </div>
        </aside>
      </section>

      <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
        <Button
          disabled={currentIndex === 0}
          onClick={() => {
            setCurrentIndex((value) => Math.max(0, value - 1));
            setSelectedOption(null);
          }}
          variant="secondary"
        >
          上一题
        </Button>
        <Button disabled={!isAnswered || currentIndex >= questions.length - 1} onClick={goNext}>
          {currentIndex >= questions.length - 1 ? "已完成" : "下一题"}
        </Button>
      </div>
    </div>
  );
}

function ReviewPanel({
  isCorrect,
  question,
  relatedCourseTitle
}: {
  isCorrect: boolean;
  question: GuandanQuestion;
  relatedCourseTitle: string;
}) {
  return (
    <section className="rounded-[26px] border border-[#adc6ff] bg-[#f0f7ff] p-5">
      <p className="text-sm font-black text-[#0058be]">AI分析</p>
      <h2 className="mt-2 text-xl font-black text-[#12395a]">
        {isCorrect ? "判断正确。" : "这题需要复盘。"}
      </h2>
      <p className="mt-3 text-sm font-bold leading-7 text-[#334155]">
        正确答案：{question.answer}
      </p>
      <p className="mt-3 text-sm font-semibold leading-7 text-[#52657a]">
        {question.analysis}
      </p>
      {!isCorrect ? (
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm font-semibold leading-7 text-[#b4232f]">
          {question.wrongReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3 text-sm font-semibold leading-7 text-[#52657a]">
        {question.aiCoachComment}
      </p>
      <p className="mt-3 text-xs font-black text-[#6f7b91]">
        对应课程：{relatedCourseTitle}
      </p>
    </section>
  );
}

function StoredAssessmentSession({ sessionId }: { sessionId: string }) {
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
    return <EmptyState href="/assessment/start" text="没有找到这次测评。请重新开始。" />;
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
