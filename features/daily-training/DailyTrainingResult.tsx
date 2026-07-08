"use client";

import { CoachBubble } from "@/components/coach/CoachBubble";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { Button } from "@/components/ui/Button";
import {
  getNextTrainingAfter,
  getTodayTraining,
  getTrainingById
} from "@/features/daily-training";
import { useProgress } from "@/features/progress/useProgress";

export function DailyTrainingResult() {
  const { progress, isReady } = useProgress();

  if (!isReady) {
    return (
      <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4 text-sm text-guandan-subtext">
        正在读取今日成果。
      </section>
    );
  }

  const completedTraining =
    getTrainingById(progress.recentLearning?.trainingId) ?? getTodayTraining(progress);
  const nextTraining = getNextTrainingAfter(completedTraining?.id);
  const nextLevelProgress = progress.experience % 100;

  if (!completedTraining) {
    return (
      <div className="space-y-4">
        <CoachBubble
          action="thinking"
          caption="还没有今日训练记录。"
          text="先完成一课一题。"
        />
        <Button href="/">回首页</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CoachBubble
        action="celebrate"
        caption={`今天你学会了：${completedTraining.theme}`}
        text="很好。下一局先看牌权。"
      />

      <section className="rounded-3xl border border-guandan-gold bg-guandan-gold/10 p-4 lg:p-6">
        <p className="text-sm font-bold text-guandan-gold">今日奖励</p>
        <h2 className="mt-2 text-3xl font-black leading-10">
          +{completedTraining.rewardExperience} XP
        </h2>
        <p className="mt-2 text-sm leading-6 text-guandan-subtext">
          已完成 Day {completedTraining.day}：{completedTraining.title}
        </p>
      </section>

      <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-guandan-gold">当前等级</p>
            <h2 className="mt-1 text-2xl font-black">
              Lv{progress.level} → Lv{progress.level + 1}进度
            </h2>
          </div>
          <span className="rounded-full bg-guandan-muted px-3 py-2 text-xs font-bold text-guandan-subtext">
            {progress.experience} XP
          </span>
        </div>
        <div className="mt-4">
          <ProgressBar label={`${nextLevelProgress}/100 XP`} max={100} value={nextLevelProgress} />
        </div>
      </section>

      <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4 lg:p-6">
        <p className="text-sm font-bold text-guandan-gold">明日训练</p>
        {nextTraining ? (
          <>
            <h2 className="mt-2 text-xl font-black">{nextTraining.theme}</h2>
            <p className="mt-2 text-sm leading-6 text-guandan-subtext">
              {nextTraining.coachTip}
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-2 text-xl font-black">7 天训练已完成</h2>
            <p className="mt-2 text-sm leading-6 text-guandan-subtext">
              下一步可以进入错题复盘和专题训练。
            </p>
          </>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Button href="/paths" variant="secondary">
          回路径
        </Button>
        <Button href="/">回首页</Button>
      </div>
    </div>
  );
}
