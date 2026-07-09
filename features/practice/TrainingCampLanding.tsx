"use client";

import Image from "next/image";
import Link from "next/link";

const trainingLevels = [
  {
    id: "beginner",
    title: "初级训练营",
    lines: ["掌握基础规则", "学习出牌逻辑"],
    image: "/assets/training-camp/beginner-cover.png",
    href: "/training?level=beginner",
    badge: "Beginner",
    tilt: "lg:-rotate-2",
    accent: "from-[#6ed7ff] via-[#1b7dff] to-[#0058be]"
  },
  {
    id: "intermediate",
    title: "中级训练营",
    lines: ["训练牌局判断", "提升配合能力"],
    image: "/assets/training-camp/intermediate-cover.png",
    href: "/training?level=intermediate",
    badge: "Intermediate",
    tilt: "lg:rotate-1",
    accent: "from-[#8cf3ff] via-[#238bff] to-[#0047a8]"
  },
  {
    id: "advanced",
    title: "高级训练营",
    lines: ["残局分析", "记牌与策略训练"],
    image: "/assets/training-camp/advanced-cover.png",
    href: "/training?level=advanced",
    badge: "Advanced",
    tilt: "lg:rotate-2",
    accent: "from-[#b5e7ff] via-[#4b7dff] to-[#142f7a]"
  }
];

export default function TrainingCampLanding() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06111f] px-4 py-5 text-white sm:px-6 lg:px-10">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(0,88,190,0.26),transparent_34%),linear-gradient(180deg,#08172b_0%,#06111f_46%,#091a31_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(119,215,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(119,215,255,0.05)_1px,transparent_1px)] bg-[size:52px_52px]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-7xl flex-col">
        <Link
          aria-label="返回首页"
          className="group absolute left-0 top-0 inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-black text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:border-[#77d7ff]/60 hover:bg-[#0f64ff]/30 hover:shadow-[0_0_30px_rgba(119,215,255,0.22)]"
          href="/"
        >
          <span className="material-symbols-outlined text-[20px] transition group-hover:-translate-x-0.5">
            arrow_back
          </span>
          首页
        </Link>

        <header className="mx-auto flex max-w-3xl flex-col items-center pb-7 pt-16 text-center sm:pt-20 md:pb-9 lg:pt-14 [@media(orientation:landscape)_and_(max-height:520px)]:pb-4 [@media(orientation:landscape)_and_(max-height:520px)]:pt-14">
          <span className="rounded-full border border-[#77d7ff]/30 bg-[#77d7ff]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#9fe8ff]">
            Ace Training Camp
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl md:text-6xl [@media(orientation:landscape)_and_(max-height:520px)]:mt-3 [@media(orientation:landscape)_and_(max-height:520px)]:text-4xl">
            选择你对应等级的训练场
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-[#c6d8ec] sm:text-lg [@media(orientation:landscape)_and_(max-height:520px)]:mt-2 [@media(orientation:landscape)_and_(max-height:520px)]:text-sm [@media(orientation:landscape)_and_(max-height:520px)]:leading-6">
            根据你的掼蛋水平，选择适合你的训练阶段
            <br className="hidden sm:block" />
            Ace 会为你匹配对应难度的训练内容
          </p>
        </header>

        <section
          aria-label="训练营等级选择"
          className="flex flex-nowrap items-stretch gap-4 overflow-x-auto overflow-y-visible px-3 pb-8 pt-2 [scrollbar-width:none] sm:gap-5 md:justify-center md:gap-6 lg:pb-12 [@media(orientation:landscape)_and_(max-height:520px)]:pb-5 [&::-webkit-scrollbar]:hidden"
        >
          {trainingLevels.map((level) => (
            <Link
              className={`group relative min-w-[235px] max-w-[315px] flex-1 rounded-[26px] border border-white/16 bg-white/[0.08] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition duration-300 hover:-translate-y-3 hover:border-[#77d7ff]/65 hover:bg-white/[0.12] hover:shadow-[0_28px_90px_rgba(15,100,255,0.30),0_0_42px_rgba(119,215,255,0.22)] focus:outline-none focus-visible:-translate-y-3 focus-visible:border-[#77d7ff] focus-visible:ring-2 focus-visible:ring-[#77d7ff]/70 sm:min-w-[270px] lg:min-w-0 [@media(orientation:landscape)_and_(max-height:520px)]:min-w-[230px] ${level.tilt}`}
              href={level.href}
              key={level.id}
            >
              <div className={`absolute inset-x-8 -top-1 h-1 rounded-full bg-gradient-to-r ${level.accent} opacity-0 blur-sm transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100`} />

              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#071a31]">
                <Image
                  alt={`${level.title} AI 角色`}
                  className="object-cover transition duration-500 group-hover:scale-105 group-focus-visible:scale-105"
                  fill
                  priority={level.id === "beginner"}
                  sizes="(min-width: 1024px) 29vw, (min-width: 768px) 31vw, 245px"
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
                  {level.lines[0]}
                  <br />
                  {level.lines[1]}
                </p>

                <div className="mt-4 flex h-11 translate-y-2 items-center justify-between rounded-2xl border border-[#77d7ff]/24 bg-[#0f64ff]/18 px-4 text-sm font-black text-white opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  <span>进入训练</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
