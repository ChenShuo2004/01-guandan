"use client";

import { CoachBubble } from "@/components/coach/CoachBubble";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { Button } from "@/components/ui/Button";
import {
  getDailyTrainingPlan,
  getNextRecommendation,
  getTodayTraining
} from "@/features/daily-training";
import { useProgress } from "@/features/progress/useProgress";

export function DailyTrainingDashboard() {
  const { progress, isReady } = useProgress();

  if (!isReady) {
    return (
      <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4 text-sm text-guandan-subtext">
        正在读取今日训练。
      </section>
    );
  }

  const todayTraining = getTodayTraining(progress);
  const recommendation = getNextRecommendation(progress);
  const trainingPlan = getDailyTrainingPlan(progress);
  const completedCount = trainingPlan.filter((training) => training.status === "completed").length;
  const nextLevelProgress = progress.experience % 100;

  if (!todayTraining) {
    return (
      <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4">
        <p className="text-sm font-bold text-guandan-gold">今日训练</p>
        <h2 className="mt-2 text-xl font-black">训练计划还没准备好</h2>
      </section>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)] lg:items-start lg:gap-6">
      <div className="space-y-4">
        <CoachBubble
          action={todayTraining.isCompletedToday ? "celebrate" : "wave"}
          caption={recommendation.description}
          text={
            todayTraining.isCompletedToday
              ? "很好。今天已经完成。"
              : `别急。今天只练：${todayTraining.theme}。`
          }
        />

        <section className="rounded-3xl border border-guandan-gold bg-guandan-gold/10 p-4 lg:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-guandan-gold">
                Day {todayTraining.day} / 7
              </p>
              <h2 className="mt-2 text-2xl font-black leading-8 lg:text-3xl lg:leading-10">
                {todayTraining.theme}
              </h2>
              <p className="mt-2 text-base font-bold leading-7 text-guandan-text">
                {todayTraining.title}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-guandan-background/60 px-3 py-2 text-xs font-bold text-guandan-gold">
              +{todayTraining.rewardExperience} XP
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-guandan-subtext">
            {todayTraining.coachTip}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button href={`/lessons/${todayTraining.lessonId}`}>
              开始今日训练
            </Button>
            <Button href={`/practice/${todayTraining.practiceId}`} variant="secondary">
              直接做残局
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-guandan-gold">一课一题闭环</p>
              <h2 className="mt-1 text-lg font-black">学完马上练</h2>
            </div>
            <span className="rounded-full bg-guandan-muted px-3 py-2 text-xs font-bold text-guandan-subtext">
              {todayTraining.isCompletedToday ? "已完成" : "待完成"}
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl bg-guandan-muted p-3">
              <p className="text-xs font-bold text-guandan-gold">Lesson</p>
              <p className="mt-1 text-sm font-bold">{todayTraining.lessonId}</p>
            </div>
            <div className="rounded-2xl bg-guandan-muted p-3">
              <p className="text-xs font-bold text-guandan-gold">Practice</p>
              <p className="mt-1 text-sm font-bold">{todayTraining.practiceId}</p>
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-8">
        <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4">
          <p className="text-sm font-bold text-guandan-gold">下一步推荐</p>
          <h2 className="mt-2 text-lg font-black">{recommendation.title}</h2>
          <p className="mt-2 text-sm leading-6 text-guandan-subtext">
            {recommendation.description}
          </p>
          {recommendation.lessonId ? (
            <Button className="mt-4 w-full" href={`/lessons/${recommendation.lessonId}`}>
              去学习
            </Button>
          ) : recommendation.practiceId ? (
            <Button className="mt-4 w-full" href={`/practice/${recommendation.practiceId}`}>
              去复盘
            </Button>
          ) : null}
        </section>

        <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4">
          <p className="text-sm font-bold text-guandan-gold">7 天成长</p>
          <h2 className="mt-1 text-2xl font-black">{completedCount}/7</h2>
          <div className="mt-4">
            <ProgressBar label="训练进度" max={7} value={completedCount} />
          </div>
          <div className="mt-4 grid gap-2">
            {trainingPlan.map((training) => (
              <div
                className="flex items-center justify-between rounded-2xl bg-guandan-muted px-3 py-2 text-sm"
                key={training.id}
              >
                <span className={training.isToday ? "font-bold text-guandan-gold" : "font-bold"}>
                  Day {training.day}
                </span>
                <span className="text-guandan-subtext">{training.theme}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4">
          <p className="text-sm font-bold text-guandan-gold">我的状态</p>
          <h2 className="mt-1 text-2xl font-black">Lv{progress.level}</h2>
          <div className="mt-4">
            <ProgressBar label={`${progress.experience} XP`} max={100} value={nextLevelProgress} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-guandan-muted p-3">
              <p className="text-lg font-black">{progress.streakDays}</p>
              <p className="text-xs text-guandan-subtext">连续</p>
            </div>
            <div className="rounded-2xl bg-guandan-muted p-3">
              <p className="text-lg font-black">{progress.wrongPracticeIds.length}</p>
              <p className="text-xs text-guandan-subtext">错题</p>
            </div>
            <div className="rounded-2xl bg-guandan-muted p-3">
              <p className="text-lg font-black">{progress.favoriteLessonIds.length}</p>
              <p className="text-xs text-guandan-subtext">收藏</p>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
