"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CoachBubble } from "@/components/coach/CoachBubble";
import { PokerHand } from "@/components/cards/PokerHand";
import { Button } from "@/components/ui/Button";
import { useProgress } from "@/features/progress/useProgress";
import type { Lesson } from "@/types/lesson";

interface LessonExperienceProps {
  lesson: Lesson;
}

export function LessonExperience({ lesson }: LessonExperienceProps) {
  const router = useRouter();
  const { completeLesson, toggleFavoriteLesson, progress } = useProgress();
  const isFavorite = progress.favoriteLessonIds.includes(lesson.id);

  function finishLesson() {
    completeLesson(lesson.id, lesson.experience);
    router.push("/practice");
  }

  return (
    <div className="space-y-4">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-guandan-border bg-guandan-card p-4"
        initial={{ opacity: 0, y: 10 }}
      >
        <p className="text-sm font-bold text-guandan-gold">一句口诀</p>
        <h2 className="mt-2 text-2xl font-black leading-8">{lesson.slogan}</h2>
        <p className="mt-3 text-sm leading-6 text-guandan-subtext">
          今天只学这一件事：炸弹要改变局势，不是制造情绪。
        </p>
      </motion.section>

      {lesson.steps.map((step, index) => {
        if (step.type === "coach") {
          return <CoachBubble action={step.action} key={index} text={step.text} />;
        }

        if (step.type === "image") {
          return (
            <section
              className="rounded-3xl border border-guandan-border bg-guandan-card p-4"
              key={index}
            >
              <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-guandan-border bg-guandan-muted text-center text-sm font-bold text-guandan-subtext">
                占位图
                <br />
                {step.assetId}
              </div>
              <p className="mt-3 text-sm font-semibold text-guandan-subtext">
                {step.caption}
              </p>
            </section>
          );
        }

        if (step.type === "poker-case") {
          return (
            <section
              className="rounded-3xl border border-guandan-border bg-guandan-card p-4"
              key={index}
            >
              <p className="text-sm font-bold text-guandan-gold">{step.title}</p>
              <div className="mt-4">
                <PokerHand cards={step.cards} />
              </div>
              <p className="mt-2 text-sm leading-6 text-guandan-subtext">{step.note}</p>
            </section>
          );
        }

        if (step.type === "comparison") {
          return (
            <section className="grid gap-3" key={index}>
              <div className="rounded-3xl border border-guandan-border bg-guandan-card p-4">
                <p className="text-sm font-bold text-guandan-danger">{step.wrongLabel}</p>
                <p className="mt-2 text-sm leading-6 text-guandan-subtext">
                  {step.wrongText}
                </p>
              </div>
              <div className="rounded-3xl border border-guandan-border bg-guandan-card p-4">
                <p className="text-sm font-bold text-guandan-success">
                  {step.correctLabel}
                </p>
                <p className="mt-2 text-sm leading-6 text-guandan-subtext">
                  {step.correctText}
                </p>
              </div>
            </section>
          );
        }

        if (step.type === "quiz" && lesson.quiz) {
          return (
            <section
              className="rounded-3xl border border-guandan-border bg-guandan-card p-4"
              key={index}
            >
              <p className="text-sm font-bold text-guandan-gold">小练习</p>
              <p className="mt-2 text-base font-bold leading-7">{lesson.quiz.question}</p>
              <div className="mt-4 grid gap-2">
                {lesson.quiz.options.map((option) => (
                  <div
                    className="rounded-2xl border border-guandan-border bg-guandan-muted p-3 text-sm font-semibold text-guandan-subtext"
                    key={option.id}
                  >
                    {option.label}. {option.text}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        return null;
      })}

      <div className="grid grid-cols-[1fr_1.5fr] gap-3">
        <Button
          onClick={() => toggleFavoriteLesson(lesson.id)}
          variant={isFavorite ? "secondary" : "ghost"}
        >
          {isFavorite ? "已收藏" : "收藏"}
        </Button>
        <Button onClick={finishLesson}>学完，去练习</Button>
      </div>
    </div>
  );
}
