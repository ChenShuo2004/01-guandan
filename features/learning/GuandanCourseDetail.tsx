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

  const cards = useMemo(
    () => [
      {
        title: course.title,
        eyebrow: "核心知识卡",
        body: course.description,
        detail: course.coreExplanation,
        tone: "blue" as const
      },
      {
        title: course.slogan.replace(/^口诀：/, ""),
        eyebrow: "口诀卡",
        body: "把这句话先记住，再看牌局。",
        detail: course.aiCoachPrompt,
        tone: "blue" as const
      }
    ],
    [course]
  );

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
      <section className="grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <main className="min-w-0 space-y-4">
          <div className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#e7eeff] px-3 py-1.5 text-xs font-black text-[#0058be]">
                {course.category}
              </span>
              <span className="rounded-full bg-[#f0f7ff] px-3 py-1.5 text-xs font-black text-[#52657a]">
                {course.difficulty}
              </span>
              <span className="rounded-full bg-[#f0f7ff] px-3 py-1.5 text-xs font-black text-[#52657a]">
                {course.sourceChapter}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-black leading-10 text-[#12395a]">
              {course.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-[#52657a]">
              这是一张 AI 掼蛋训练知识卡。先理解判断，再进入训练题，不用在 PDF 大图里找重点。
            </p>
          </div>

          <section className="grid gap-4 lg:grid-cols-2">
            {cards.map((card) => (
              <KnowledgeCard card={card} key={card.eyebrow} onOpen={setSelectedCard} />
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <ContrastCard
              body={course.wrongPlay}
              label="错误打法"
              marker="X"
              onOpen={setSelectedCard}
              tone="red"
            />
            <ContrastCard
              body={course.correctPlay}
              label="正确打法"
              marker="OK"
              onOpen={setSelectedCard}
              tone="green"
            />
          </section>

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
            />
          ) : null}
        </main>

        <aside className="xl:sticky xl:top-8 xl:self-start">
          <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_18px_48px_rgba(0,88,190,0.05)]">
            <p className="text-sm font-black text-[#0058be]">AI 教练知识总结</p>
            <h2 className="mt-3 text-2xl font-black leading-8 text-[#12395a]">
              今天重点
            </h2>
            <p className="mt-3 text-sm font-bold leading-7 text-[#334155]">
              不要急着出牌，先判断牌权、角色和这手打完后的局势变化。
            </p>
            <div className="mt-4 grid gap-2">
              {course.knowledgePoints.slice(0, 5).map((point) => (
                <div
                  className="rounded-[18px] border border-[#d8e3fb] bg-[#f8fbff] px-3 py-2 text-sm font-bold text-[#52657a]"
                  key={point}
                >
                  {point}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[20px] bg-[#f0f7ff] p-4">
              <p className="text-xs font-black text-[#0058be]">来源</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#334155]">
                {course.sourceChapter} · PDF 页码 {course.sourcePages.join("、")}
              </p>
              <p className="mt-2 text-xs font-semibold leading-5 text-[#52657a]">
                PDF 原图仍作为课程资产绑定，但详情页默认转化为知识卡片，减少阅读噪音。
              </p>
            </div>
            <Button className="mt-4 w-full" href="/learning-path" variant="secondary">
              返回学习路线
            </Button>
          </section>
        </aside>
      </section>

      <button
        aria-label="打开 AI 教练讲解"
        className="fixed bottom-5 right-5 z-30 grid h-16 w-16 place-items-center overflow-hidden rounded-3xl border border-[#adc6ff] bg-white shadow-[0_18px_48px_rgba(0,88,190,0.18)] transition hover:scale-[1.03]"
        onClick={() => setCoachOpen(true)}
        type="button"
      >
        <Image
          alt="AI 教练"
          className="object-cover"
          fill
          sizes="64px"
          src="/assets/coach/coach-analysis-mode.png"
        />
      </button>

      {coachOpen ? <CoachPanel course={course} onClose={() => setCoachOpen(false)} /> : null}
      {selectedCard ? <FocusModal card={selectedCard} onClose={() => setSelectedCard(null)} /> : null}
    </div>
  );
}

function KnowledgeCard({
  card,
  onOpen
}: {
  card: FocusCard;
  onOpen: (card: FocusCard) => void;
}) {
  return (
    <button
      className="group min-h-[220px] rounded-[24px] border border-[#adc6ff] bg-white p-5 text-left shadow-[0_14px_38px_rgba(0,88,190,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(0,88,190,0.12)]"
      onClick={() => onOpen(card)}
      type="button"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#e7eeff] px-3 py-1.5 text-xs font-black text-[#0058be]">
          {card.eyebrow}
        </span>
        <span className="text-xs font-black text-[#8a96aa] group-hover:text-[#0058be]">
          点击放大
        </span>
      </div>
      <h2 className="mt-5 text-2xl font-black leading-8 text-[#12395a]">{card.title}</h2>
      <p className="mt-4 text-sm font-semibold leading-7 text-[#52657a]">{card.body}</p>
    </button>
  );
}

function ContrastCard({
  body,
  label,
  marker,
  onOpen,
  tone
}: {
  body: string;
  label: string;
  marker: string;
  onOpen: (card: FocusCard) => void;
  tone: "red" | "green";
}) {
  const toneClass =
    tone === "red"
      ? "border-[#ffc9c9] bg-[#fff6f6] text-[#b4232f]"
      : "border-[#bdf1d2] bg-[#f3fff8] text-[#17814d]";

  return (
    <button
      className={`min-h-[190px] rounded-[24px] border p-5 text-left shadow-[0_12px_34px_rgba(0,88,190,0.05)] transition hover:-translate-y-0.5 ${toneClass}`}
      onClick={() =>
        onOpen({
          title: label,
          eyebrow: marker,
          body,
          detail:
            tone === "red"
              ? "这个错误的本质是只看眼前能不能出，忽略出完以后牌权和队友位置会怎样变化。"
              : "正确打法先判断当前角色和牌权，再决定是否出牌、压牌或让牌。",
          tone
        })
      }
      type="button"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-black">{label}</p>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black">{marker}</span>
      </div>
      <p className="mt-5 text-lg font-black leading-8">{body}</p>
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
  selectedAnswer
}: {
  isCorrect: boolean;
  onReset: () => void;
  onSelect: (answer: string) => void;
  onSubmit: () => void;
  onViewReview: () => void;
  question: GuandanQuestion;
  questionState: QuestionState;
  selectedAnswer: string | null;
}) {
  return (
    <section className="rounded-[28px] border border-[#adc6ff] bg-white p-5 shadow-[0_18px_48px_rgba(0,88,190,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#0058be]">训练题</p>
          <h2 className="mt-2 text-2xl font-black leading-8 text-[#12395a]">
            先回答，再看答案
          </h2>
        </div>
        <span className="rounded-full bg-[#e7eeff] px-3 py-1.5 text-xs font-black text-[#0058be]">
          {questionState === "idle" ? "第一阶段" : questionState === "answered" ? "第二阶段" : "第三阶段"}
        </span>
      </div>

      <p className="mt-5 text-base font-black leading-8 text-[#334155]">
        {question.question}
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {question.options.map((option, index) => {
          const selected = selectedAnswer === option;
          return (
            <button
              className={[
                "min-h-14 rounded-[18px] border px-4 py-3 text-left text-sm font-bold leading-6 transition",
                selected
                  ? "border-[#0058be] bg-[#e7eeff] text-[#0058be]"
                  : "border-[#d8e3fb] bg-[#fbfdff] text-[#52657a] hover:border-[#64a8fe]",
                questionState !== "idle" ? "cursor-default" : ""
              ].join(" ")}
              disabled={questionState !== "idle"}
              key={option}
              onClick={() => onSelect(option)}
              type="button"
            >
              {String.fromCharCode(65 + index)}. {option}
            </button>
          );
        })}
      </div>

      {questionState === "idle" ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button disabled={!selectedAnswer} onClick={onSubmit}>
            提交答案
          </Button>
          <p className="text-sm font-semibold leading-6 text-[#6f7b91]">
            提交前不会显示标准答案。
          </p>
        </div>
      ) : null}

      {questionState === "answered" ? (
        <div
          className={[
            "mt-5 rounded-[22px] border p-4 transition duration-300",
            isCorrect ? "border-[#45D483] bg-[#45D483]/10" : "border-[#FF6B6B] bg-[#FF6B6B]/10"
          ].join(" ")}
        >
          <p className={["text-xl font-black", isCorrect ? "text-[#17814d]" : "text-[#b4232f]"].join(" ")}>
            {isCorrect ? "回答正确" : "回答错误"}
          </p>
          <p className="mt-2 text-sm font-semibold leading-7 text-[#334155]">
            {isCorrect ? "这一步判断是对的。" : question.wrongReasons[0] ?? "这个选择没有抓住当前牌局的核心判断。"}
          </p>
          <div className="mt-4 flex gap-3">
            <Button onClick={onViewReview}>查看标准答案</Button>
            <Button onClick={onReset} variant="secondary">
              重答
            </Button>
          </div>
        </div>
      ) : null}

      {questionState === "review" ? (
        <div className="mt-5 rounded-[22px] border border-[#adc6ff] bg-[#f0f7ff] p-4">
          <p className="text-xs font-black text-[#0058be]">标准答案</p>
          <p className="mt-2 text-base font-black leading-7 text-[#12395a]">
            {question.answer}
          </p>
          <p className="mt-3 text-sm font-semibold leading-7 text-[#52657a]">
            {question.analysis}
          </p>
          <p className="mt-3 text-sm font-bold leading-7 text-[#334155]">
            AI Coach：{question.aiCoachComment}
          </p>
        </div>
      ) : null}
    </section>
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
