"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { GuandanCourse, GuandanQuestion } from "@/lib/guandan/catalog";

type QuestionState = "idle" | "answered" | "review";

interface GuandanCourseDetailProps {
  course: GuandanCourse;
  questions: GuandanQuestion[];
}

const navItems = [
  { href: "/", icon: "dashboard", label: "Arena Dashboard" },
  { href: "/assessment/start", icon: "analytics", label: "Diagnostic" },
  { href: "/learning-path", icon: "school", label: "Training Hub" },
  { href: "/learning-path", icon: "local_library", label: "Academy" },
  { href: "/practice", icon: "extension", label: "Endgame Challenge" },
  { href: "/profile", icon: "person", label: "Profile Insights" },
  { href: "/history", icon: "history", label: "History" }
];

export function GuandanCourseDetail({ course, questions }: GuandanCourseDetailProps) {
  const primaryQuestion = questions[0];
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [questionState, setQuestionState] = useState<QuestionState>("idle");
  const [tiltStyle, setTiltStyle] = useState<CSSProperties>({
    "--mouse-x": "50%",
    "--mouse-y": "50%",
    "--shine-pos": "0%",
    transform: "rotateX(0deg) rotateY(0deg)"
  } as CSSProperties);

  const isCorrect = selectedAnswer === primaryQuestion?.answer;
  const sourceImage = course.exampleImages[0] ?? "/assets/coach/coach-analysis-mode.png";
  const slogan = useMemo(() => course.slogan.replace(/^口诀：/, ""), [course.slogan]);

  function submitAnswer() {
    if (!selectedAnswer) return;
    setQuestionState("answered");
  }

  function viewReview() {
    if (!selectedAnswer) return;
    setQuestionState("review");
  }

  function resetQuestion() {
    setSelectedAnswer(null);
    setQuestionState("idle");
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#f9f9ff] text-[#111c2d]">
      <KnowledgeSidebar />
      <KnowledgeTopBar />

      <main className="h-screen overflow-hidden pt-16 lg:ml-80">
        <div className="grid h-[calc(100vh-4rem)] gap-6 p-4 lg:grid-cols-[minmax(0,65fr)_minmax(360px,35fr)] lg:p-6">
          <section className="custom-scrollbar min-h-0 overflow-y-auto pr-1">
            <div
              className="relative flex min-h-full flex-col gap-10 overflow-hidden rounded-[32px] border border-white/20 bg-[linear-gradient(145deg,rgba(96,73,110,0.55)_0%,rgba(113,196,255,0.27)_100%)] p-6 shadow-2xl backdrop-blur-xl md:p-10"
              onMouseLeave={() =>
                setTiltStyle({
                  "--mouse-x": "50%",
                  "--mouse-y": "50%",
                  "--shine-pos": "0%",
                  transform: "rotateX(0deg) rotateY(0deg)"
                } as CSSProperties)
              }
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const px = (x / rect.width) * 100;
                const py = (y / rect.height) * 100;
                setTiltStyle({
                  "--mouse-x": `${px}%`,
                  "--mouse-y": `${py}%`,
                  "--shine-pos": `${px}%`,
                  transform: `rotateX(${-(py - 50) / 18}deg) rotateY(${(px - 50) / 18}deg)`
                } as CSSProperties);
              }}
              style={tiltStyle}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.16)_0%,transparent_58%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.10)_48%,rgba(255,255,255,0.30)_50%,rgba(255,255,255,0.10)_52%,transparent_80%)] bg-[length:200%_200%] bg-[position:var(--shine-pos)_center] mix-blend-overlay" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:40px_40px]" />
              <div className="pointer-events-none absolute left-[var(--mouse-x)] top-[var(--mouse-y)] -z-0 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.38)_0%,transparent_70%)] blur-3xl" />

              <div className="relative z-10 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[#adc6ff] [font-variation-settings:'FILL'_1]">
                      lightbulb
                    </span>
                    <span className="text-sm font-semibold leading-6 text-white/90">
                      今日重点：不要急着出牌，先判断牌权、角色和对手变化
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-sm text-white/40">close</span>
                </div>
              </div>

              <section className="relative z-10 flex items-start justify-between gap-6">
                <div className="space-y-4">
                  <span className="inline-flex rounded-full bg-[#0058be]/20 px-4 py-2 text-xs font-bold tracking-wider text-[#adc6ff] backdrop-blur-sm">
                    核心知识卡
                  </span>
                  <h1 className="text-[40px] font-black leading-tight text-white drop-shadow-md">
                    {course.title}
                  </h1>
                  <p className="max-w-xl text-lg font-semibold leading-8 text-white/72">
                    {course.description}
                  </p>
                </div>
                <div className="relative hidden shrink-0 md:block">
                  <div className="absolute -inset-4 rounded-full bg-[#0058be]/30 blur-xl" />
                  <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl">
                    <Image
                      alt="AI Coach Ace"
                      className="object-cover"
                      fill
                      sizes="112px"
                      src="/assets/coach/coach-analysis-mode.png"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-3 rounded-lg bg-white px-3 py-1 shadow-lg">
                    <span className="text-[10px] font-black text-[#0058be]">ACE COACH</span>
                  </div>
                </div>
              </section>

              <button
                className="relative z-10 overflow-hidden rounded-2xl border border-white/20 bg-white/60 p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.05)] backdrop-blur-sm"
                type="button"
              >
                <div className="absolute right-4 top-3 flex items-center gap-1 text-[#424754]/45">
                  <span className="text-[10px] font-black">口诀卡</span>
                  <span className="material-symbols-outlined text-sm">zoom_in</span>
                </div>
                <p className="px-4 text-[28px] font-black leading-relaxed text-[#0058be] drop-shadow-sm">
                  “{slogan}”
                </p>
                <p className="mt-5 text-xs font-bold text-[#424754]/60">
                  {course.sourceChapter} · PDF 页码 {course.sourcePages.join("、")}
                </p>
              </button>

              <section className="relative z-10 grid gap-6 md:grid-cols-2">
                <PlayComparisonCard
                  body={course.wrongPlay}
                  image={sourceImage}
                  label="错误打法"
                  tone="error"
                />
                <PlayComparisonCard
                  body={course.correctPlay}
                  image={sourceImage}
                  label="正确打法"
                  tone="primary"
                />
              </section>
            </div>
          </section>

          <aside className="min-h-0 space-y-6 overflow-y-auto">
            {primaryQuestion ? (
              <QuizPanel
                isCorrect={isCorrect}
                onReset={resetQuestion}
                onSelect={setSelectedAnswer}
                onSubmit={submitAnswer}
                onViewReview={viewReview}
                question={primaryQuestion}
                questionState={questionState}
                selectedAnswer={selectedAnswer}
                title={course.title}
              />
            ) : null}
            <CoachFeedback
              isCorrect={isCorrect}
              questionState={questionState}
              review={course.aiReview}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}

function KnowledgeSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-80 flex-col border-r border-[#c2c6d6] bg-[#f0f3ff] p-8 lg:flex">
      <div className="mb-16">
        <h1 className="text-[40px] font-black leading-tight tracking-tight text-[#0058be]">
          Guandan
          <br />
          Master
        </h1>
        <p className="mt-2 text-sm font-semibold tracking-[0.12em] text-[#111c2d]">
          AI Training Platform
        </p>
      </div>

      <nav className="flex-1 space-y-3">
        {navItems.map((item) => {
          const active = item.label === "Training Hub";
          return (
            <Link
              className={[
                "flex items-center gap-5 rounded-xl p-4 text-sm font-semibold tracking-[0.08em] transition",
                active
                  ? "border-r-4 border-[#0058be] bg-[#64a8fe]/20 text-[#0058be]"
                  : "text-[#424754] hover:bg-[#dee8ff]"
              ].join(" ")}
              href={item.href}
              key={item.label}
            >
              <span className="material-symbols-outlined text-[25px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        className="mt-8 flex h-16 items-center justify-center rounded-2xl bg-[#0058be] text-2xl font-black text-white shadow-sm transition hover:bg-[#2170e4] active:scale-95"
        href="/learning-path"
      >
        Start Training
      </Link>
    </aside>
  );
}

function KnowledgeTopBar() {
  return (
    <header className="fixed right-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#d8e3fb]/50 bg-[#f9f9ff]/85 px-6 backdrop-blur-md lg:w-[calc(100%-20rem)]">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-[#0058be]">auto_awesome</span>
        <h2 className="text-xl font-black text-[#0058be]">Guandan AI Academy</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#424754]">
            search
          </span>
          <input
            className="h-10 w-80 rounded-full border-none bg-[#e7eeff] pl-10 pr-4 text-sm font-semibold text-[#424754] outline-none ring-0 placeholder:text-[#424754]/70 focus:ring-2 focus:ring-[#0058be]"
            placeholder="搜索课程或技巧..."
            type="text"
          />
        </div>
        <button className="rounded-full p-2 transition hover:bg-[#dee8ff]" type="button">
          <span className="material-symbols-outlined text-[#111c2d]">notifications</span>
        </button>
        <Link
          className="relative h-9 w-9 overflow-hidden rounded-full border border-[#0058be]/20 bg-[#d8e2ff]"
          href="/profile"
        >
          <Image
            alt="用户头像"
            className="object-cover"
            fill
            sizes="36px"
            src="/assets/coach/coach-master-certification.png"
          />
        </Link>
      </div>
    </header>
  );
}

function PlayComparisonCard({
  body,
  image,
  label,
  tone
}: {
  body: string;
  image: string;
  label: string;
  tone: "error" | "primary";
}) {
  const isError = tone === "error";

  return (
    <button
      className={[
        "group flex flex-col gap-4 rounded-2xl border p-6 text-left backdrop-blur-sm transition duration-300 hover:-translate-y-2",
        isError
          ? "border-[#ef4444]/25 bg-[#ef4444]/5 shadow-[0_0_20px_rgba(239,68,68,0.10)]"
          : "border-[#3b82f6]/25 bg-[#3b82f6]/5 shadow-[0_0_20px_rgba(59,130,246,0.10)]"
      ].join(" ")}
      type="button"
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl bg-black/10">
        <div
          className={[
            "relative h-28 w-20 overflow-hidden rounded-lg border shadow-2xl",
            isError ? "-rotate-12 border-[#ba1a1a]/30" : "rotate-6 border-[#0058be]/30"
          ].join(" ")}
        >
          <Image
            alt={label}
            className="object-cover"
            fill
            sizes="80px"
            src={image}
          />
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

function QuizPanel({
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
    <section className="flex min-h-[calc(100vh-12rem)] flex-col gap-6 rounded-[32px] border border-[#d8e3fb] bg-white/80 p-8 shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-[#d8e3fb]/65 pb-4">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#0058be]">quiz</span>
          <h3 className="text-xl font-black text-[#111c2d]">训练题</h3>
        </div>
        <span className="rounded-full bg-[#e7eeff] px-4 py-1 text-xs font-bold text-[#424754]">
          {questionState === "idle" ? "第一阶段" : questionState === "answered" ? "第二阶段" : "第三阶段"}
        </span>
      </div>

      <div className="space-y-5">
        <p className="text-lg font-black leading-8 text-[#111c2d]">
          学习《{title}》后，遇到同类牌局应该先看什么？
        </p>
        <p className="text-sm font-semibold leading-6 text-[#727785]">{question.question}</p>
        <div className="space-y-5 pt-2">
          {question.options.map((option, index) => {
            const selected = selectedAnswer === option;
            return (
              <button
                className={[
                  "flex w-full items-start gap-4 rounded-xl border p-5 text-left transition active:scale-[0.98]",
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
                    "text-base font-semibold leading-7",
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

      <div className="mt-auto space-y-5">
        <button
          className="h-24 w-full rounded-2xl bg-[#0058be] text-2xl font-black text-white shadow-lg shadow-[#0058be]/20 transition hover:scale-[1.01] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
          disabled={!selectedAnswer || questionState !== "idle"}
          onClick={onSubmit}
          type="button"
        >
          确认提交
        </button>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <button
            className="h-14 rounded-2xl border border-[#c2c6d6] text-sm font-bold text-[#424754] transition hover:bg-[#dee8ff] disabled:cursor-not-allowed disabled:opacity-55"
            disabled={!selectedAnswer}
            onClick={onViewReview}
            type="button"
          >
            查看解析
          </button>
          {questionState !== "idle" ? (
            <button
              className="h-14 rounded-2xl border border-[#c2c6d6] text-sm font-bold text-[#424754] transition hover:bg-[#dee8ff]"
              onClick={onReset}
              type="button"
            >
              重新作答
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function CoachFeedback({
  isCorrect,
  questionState,
  review
}: {
  isCorrect: boolean;
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
    <section className="flex items-center gap-6 rounded-[28px] border border-[#0058be]/20 bg-[#0058be]/10 p-6 backdrop-blur-md">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#0058be] text-white shadow-inner">
        <span className="material-symbols-outlined">psychology</span>
      </div>
      <div>
        <h4 className="text-xs font-black text-[#0058be]">AI 教练点评</h4>
        <p className="mt-1 text-base font-semibold leading-7 text-[#424754]">{feedback}</p>
        {questionState === "review" ? (
          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#424754]/75">
            {review}
          </p>
        ) : null}
      </div>
    </section>
  );
}
