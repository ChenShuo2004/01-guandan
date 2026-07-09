"use client";

import Image from "next/image";
import Link from "next/link";
import CircularGallery from "@/components/effects/CircularGallery";

const trainingLevels = [
  {
    id: "beginner",
    title: "初级",
    subtitle: "先把规则和基础牌感打稳",
    description: "适合刚开始训练的玩家。重点练牌型识别、出牌顺序、主攻助攻基本判断。",
    image: "/assets/training-camp/beginner-cover.png",
    href: "/training?level=beginner",
    badge: "Beginner",
    accent: "from-[#eaf3ff] to-white"
  },
  {
    id: "intermediate",
    title: "中级",
    subtitle: "训练关键决策和队友配合",
    description: "适合已有基础的玩家。重点练炸弹时机、牌权转换、队友信号和局面判断。",
    image: "/assets/training-camp/intermediate-cover.png",
    href: "/training?level=intermediate",
    badge: "Intermediate",
    accent: "from-[#eef8ff] to-[#fff8ed]"
  },
  {
    id: "advanced",
    title: "高级",
    subtitle: "进入残局、记牌和全局博弈",
    description: "适合想冲高阶的玩家。重点练残局路线、记牌推理、控局节奏和风险管理。",
    image: "/assets/training-camp/advanced-cover.png",
    href: "/training?level=advanced",
    badge: "Advanced",
    accent: "from-[#e8f0ff] to-[#f7fbff]"
  }
];

const galleryItems = trainingLevels.map((level) => ({
  image: level.image,
  text: `${level.title}训练营`
}));

export default function TrainingCampLanding() {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f9f9ff_0%,#eef4ff_100%)] px-4 py-6 text-[#111c2d] md:px-8 lg:px-12">
      <section className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="rounded-[28px] border border-white/70 bg-white/72 p-6 shadow-[0_18px_60px_rgba(0,88,190,0.08)] backdrop-blur-xl md:p-8">
            <span className="inline-flex rounded-full bg-[#e7eeff] px-3 py-1.5 text-xs font-black text-[#0058be]">
              Training Camp
            </span>
            <h1 className="mt-4 text-4xl font-black leading-tight text-[#07172f] md:text-6xl">
              先选等级，
              <br />
              再进训练场。
            </h1>
            <p className="mt-5 max-w-xl text-sm font-semibold leading-7 text-[#52657a] md:text-base">
              训练营按初级、中级、高级分层。Ace 会根据你的阶段给出不同强度的牌局训练，你选择后再进入实战训练场。
            </p>
          </div>

          <div className="relative h-[320px] overflow-hidden rounded-[32px] border border-white/65 bg-[#06142b] shadow-[0_24px_80px_rgba(0,88,190,0.20)] md:h-[420px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.26),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.08))]" />
            <CircularGallery
              bend={2.6}
              borderRadius={0.08}
              font="bold 30px Geist"
              items={galleryItems}
              scrollEase={0.035}
              scrollSpeed={1.6}
              textColor="#ffffff"
            />
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          {trainingLevels.map((level) => (
            <Link
              className="group overflow-hidden rounded-[30px] border border-white/75 bg-white p-4 shadow-[0_18px_60px_rgba(0,88,190,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(0,88,190,0.14)]"
              href={level.href}
              key={level.id}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#eef2ff]">
                <Image
                  alt={`${level.title}训练营封面`}
                  className="object-cover transition duration-700 group-hover:scale-105"
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 32vw, 92vw"
                  src={level.image}
                />
                <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t ${level.accent} p-4 pt-14 opacity-95`}>
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#0058be]">
                    {level.badge}
                  </span>
                </div>
              </div>

              <div className="px-2 pb-2 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-[#07172f]">{level.title}</h2>
                    <p className="mt-1 text-sm font-bold text-[#0058be]">{level.subtitle}</p>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#0058be] text-white shadow-[0_12px_26px_rgba(0,88,190,0.24)]">
                    <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
                  </span>
                </div>
                <p className="mt-4 min-h-[56px] text-sm font-semibold leading-7 text-[#52657a]">
                  {level.description}
                </p>
                <span className="mt-5 flex min-h-12 items-center justify-center rounded-2xl bg-[#0058be] text-sm font-black text-white transition group-hover:bg-[#2170e4]">
                  进入{level.title}训练场
                </span>
              </div>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
