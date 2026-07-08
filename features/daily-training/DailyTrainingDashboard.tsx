"use client";

import { CoachBubble } from "@/components/coach/CoachBubble";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getPracticeById } from "@/content/cases/sample-practice";
import { getLessonById } from "@/content/lessons/sample-lessons";
import {
  getDailyTrainingPlan,
  getTodayTraining
} from "@/features/daily-training";
import { useProgress } from "@/features/progress/useProgress";

function getLevelTitle(level: number) {
  if (level >= 30) {
    return "控牌高手";
  }

  if (level >= 20) {
    return "残局熟手";
  }

  if (level >= 10) {
    return "配合玩家";
  }

  if (level >= 5) {
    return "牌权入门";
  }

  return "掼蛋成长者";
}

export function DailyTrainingDashboard() {
  const { progress, isReady } = useProgress();

  if (!isReady) {
    return (
      <Card>
        正在读取今日训练。
      </Card>
    );
  }

  const todayTraining = getTodayTraining(progress);
  const trainingPlan = getDailyTrainingPlan(progress);
  const completedCount = trainingPlan.filter((training) => training.status === "completed").length;
  const nextLevelProgress = progress.experience % 100;
  const nextLevelTarget = 100;
  const hasTodayLesson = Boolean(getLessonById(todayTraining?.lessonId ?? ""));
  const todayPractice = getPracticeById(todayTraining?.practiceId ?? "");
  const hasWrongPractice = progress.wrongPracticeIds.length > 0;

  if (!todayTraining) {
    return (
      <Card>
        <p className="text-sm font-bold text-guandan-gold">今日训练</p>
        <h2 className="mt-2 text-xl font-black">训练计划还没准备好</h2>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <header className="rounded-arena border border-guandan-border bg-guandan-card/80 p-4 shadow-panel backdrop-blur lg:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-guandan-gold">AI 掼蛋训练 App</p>
            <h1 className="mt-1 text-2xl font-black leading-8">
              Lv{progress.level} {getLevelTitle(progress.level)}
            </h1>
          </div>
          <Badge variant={progress.streakDays > 0 ? "reward" : "tech"}>
            连续 {progress.streakDays} 天
          </Badge>
        </div>
        <div className="mt-4">
          <ProgressBar
            label={`${nextLevelProgress} / ${nextLevelTarget} XP`}
            max={nextLevelTarget}
            value={nextLevelProgress}
          />
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)] lg:items-start lg:gap-6">
        <div className="space-y-4">
        <CoachBubble
          action={todayTraining.isCompletedToday ? "celebrate" : "wave"}
          caption={todayTraining.coachTip}
          text={
            todayTraining.isCompletedToday
              ? "很好。今天已经完成。"
              : `今天只练一个判断：${todayTraining.theme}。`
          }
        />

        <Card variant="training">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge variant="energy">Day {todayTraining.day} / 7</Badge>
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

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>预计 3 分钟</Badge>
            <Badge variant={todayTraining.isCompletedToday ? "success" : "tech"}>
              {todayTraining.isCompletedToday ? "今日已完成" : "待训练"}
            </Badge>
          </div>

          <div className="mt-5">
            {hasTodayLesson ? (
              <Button className="w-full" href={`/lessons/${todayTraining.lessonId}`}>
                开始今日训练
              </Button>
            ) : (
              <Button className="w-full" disabled>
                课程准备中
              </Button>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-guandan-blue">第二任务</p>
              <h2 className="mt-1 text-lg font-black">残局挑战</h2>
            </div>
            <Badge variant="reward">+{todayPractice?.experience ?? todayTraining.rewardExperience} XP</Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-guandan-subtext">
            {todayPractice?.situation ?? "学完今日判断后，马上进入一局实战残局。"}
          </p>
          <div className="mt-4 rounded-panel border border-guandan-border bg-guandan-muted p-3">
            <p className="text-sm font-bold text-guandan-text">
              {todayPractice?.title ?? "今日残局准备中"}
            </p>
            <p className="mt-1 text-xs font-semibold text-guandan-mutedText">
              完成知识判断后自动进入，不需要自己找题。
            </p>
          </div>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-8">
        <Card>
          <p className="text-sm font-bold text-guandan-gold">7 天成长</p>
          <h2 className="mt-1 text-2xl font-black">{completedCount}/7</h2>
          <div className="mt-4">
            <ProgressBar label="训练进度" max={7} tone="success" value={completedCount} />
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
        </Card>

        <Card>
          <p className="text-sm font-bold text-guandan-gold">XP 成长</p>
          <h2 className="mt-1 text-2xl font-black">{progress.experience} XP</h2>
          <div className="mt-4">
            <ProgressBar
              label={`距离下一级 ${nextLevelTarget - nextLevelProgress} XP`}
              max={nextLevelTarget}
              value={nextLevelProgress}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="tech">课程 {progress.completedLessonIds.length}</Badge>
            <Badge variant="tech">练习 {progress.completedPracticeIds.length}</Badge>
            <Badge variant="energy">收藏 {progress.favoriteLessonIds.length}</Badge>
          </div>
        </Card>

        {hasWrongPractice ? (
          <Card variant="danger">
            <p className="text-sm font-bold text-guandan-danger">错题提醒</p>
            <h2 className="mt-2 text-lg font-black">
              昨天有 {progress.wrongPracticeIds.length} 道题值得复习
            </h2>
            <p className="mt-2 text-sm leading-6 text-guandan-subtext">
              先完成今日训练，再回来看这类判断。
            </p>
          </Card>
        ) : null}
      </aside>
      </div>
    </div>
  );
}
