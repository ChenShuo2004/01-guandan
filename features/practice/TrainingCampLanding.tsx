"use client";

import Image from "next/image";
import Link from "next/link";
import { samplePracticeCases } from "@/content/cases/sample-practice";

const trainingLevels = [
  {
    id: "beginner",
    title: "基础判断",
    description: "先把牌型、牌权和出牌顺序练稳。",
    image: "/assets/training-camp/beginner-cover.png",
    href: "/training?level=beginner",
    badge: "Beginner",
    accent: "from-[#54d7ff] via-[#1b7dff] to-[#0058be]"
  },
  {
    id: "intermediate",
    title: "牌局决策",
    description: "练习配合、压制、让牌和节奏控制。",
    image: "/assets/training-camp/intermediate-cover.png",
    href: "/training?level=intermediate",
    badge: "Intermediate",
    accent: "from-[#8cf3ff] via-[#238bff] to-[#0047a8]"
  },
  {
    id: "advanced",
    title: "复盘训练",
    description: "针对残局、炸弹时机和风险判断做专项训练。",
    image: "/assets/training-camp/advanced-cover.png",
    href: "/training?level=advanced",
    badge: "Advanced",
    accent: "from-[#f6c65b] via-[#4b7dff] to-[#142f7a]"
  }
];

const taskCards = [
  {
    title: "AI 实战牌桌",
    description: "进入完整四人牌局，边出牌边接受 AI Coach 提示。",
    href: "/training",
    icon: "casino",
    primary: true
  },
  {
    title: "残局判断",
    description: "用一道题完成判断、反馈和复盘。",
    href: `/practice/${samplePracticeCases[0]?.id ?? "practice-when-to-bomb-001"}`,
    icon: "psychology",
    primary: false
  }
];

export default function TrainingCampLanding() {
  const reviewPractice = samplePracticeCases[samplePracticeCases.length - 1];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b16] px-4 py-5 text-white sm:px-6 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_0%,rgba(84,215,255,0.18),transparent_32%),radial-gradient(circle_at_82%_38%,rgba(246,198,91,0.14),transparent_30%),linear-gradient(180deg,#071426_0%,#050b16_48%,#07111f_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(119,215,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(119,215,255,0.045)_1px,transparent_1px)] bg-[size:56px_56px] opacity-70 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/10 to-transparent" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-7xl flex-col gap-6">
        <header className="grid gap-6 pt-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end lg:pt-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#54d7ff]/30 bg-[#54d7ff]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#9fe8ff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f6c65b] shadow-[0_0_18px_rgba(246,198,91,0.82)]" />
              Ace Training Camp
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
              AI 掼蛋训练营
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-[#c6d8ec] sm:text-lg">
              这里不是棋牌大厅。你只需要选择训练难度，进入牌桌，完成判断，然后听 Ace 复盘这一手为什么该这么打。
            </p>
          </div>

          <section className="rounded-[24px] border border-white/12 bg-white/[0.07] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#54d7ff]/20 bg-[#071a31]">
                <Image
                  alt="Ace AI Coach"
                  className="object-cover"
                  fill
                  sizes="80px"
                  src="/assets/coach/coach-bubble-hologram.png"
                />
              </div>
              <div>
                <p className="text-sm font-black text-[#f6c65b]">Ace Coach</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#d8e9ff]">
                  今天目标：先练关键回合判断，不追求赢一整局，先把一手牌打明白。
                </p>
              </div>
            </div>
          </section>
        </header>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-white/12 bg-white/[0.07] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9fe8ff]">
                  Start Here
                </p>
                <h2 className="mt-1 text-2xl font-black">开始训练</h2>
              </div>
              <span className="rounded-full bg-[#f6c65b] px-3 py-1.5 text-xs font-black text-[#171101]">
                今日任务
              </span>
            </div>

            <div className="grid gap-3">
              {taskCards.map((task) => (
                <Link
                  className={[
                    "group flex items-center justify-between gap-4 rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5",
                    task.primary
                      ? "border-[#f6c65b]/45 bg-[#f6c65b] text-[#171101] shadow-[0_18px_48px_rgba(246,198,91,0.16)]"
                      : "border-white/12 bg-white/[0.06] text-white hover:border-[#54d7ff]/45"
                  ].join(" ")}
                  href={task.href}
                  key={task.title}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={[
                        "grid h-11 w-11 place-items-center rounded-xl",
                        task.primary ? "bg-[#171101]/10" : "bg-[#54d7ff]/12 text-[#9fe8ff]"
                      ].join(" ")}
                    >
                      <span className="material-symbols-outlined text-[22px]">{task.icon}</span>
                    </span>
                    <span>
                      <span className="block text-base font-black">{task.title}</span>
                      <span
                        className={[
                          "mt-1 block text-sm font-semibold leading-5",
                          task.primary ? "text-[#3d2a00]" : "text-[#b8cbe0]"
                        ].join(" ")}
                      >
                        {task.description}
                      </span>
                    </span>
                  </span>
                  <span className="material-symbols-outlined text-[22px] transition group-hover:translate-x-0.5">
                    arrow_forward
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <section className="grid gap-4 sm:grid-cols-3">
            {trainingLevels.map((level) => (
              <Link
                className="group relative min-h-[21rem] overflow-hidden rounded-[26px] border border-white/14 bg-white/[0.07] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition duration-300 hover:-translate-y-2 hover:border-[#77d7ff]/65 hover:bg-white/[0.11]"
                href={level.href}
                key={level.id}
              >
                <div className={`absolute inset-x-8 -top-1 h-1 rounded-full bg-gradient-to-r ${level.accent} opacity-70 blur-sm transition group-hover:opacity-100`} />
                <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#071a31]">
                  <Image
                    alt={`${level.title} 训练封面`}
                    className="object-cover transition duration-500 group-hover:scale-105"
                    fill
                    priority={level.id === "beginner"}
                    sizes="(min-width: 1024px) 23vw, (min-width: 640px) 30vw, 92vw"
                    src={level.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06111f] via-[#06111f]/18 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#bfefff] backdrop-blur-md">
                    {level.badge}
                  </span>
                </div>

                <div className="px-2 pb-2 pt-4">
                  <h2 className="text-2xl font-black leading-8 text-white">{level.title}</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#b8cbe0]">
                    {level.description}
                  </p>
                  <div className="mt-4 flex h-11 items-center justify-between rounded-2xl border border-[#77d7ff]/24 bg-[#0f64ff]/18 px-4 text-sm font-black text-white">
                    <span>进入牌桌</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        </section>

        {reviewPractice ? (
          <section className="mb-8 rounded-[24px] border border-white/12 bg-white/[0.06] p-4 backdrop-blur-2xl sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f6c65b]">
                  Replay
                </p>
                <h2 className="mt-1 text-xl font-black">复盘专项：{reviewPractice.title}</h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#b8cbe0]">
                  用一题完成：学习、判断、反馈、成长。
                </p>
              </div>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#54d7ff]/30 bg-[#54d7ff]/12 px-5 text-sm font-black text-[#bfefff] transition hover:border-[#54d7ff]/70"
                href={`/practice/${reviewPractice.id}`}
              >
                开始复盘
              </Link>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
