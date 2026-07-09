"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { MutableRefObject } from "react";
import { useMemo, useRef, useState } from "react";
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

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: "easeOut",
      staggerChildren: 0.12
    }
  }
};

const blockVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: "easeOut" }
  }
};

export function GuandanCourseDetail({ course, questions }: GuandanCourseDetailProps) {
  const primaryQuestion = questions[0];
  const questionRef = useRef<HTMLElement | null>(null);
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

  function startTraining() {
    questionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <motion.div
      animate="show"
      className="relative"
      initial="hidden"
      variants={pageVariants}
    >
      <section className="grid gap-6 xl:grid-cols-[minmax(0,70fr)_minmax(340px,30fr)]">
        <main className="min-w-0">
          <motion.section
            className="relative overflow-hidden rounded-[32px] border border-white/40 bg-[linear-gradient(145deg,rgba(38,49,67,0.92)_0%,rgba(0,88,190,0.78)_46%,rgba(113,196,255,0.48)_100%)] p-5 shadow-[0_30px_80px_rgba(0,88,190,0.20)] backdrop-blur-xl md:p-8"
            variants={blockVariants}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,rgba(255,255,255,0.28),transparent_32%),radial-gradient(circle_at_18%_88%,rgba(173,198,255,0.25),transparent_36%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:38px_38px]" />

            <motion.div
              className="relative z-10 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
              variants={blockVariants}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-0.5 text-[#adc6ff]">
                    lightbulb
                  </span>
                  <p className="text-sm font-bold leading-6 text-white/90">
                    今日重点：不要急着出牌，先判断牌权、角色和对手变化。
                  </p>
                </div>
                <span className="material-symbols-outlined text-sm text-white/40">close</span>
              </div>
            </motion.div>

            <section className="relative z-10 mt-8 flex items-start justify-between gap-6">
              <motion.button
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
                variants={blockVariants}
              >
                <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-black tracking-[0.14em] text-[#d8e2ff] backdrop-blur-sm">
                  核心知识卡
                </span>
                <h1 className="max-w-2xl text-[34px] font-black leading-tight text-white drop-shadow-md md:text-[42px]">
                  {course.title}
                </h1>
                <p className="max-w-2xl text-lg font-bold leading-8 text-white/75">
                  {course.description}
                </p>
              </motion.button>

              <motion.button
                aria-label="打开 AI 教练讲解"
                animate={{ y: [0, -8, 0] }}
                className="relative hidden shrink-0 md:block"
                onClick={() => setCoachOpen(true)}
                transition={{ duration: 4.2, ease: "easeInOut", repeat: Infinity }}
                type="button"
                variants={blockVariants}
              >
                <span className="absolute -inset-5 rounded-full bg-[#64a8fe]/40 blur-2xl" />
                <span className="absolute -inset-1 rounded-[28px] border border-white/20" />
                <span className="relative block h-28 w-28 overflow-hidden rounded-2xl border-2 border-white/25 bg-white/12 shadow-2xl">
                  <Image
                    alt="AI Coach Ace"
                    className="object-cover"
                    fill
                    priority
                    sizes="112px"
                    src="/assets/coach/coach-analysis-mode.png"
                  />
                </span>
                <span className="absolute -bottom-2 -right-3 rounded-lg bg-white px-3 py-1 text-[10px] font-black text-[#0058be] shadow-lg">
                  ACE COACH
                </span>
              </motion.button>
            </section>

            <motion.button
              className="relative z-10 mt-8 w-full overflow-hidden rounded-2xl border border-white/30 bg-white/75 p-7 text-center shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_24px_60px_rgba(0,88,190,0.16)]"
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
              variants={blockVariants}
            >
              <div className="absolute right-4 top-3 flex items-center gap-1 text-[#424754]/45">
                <span className="text-[10px] font-black">口诀卡</span>
                <span className="material-symbols-outlined text-sm">zoom_in</span>
              </div>
              <p className="px-2 text-[26px] font-black leading-relaxed text-[#0058be] drop-shadow-sm md:px-5 md:text-[30px]">
                “{slogan}”
              </p>
              <p className="mt-4 text-xs font-bold text-[#424754]/60">
                {course.sourceChapter} · PDF 页码 {course.sourcePages.join("、")}
              </p>
            </motion.button>

            <motion.section
              className="relative z-10 mt-8 grid gap-6 md:grid-cols-2"
              variants={blockVariants}
            >
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
            </motion.section>
          </motion.section>

          <LearningLoop />
        </main>

        <aside className="min-w-0 space-y-6 xl:sticky xl:top-20 xl:self-start">
          <AceCoachAssistant onStartTraining={startTraining} />
          {primaryQuestion ? (
            <TrainingQuestionCard
              isCorrect={isCorrect}
              onReset={resetQuestion}
              onSelect={setSelectedAnswer}
              onSubmit={submitAnswer}
              onViewReview={() => setQuestionState("review")}
              question={primaryQuestion}
              questionRef={questionRef}
              questionState={questionState}
              selectedAnswer={selectedAnswer}
              title={course.title}
            />
          ) : null}
        </aside>
      </section>

      {coachOpen ? <CoachPanel course={course} onClose={() => setCoachOpen(false)} /> : null}
      {selectedCard ? <FocusModal card={selectedCard} onClose={() => setSelectedCard(null)} /> : null}
    </motion.div>
  );
}

function AceCoachAssistant({ onStartTraining }: { onStartTraining: () => void }) {
  return (
    <motion.section
      className="relative overflow-hidden rounded-[32px] border border-[#adc6ff]/70 bg-white/85 p-6 shadow-[0_18px_56px_rgba(0,88,190,0.12)] backdrop-blur-xl"
      variants={blockVariants}
    >
      <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[#64a8fe]/25 blur-3xl" />
      <div className="relative flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <span className="absolute -inset-2 rounded-2xl bg-[#0058be]/20 blur-xl" />
          <span className="relative block h-16 w-16 overflow-hidden rounded-2xl border border-[#adc6ff] bg-[#e7eeff]">
            <Image
              alt="Ace Coach"
              className="object-cover"
              fill
              sizes="64px"
              src="/assets/coach/coach-analysis-mode.png"
            />
          </span>
        </div>
        <div>
          <p className="text-xs font-black tracking-[0.14em] text-[#0058be]">ACE COACH</p>
          <h2 className="mt-1 text-2xl font-black leading-8 text-[#111c2d]">
            今日训练目标
          </h2>
          <p className="mt-1 text-lg font-black text-[#0058be]">牌权判断</p>
        </div>
      </div>

      <div className="relative mt-6 rounded-2xl border border-[#d8e3fb] bg-[#f0f7ff]/80 p-4">
        <p className="text-xs font-black text-[#0058be]">AI 提示</p>
        <p className="mt-2 text-base font-black leading-7 text-[#12395a]">不要急着出牌。</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#424754]">
          先把判断顺序稳定下来，出牌自然会更准。
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {["当前谁掌握牌权", "对手剩余牌", "队友需求"].map((item, index) => (
          <div
            className="flex items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-white/80 p-3"
            key={item}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#0058be] text-xs font-black text-white">
              {index + 1}
            </span>
            <span className="text-sm font-bold text-[#334155]">{item}</span>
          </div>
        ))}
      </div>

      <motion.div className="mt-6" variants={blockVariants}>
        <Button
          className="h-14 w-full rounded-xl text-base shadow-[0_16px_36px_rgba(0,88,190,0.22)]"
          onClick={onStartTraining}
        >
          开始训练
        </Button>
      </motion.div>
    </motion.section>
  );
}

function LearningLoop() {
  const steps = ["知识理解", "口诀记忆", "案例分析", "训练题", "AI反馈"];

  return (
    <motion.section
      className="mt-6 rounded-[28px] border border-[#d8e3fb] bg-white/75 p-5 shadow-[0_12px_40px_rgba(0,88,190,0.07)] backdrop-blur-xl"
      variants={blockVariants}
    >
      <div className="flex flex-wrap items-center gap-3">
        {steps.map((step, index) => (
          <div className="flex items-center gap-3" key={step}>
            <span className="rounded-xl border border-[#adc6ff]/70 bg-[#f0f7ff] px-3 py-2 text-xs font-black text-[#0058be]">
              {step}
            </span>
            {index < steps.length - 1 ? (
              <span className="material-symbols-outlined text-base text-[#adc6ff]">
                arrow_forward
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </motion.section>
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
        "group flex min-h-[250px] flex-col gap-4 rounded-2xl border p-5 text-left backdrop-blur-sm transition duration-300 hover:-translate-y-2",
        isError
          ? "border-[#ef4444]/30 bg-[#fff5f5]/80 shadow-[0_0_20px_rgba(239,68,68,0.12)] hover:shadow-[0_18px_42px_rgba(239,68,68,0.16)]"
          : "border-[#3b82f6]/30 bg-[#f0f7ff]/90 shadow-[0_0_20px_rgba(59,130,246,0.12)] hover:shadow-[0_18px_42px_rgba(59,130,246,0.16)]"
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
      <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl bg-white/40">
        <span
          className={[
            "absolute h-24 w-24 rounded-full blur-2xl",
            isError ? "bg-[#ef4444]/18" : "bg-[#3b82f6]/18"
          ].join(" ")}
        />
        <div
          className={[
            "relative h-24 w-16 overflow-hidden rounded-lg border shadow-2xl",
            isError ? "-rotate-12 border-[#ba1a1a]/30" : "rotate-6 border-[#0058be]/30"
          ].join(" ")}
        >
          <Image alt={label} className="object-cover" fill sizes="64px" src={image} />
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
  questionRef,
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
  questionRef: MutableRefObject<HTMLElement | null>;
  questionState: QuestionState;
  selectedAnswer: string | null;
  title: string;
}) {
  return (
    <motion.section
      className="scroll-mt-24 rounded-[28px] border border-[#d8e3fb] bg-white/85 p-5 shadow-[0_18px_56px_rgba(0,88,190,0.10)] backdrop-blur-xl"
      ref={questionRef}
      variants={blockVariants}
    >
      <div className="flex items-center justify-between border-b border-[#d8e3fb]/70 pb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#0058be]">quiz</span>
          <h2 className="text-xl font-black text-[#111c2d]">训练题</h2>
        </div>
        <span className="rounded-xl bg-[#e7eeff] px-3 py-1 text-xs font-bold text-[#424754]">
          {questionState === "idle" ? "判断" : questionState === "answered" ? "反馈" : "复盘"}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <p className="text-base font-black leading-7 text-[#111c2d]">
          学习《{title}》后，遇到同类牌局应该先看什么？
        </p>
        <p className="text-sm font-semibold leading-6 text-[#727785]">{question.question}</p>
        <div className="space-y-3 pt-1">
          {question.options.map((option, index) => {
            const selected = selectedAnswer === option;
            return (
              <button
                className={[
                  "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition active:scale-[0.98]",
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
                    "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs font-black",
                    selected
                      ? "border-[#0058be] bg-[#0058be] text-white"
                      : "border-[#c2c6d6] text-[#424754]"
                  ].join(" ")}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span
                  className={[
                    "text-sm font-semibold leading-6",
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
            "mt-4 rounded-2xl border p-4",
            isCorrect ? "border-[#45D483] bg-[#45D483]/10" : "border-[#ba1a1a] bg-[#ffdad6]/55"
          ].join(" ")}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <p
            className={[
              "text-lg font-black",
              isCorrect ? "text-[#17814d]" : "text-[#93000a]"
            ].join(" ")}
          >
            {isCorrect ? "回答正确" : "回答错误"}
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#424754]">
            {isCorrect
              ? "判断方向正确，继续看完整解析。"
              : question.wrongReasons[0] ?? "这个选择没有抓住牌权和角色判断。"}
          </p>
        </motion.div>
      ) : null}

      {questionState === "review" ? (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mt-4 rounded-2xl border border-[#adc6ff] bg-[#e7eeff] p-4"
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <p className="text-xs font-black text-[#0058be]">标准答案</p>
          <p className="mt-2 text-base font-black leading-7 text-[#111c2d]">
            {question.answer}
          </p>
          <p className="mt-3 text-sm font-semibold leading-7 text-[#424754]">
            {question.analysis}
          </p>
        </motion.div>
      ) : null}

      <div className="mt-5 space-y-3">
        <Button
          className="h-14 w-full rounded-xl text-base shadow-lg shadow-[#0058be]/20"
          disabled={!selectedAnswer || questionState !== "idle"}
          onClick={onSubmit}
        >
          提交判断
        </Button>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <Button disabled={questionState === "idle"} onClick={onViewReview} variant="secondary">
            查看解析
          </Button>
          {questionState !== "idle" ? (
            <Button onClick={onReset} variant="secondary">
              重新作答
            </Button>
          ) : null}
        </div>
      </div>
    </motion.section>
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
          <span className="rounded-xl bg-[#e7eeff] px-3 py-1.5 text-sm font-black text-[#0058be]">
            {card.eyebrow}
          </span>
          <button
            className="rounded-xl border border-[#d8e3fb] px-3 py-1 text-sm font-black text-[#52657a]"
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
          <p className="text-sm font-black text-[#0058be]">Ace Coach</p>
          <h2 className="mt-2 text-xl font-black text-[#12395a]">{course.title}</h2>
        </div>
        <button
          className="rounded-xl border border-[#d8e3fb] px-3 py-1 text-xs font-black text-[#52657a]"
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
