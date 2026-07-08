"use client";

import { ProgressBar } from "@/components/progress/ProgressBar";
import { useProgress } from "./useProgress";

export function ProfileSummary() {
  const { progress, isReady } = useProgress();
  const nextLevelProgress = progress.experience % 100;

  if (!isReady) {
    return (
      <div className="rounded-3xl border border-guandan-border bg-guandan-card p-4 text-sm text-guandan-subtext">
        正在读取本地进度。
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4">
      <p className="text-sm font-bold text-guandan-gold">Lv{progress.level}</p>
      <h2 className="mt-1 text-2xl font-black">今日进度</h2>
      <div className="mt-4">
        <ProgressBar label={`${progress.experience} XP`} max={100} value={nextLevelProgress} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-guandan-muted p-3">
          <p className="text-lg font-black">{progress.completedLessonIds.length}</p>
          <p className="text-xs text-guandan-subtext">课程</p>
        </div>
        <div className="rounded-2xl bg-guandan-muted p-3">
          <p className="text-lg font-black">{progress.completedPracticeIds.length}</p>
          <p className="text-xs text-guandan-subtext">练习</p>
        </div>
        <div className="rounded-2xl bg-guandan-muted p-3">
          <p className="text-lg font-black">{progress.favoriteLessonIds.length}</p>
          <p className="text-xs text-guandan-subtext">收藏</p>
        </div>
      </div>
    </section>
  );
}
