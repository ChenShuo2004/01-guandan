"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CoachStatusCard } from "@/components/coach/CoachStatusCard";
import { TrainingCard } from "@/components/training/TrainingCard";
import { Button } from "@/components/ui/Button";
import { getTodayTraining } from "@/features/daily-training";
import { useProgress } from "@/features/progress/useProgress";

const actionItems = [
  {
    title: "训练",
    description: "每天一题，练判断",
    href: "/practice",
    tone: "blue"
  },
  {
    title: "AI 分析",
    description: "看懂输赢原因",
    href: "/coach",
    tone: "amber"
  },
  {
    title: "复盘",
    description: "把错题变成能力",
    href: "/profile",
    tone: "slate"
  }
];

export function DailyTrainingDashboard() {
  const { progress, isReady } = useProgress();

  const todayTraining = useMemo(() => {
    if (!isReady) {
      return undefined;
    }

    return getTodayTraining(progress);
  }, [isReady, progress]);

  const trainingHref = todayTraining?.lessonId
    ? `/lessons/${todayTraining.lessonId}`
    : "/practice";

  const nextLevelExperience = progress.level * 100;
  const levelProgress = Math.min(100, Math.round((progress.experience / nextLevelExperience) * 100));

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="relative mx-auto max-w-6xl"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="pointer-events-none absolute -left-20 top-4 h-64 w-64 rounded-full bg-blue-300/28 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-28 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative space-y-5">
        <header className="rounded-[28px] border border-white/70 bg-gradient-to-br from-sky-50/92 via-white/76 to-blue-100/78 p-5 text-slate-950 shadow-[0_30px_90px_rgba(37,99,235,0.16)] backdrop-blur-2xl lg:p-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <p className="text-xs font-black text-blue-600">AI 掼蛋训练空间</p>
              <h1 className="mt-2 max-w-2xl text-3xl font-black leading-10 lg:text-4xl lg:leading-[3.25rem]">
                准备好提升你的掼蛋水平了吗？
              </h1>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-600">
                Ace 会带你每天完成一次训练：看目标、学判断、打一手牌、拿到反馈。
              </p>
            </div>

            <CoachStatusCard
              action="wave"
              caption="今天不用学很多，先把一个关键判断练准。"
              message="我会陪你完成今日训练。"
            />
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          {todayTraining ? (
            <TrainingCard
              ability={todayTraining.ability}
              coachTip={todayTraining.coachTip}
              day={todayTraining.day}
              href={trainingHref}
              rewardExperience={todayTraining.rewardExperience}
              theme={todayTraining.theme}
              title={todayTraining.title}
            />
          ) : (
            <TrainingCard
              ability="bomb-timing"
              coachTip="先判断牌权，再决定要不要炸。"
              day={1}
              href="/practice"
              rewardExperience={20}
              theme="什么时候该炸"
              title="炸弹不是用来爽的"
            />
          )}

          <section className="rounded-[24px] border border-white/70 bg-white/62 p-4 text-slate-950 shadow-[0_24px_70px_rgba(37,99,235,0.12)] backdrop-blur-2xl">
            <p className="text-xs font-black text-blue-600">成长状态</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <StatPill label="等级" value={`Lv${progress.level}`} />
              <StatPill label="连续" value={`${progress.streakDays} 天`} />
              <StatPill label="XP" value={`${progress.experience}`} />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>距离下一等级</span>
                <span>{levelProgress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
                <motion.div
                  animate={{ width: `${levelProgress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-amber-300"
                  initial={{ width: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </div>
          </section>
        </div>

        <section className="grid gap-3 sm:grid-cols-3">
          {actionItems.map((item, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 14 }}
              key={item.title}
              transition={{ delay: 0.08 * index, duration: 0.36, ease: "easeOut" }}
            >
              <CoreActionCard {...item} />
            </motion.div>
          ))}
        </section>
      </div>
    </motion.div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 px-3 py-3 text-center">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-base font-black text-slate-950">{value}</p>
    </div>
  );
}

function CoreActionCard({
  description,
  href,
  title,
  tone
}: {
  description: string;
  href: string;
  title: string;
  tone: string;
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-200 bg-amber-50/72 text-amber-700"
      : tone === "blue"
        ? "border-blue-200 bg-blue-50/82 text-blue-700"
        : "border-slate-200 bg-white/68 text-slate-700";

  return (
    <div className="rounded-[22px] border border-white/70 bg-white/58 p-4 text-slate-950 shadow-[0_20px_60px_rgba(37,99,235,0.1)] backdrop-blur-2xl">
      <div className={`mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-black ${toneClass}`}>
        {title}
      </div>
      <p className="text-sm font-bold leading-6 text-slate-600">{description}</p>
      <Button className="mt-4 w-full" href={href} variant={tone === "blue" ? "primary" : "secondary"}>
        进入
      </Button>
    </div>
  );
}
