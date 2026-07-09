"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { GuandanCourse, GuandanQuestion } from "@/lib/guandan/catalog";

type FocusCard = {
  title: string;
  eyebrow: string;
  body: string;
  detail: string;
  tone?: "blue" | "red" | "green";
};

type QuestionState = "idle" | "answered" | "review";

interface GuandanCourseDetailProps {
  course: GuandanCourse;
  questions: GuandanQuestion[];
}

export function GuandanCourseDetail({ course, questions }: GuandanCourseDetailProps) {
  const primaryQuestion = questions[0];
  const [selectedCard, setSelectedCard] = useState<FocusCard | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [questionState, setQuestionState] = useState<QuestionState>("idle");
  const [coachOpen, setCoachOpen] = useState(false);

  const sourceImage = course.exampleImages[0] ?? "/assets/coach/coach-analysis-mode.png";
  const slogan = useMemo(() => course.slogan.replace(/^口诀：/, ""), [course.slogan]);
  const isCorrect = selectedAnswer === primaryQuestion?.answer;

  function submitAnswer() {
    if (!selectedAnswer) return;
    setQuestionState("answered");
  }

  function resetQuestion() {
    setSelectedAnswer(null);
    setQuestionState("idle");
  }

  return (
    <div className="relative">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,65fr)_minmax(340px,35fr)]">
        <main className="min-w-0">
          <section className="relative overflow-hidden rounded-[32px] border border-white/30 bg-[linear-gradient(145deg,rgba(96,73,110,0.50)_0%,rgba(113,196,255,0.28)_100%)] p-5 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.20),transparent_34%),radial-gradient(circle_at_18%_86%,rgba(100,168,254,0.22),transparent_38%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:40px_40px]" />

            <div className="relative z-10 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#adc6ff]">lightbulb</span>
                  <span className="text-sm font-bold leading-6 text-white/90">
                    今日重点：不要急着出牌，先判断牌权、角色和对手变化
                  </span>
                </div>
                <span className="material-symbols-outlined text-sm text-white/45">close</span>
              </div>
            </div>

            <section className="relative z-10 mt-8 flex items-start justify-between gap-6">
              <button
                className="space-y-4 text-left"
                onClick={() =>
                  setSelectedCard({
                    title: course.title,
                    eyebrow: "核心知识卡",
                    body: course.description,
                    detail: course.coreExplanation,
                    tone: "blue"
                  })
                }
                type="button"
              >
                <span className="inline-flex rounded-full bg-[#0058be]/24 px-4 py-2 text-xs font-black tracking-wider text-[#adc6ff] backdrop-blur-sm">
                  核心知识卡
                </span>
                <h1 className="text-[40px] font-black leading-tight text-white drop-shadow-md">
                  {course.title}
                </h1>
                <p className="max-w-2xl text-lg font-bold leading-8 text-white/72">
                  {course.description}
                </p>
              </button>

              <button
                aria-label="打开 AI 教练讲解"
                className="relative hidden shrink-0 md:block"
                onClick={() => setCoachOpen(true)}
                type="button"
              >
                <span className="absolute -inset-4 rounded-full bg-[#0058be]/30 blur-xl" />
                <span className="relative block h-28 w-28 overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl">
                  <Image
                    alt="AI Coach Ace"
                    className="object-cover"
                    fill
                    sizes="112px"
                    src="/assets/coach/coach-analysis-mode.png"
                  />
                </span>
                <span className="absolute -bottom-2 -right-3 rounded-lg bg-white px-3 py-1 text-[10px] font-black text-[#0058be] shadow-lg">
                  ACE COACH
                </span>
              </button>
            </section>

            <button
              className="relative z-10 mt-8 w-full overflow-hidden rounded-2xl border border-white/20 bg-white/62 p-7 text-center shadow-[0_4px_24px_rgba(0,0,0,0.05)] backdrop-blur-sm"
              onClick={() =>
                setSelectedCard({
                  title: slogan,
                  eyebrow: "口诀卡",
                  body: "把这句话先记住，再看牌局。",
                  detail: course.aiCoachPrompt,
                  tone: "blue"
                })
              }
              type="button"
            >
              <div className="absolute right-4 top-3 flex items-center gap-1 text-[#424754]/45">
                <span className="text-[10px] font-black">口诀卡</span>
                <span className="material-symbols-outlined text-sm">zoom_in</span>
              </div>
              <p className="px-3 text-[28px] font-black leading-relaxed text-[#0058be] drop-shadow-sm">
                “{slogan}”
              </p>
              <p className="mt-4 text-xs font-bold text-[#424754]/60">
                {course.sourceChapter} · PDF 页码 {course.sourcePages.join("、")}
              </p>
            </button>

            <section className="relative z-10 mt-8 grid gap-6 md:grid-cols-2">
              <ComparisonCard
                body={course.wrongPlay}
                image={sourceImage}
                label="错误打法"
                onOpen={setSelectedCard}
                tone="red"
              />
              <ComparisonCard
                body={course.correctPlay}
                image={sourceImage}
                label="正确打法"
                onOpen={setSelectedCard}
                tone="green"
              />
            </section>
          </section>
        </main>

        <aside className="min-w-0 space-y-6 xl:sticky xl:top-8 xl:self-start">
          {primaryQuestion ? (
            <TrainingQuestionCard
              isCorrect={isCorrect}
              onReset={resetQuestion}
              onSelect={setSelectedAnswer}
              onSubmit={submitAnswer}
              onViewReview={() => setQuestionState("review")}
              question={primaryQuestion}
              questionState={questionState}
              selectedAnswer={selectedAnswer}
              title={course.title}
            />
          ) : null}
          <CoachFeedback
            isCorrect={isCorrect}
            onOpen={() => setCoachOpen(true)}
            questionState={questionState}
            review={course.aiReview}
          />
        </aside>
      </section>

      {coachOpen ? <CoachPanel course={course} onClose={() => setCoachOpen(false)} /> : null}
      {selectedCard ? <FocusModal card={selectedCard} onClose={() => setSelectedCard(null)} /> : null}
    </div>
  );
}

function ComparisonCard({
  body,
  image,
  label,
  onOpen,
  tone
}: {
  body: string;
  image: string;
  label: string;
  onOpen: (card: FocusCard) => void;
  tone: "red" | "green";
}) {
  const isError = tone === "red";

  return (
    <button
      className={[
        "group flex min-h-[300px] flex-col gap-4 rounded-2xl border p-5 text-left backdrop-blur-sm transition duration-300 hover:-translate-y-2",
        isError
          ? "border-[#ef4444]/25 bg-[#ef4444]/5 shadow-[0_0_20px_rgba(239,68,68,0.10)]"
          : "border-[#3b82f6]/25 bg-[#3b82f6]/5 shadow-[0_0_20px_rgba(59,130,246,0.10)]"
      ].join(" ")}
      onClick={() =>
        onOpen({
          title: label,
          eyebrow: isError ? "错误示范" : "正确示范",
          body,
          detail: isError
            ? "这个错误的本质是只看眼前能不能出，忽略出完以后牌权和队友位置会怎样变化。"
            : "正确打法先判断当前角色和牌权，再决定是否出牌、压牌或让牌。",
          tone
        })
      }
      type="button"
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl bg-black/10">
        <div
          className={[
            "relative h-28 w-20 overflow-hidden rounded-lg border shadow-2xl",
            isError ? "-rotate-12 border-[#ba1a1a]/30" : "rotate-6 border-[#0058be]/30"
          ].join(" ")}
        >
          <Image alt={label} className="object-cover" fill sizes="80px" src={image} />
        </div>
      </div>
      <div>
        <h3
          className={[
            "flex items-center gap-2 text-xl font-black",
            isError ? "text-[#ba1a1a]" : "text-[#0058be]"
          ].join(" ")}
        >
          <span className="material-symbols-outlined text-base">
            {isError ? "cancel" : "check_circle"}
          </span>
          {label}
        </h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#424754]">{body}</p>
      </div>
    </button>
  );
}

function TrainingQuestionCard({
  isCorrect,
  onReset,
  onSelect,
  onSubmit,
  onViewReview,
  question,
  questionState,
  selectedAnswer,
  title
}: {
  isCorrect: boolean;
  onReset: () => void;
  onSelect: (answer: string) => void;
  onSubmit: () => void;
  onViewReview: () => void;
  question: GuandanQuestion;
  questionState: QuestionState;
  selectedAnswer: string | null;
  title: string;
}) {
  return (
    <section className="flex min-h-[640px] flex-col gap-6 rounded-[32px] border border-[#d8e3fb] bg-white/82 p-6 shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-[#d8e3fb]/70 pb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#0058be]">quiz</span>
          <h2 className="text-xl font-black text-[#111c2d]">训练题</h2>
        </div>
        <span className="rounded-full bg-[#e7eeff] px-4 py-1 text-xs font-bold text-[#424754]">
          {questionState === "idle" ? "第一阶段" : questionState === "answered" ? "第二阶段" : "第三阶段"}
        </span>
      </div>

      <div className="space-y-4">
        <p className="text-lg font-black leading-8 text-[#111c2d]">
          学习《{title}》后，遇到同类牌局应该先看什么？
        </p>
        <p className="text-sm font-semibold leading-6 text-[#727785]">{question.question}</p>
        <div className="space-y-4 pt-2">
          {question.options.map((option, index) => {
            const selected = selectedAnswer === option;
            return (
              <button
                className={[
                  "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition active:scale-[0.98]",
                  selected
                    ? "border-[#0058be] bg-[#0058be]/10"
                    : "border-[#c2c6d6] hover:border-[#0058be] hover:bg-[#0058be]/5",
                  questionState !== "idle" ? "cursor-default" : "cursor-pointer"
                ].join(" ")}
                disabled={questionState !== "idle"}
                key={option}
                onClick={() => onSelect(option)}
                type="button"
              >
                <span
                  className={[
                    "mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs font-black",
                    selected
                      ? "border-[#0058be] bg-[#0058be] text-white"
                      : "border-[#c2c6d6] text-[#424754]"
                  ].join(" ")}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span
                  className={[
                    "text-sm font-semibold leading-7",
                    selected ? "text-[#0058be]" : "text-[#424754]"
                  ].join(" ")}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {questionState === "answered" ? (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={[
            "rounded-2xl border p-4",
            isCorrect ? "border-[#45D483] bg-[#45D483]/10" : "border-[#ba1a1a] bg-[#ffdad6]/55"
          ].join(" ")}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <p className={["text-lg font-black", isCorrect ? "text-[#17814d]" : "text-[#93000a]"].join(" ")}>
            {isCorrect ? "回答正确" : "回答错误"}
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#424754]">
            {isCorrect ? "判断方向正确，继续看完整解析。" : question.wrongReasons[0] ?? "这个选择没有抓住牌权和角色判断。"}
          </p>
        </motion.div>
      ) : null}

      {questionState === "review" ? (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="rounded-2xl border border-[#adc6ff] bg-[#e7eeff] p-4"
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <p className="text-xs font-black text-[#0058be]">标准答案</p>
          <p className="mt-2 text-base font-black leading-7 text-[#111c2d]">{question.answer}</p>
          <p className="mt-3 text-sm font-semibold leading-7 text-[#424754]">{question.analysis}</p>
        </motion.div>
      ) : null}

      <div className="mt-auto space-y-4">
        <Button
          className="h-20 w-full rounded-2xl text-xl shadow-lg shadow-[#0058be]/20"
          disabled={!selectedAnswer || questionState !== "idle"}
          onClick={onSubmit}
        >
          确认提交
        </Button>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <Button disabled={!selectedAnswer} onClick={onViewReview} variant="secondary">
            查看解析
          </Button>
          {questionState !== "idle" ? (
            <Button onClick={onReset} variant="secondary">
              重新作答
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function CoachFeedback({
  isCorrect,
  onOpen,
  questionState,
  review
}: {
  isCorrect: boolean;
  onOpen: () => void;
  questionState: QuestionState;
  review: string;
}) {
  const feedback =
    questionState === "idle"
      ? "先做判断，再看解析。训练的是你的第一反应。"
      : isCorrect
        ? "你的判断力提升了 12%，保持现状！"
        : "这题暴露了判断顺序问题，先回到角色和牌权。";

  return (
    <button
      className="flex w-full items-center gap-5 rounded-[28px] border border-[#0058be]/20 bg-[#0058be]/10 p-5 text-left backdrop-blur-md"
      onClick={onOpen}
      type="button"
    >
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#0058be] text-white shadow-inner">
        <span className="material-symbols-outlined">psychology</span>
      </span>
      <span>
        <span className="text-xs font-black text-[#0058be]">AI 教练点评</span>
        <span className="mt-1 block text-sm font-semibold leading-6 text-[#424754]">{feedback}</span>
        {questionState === "review" ? (
          <span className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-[#424754]/75">
            {review}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function FocusModal({ card, onClose }: { card: FocusCard; onClose: () => void }) {
  const tone =
    card.tone === "red"
      ? "border-[#ffc9c9]"
      : card.tone === "green"
        ? "border-[#bdf1d2]"
        : "border-[#adc6ff]";

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 grid place-items-center bg-[#0f172a]/45 p-4 backdrop-blur-[10px]"
      initial={{ opacity: 0 }}
      onClick={onClose}
      role="presentation"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.article
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-3xl rounded-[30px] border ${tone} bg-white p-7 shadow-[0_30px_90px_rgba(15,23,42,0.26)]`}
        initial={{ opacity: 0, scale: 0.95 }}
        onClick={(event) => event.stopPropagation()}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-full bg-[#e7eeff] px-3 py-1.5 text-sm font-black text-[#0058be]">
            {card.eyebrow}
          </span>
          <button
            className="rounded-full border border-[#d8e3fb] px-3 py-1 text-sm font-black text-[#52657a]"
            onClick={onClose}
            type="button"
          >
            关闭
          </button>
        </div>
        <h2 className="mt-6 text-[32px] font-black leading-tight text-[#12395a]">
          {card.title}
        </h2>
        <p className="mt-5 text-lg font-bold leading-9 text-[#334155]">{card.body}</p>
        <p className="mt-5 rounded-[22px] bg-[#f0f7ff] p-5 text-lg font-semibold leading-9 text-[#52657a]">
          {card.detail}
        </p>
      </motion.article>
    </motion.div>
  );
}

function CoachPanel({ course, onClose }: { course: GuandanCourse; onClose: () => void }) {
  return (
    <div className="fixed bottom-24 right-5 z-40 w-[min(360px,calc(100vw-40px))] rounded-[28px] border border-[#adc6ff] bg-white p-5 shadow-[0_24px_70px_rgba(0,88,190,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#0058be]">AI 讲解</p>
          <h2 className="mt-2 text-xl font-black text-[#12395a]">{course.title}</h2>
        </div>
        <button
          className="rounded-full border border-[#d8e3fb] px-3 py-1 text-xs font-black text-[#52657a]"
          onClick={onClose}
          type="button"
        >
          关闭
        </button>
      </div>
      <p className="mt-4 text-sm font-semibold leading-7 text-[#52657a]">
        今天重点：不要急着出牌，先判断牌权。再看你是主攻、助攻，还是应该让牌保护队友。
      </p>
      <p className="mt-3 rounded-[18px] bg-[#f0f7ff] p-4 text-sm font-bold leading-7 text-[#334155]">
        {course.aiReview}
      </p>
    </div>
  );
}
