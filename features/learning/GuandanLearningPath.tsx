"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getCategoryCourses,
  guandanLearningPath,
  type GuandanCategory,
  type GuandanCourse
} from "@/lib/guandan/catalog";

const topNavItems = ["Arena", "Diagnostic", "Training", "Skill Tree"];

const sideNavItems = [
  { href: "/", icon: "dashboard", label: "Home" },
  { href: "/training", icon: "sports_esports", label: "Arena" },
  { href: "/assessment/start", icon: "analytics", label: "Diagnostics" },
  { href: "/learning-path", icon: "school", label: "Training" }
];

const stageIcons = ["star", "trending_up", "psychology", "workspace_premium"];

const mobileNavItems = [
  { href: "/", icon: "dashboard", label: "Home" },
  { href: "/learning-path", icon: "school", label: "Learn" },
  { href: "/profile", icon: "person", label: "Profile" }
];

export function GuandanLearningPath() {
  const [activeCategoryId, setActiveCategoryId] = useState(
    guandanLearningPath.categories[0]?.id ?? "basic"
  );
  const activeCategory =
    guandanLearningPath.categories.find((category) => category.id === activeCategoryId) ??
    guandanLearningPath.categories[0];
  const courses = useMemo(() => getCategoryCourses(activeCategory), [activeCategory]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f9f9ff] text-[#111c2d]">
      <AcademyTopNav />
      <AcademySideNav />

      <main className="min-h-screen px-4 pb-28 pt-16 md:ml-64 md:px-12 md:pb-16">
        <HeroSection />
        <ProgressStages activeCategory={activeCategory} />
        <CategoryChapters
          activeCategoryId={activeCategory.id}
          categories={guandanLearningPath.categories}
          onChange={setActiveCategoryId}
        />
        <CourseGrid courses={courses} />
      </main>

      <CoachBubble />
      <MobileBottomNav />
    </div>
  );
}

function AcademyTopNav() {
  return (
    <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between bg-[#2f7fd7] px-6 text-white shadow-md backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-10">
        <Link className="shrink-0 text-xl font-black" href="/learning-path">
          Guandan Academy
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {topNavItems.map((item) => (
            <Link
              className={[
                "border-b-2 pb-1 text-sm font-black transition",
                item === "Training"
                  ? "border-white text-white"
                  : "border-transparent text-white/72 hover:text-white"
              ].join(" ")}
              href={item === "Training" ? "/learning-path" : "#"}
              key={item}
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>

      <div className="hidden items-center gap-5 md:flex">
        <div className="flex h-9 w-64 items-center justify-between rounded-2xl bg-white/14 px-4 text-sm font-bold text-white/92">
          <span>Search strategies...</span>
          <span className="material-symbols-outlined text-[22px] text-white/72">search</span>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/12" type="button">
          <span className="material-symbols-outlined text-[23px]">notifications</span>
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/12" type="button">
          <span className="material-symbols-outlined text-[23px]">settings</span>
        </button>
        <Link
          className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white/30 bg-[#d4e3ff]"
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

function AcademySideNav() {
  return (
    <aside className="fixed bottom-0 left-0 top-16 z-40 hidden w-64 flex-col border-r border-[#c2c6d6]/35 bg-[#eef4ff]/82 p-6 backdrop-blur-xl md:flex">
      <div className="flex items-center gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0058be] text-white">
          <span className="material-symbols-outlined text-[24px]">school</span>
        </div>
        <div>
          <p className="text-xl font-black leading-6 text-[#0058be]">Coach Ace</p>
          <p className="text-sm font-semibold text-[#424754]">Pro Rank 4</p>
        </div>
      </div>

      <nav className="mt-12 grid gap-4">
        {sideNavItems.map((item) => {
          const active = item.label === "Training";
          return (
            <Link
              className={[
                "flex h-12 items-center gap-4 rounded-lg px-4 text-sm font-black transition",
                active
                  ? "bg-[#0058be] text-white shadow-[0_8px_20px_rgba(0,88,190,0.24)]"
                  : "text-[#424754] hover:bg-[#d8e3fb]"
              ].join(" ")}
              href={item.href}
              key={item.label}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#c2c6d6]/45 pt-6">
        <Link
          className="flex h-12 items-center justify-center rounded-lg bg-[#2170e4] text-xl font-black text-white shadow-[0_10px_24px_rgba(33,112,228,0.25)]"
          href="/training"
        >
          Quick Start
        </Link>
        <div className="mt-5 grid gap-4">
          <Link className="flex items-center gap-4 text-sm font-bold text-[#424754]" href="/coach">
            <span className="material-symbols-outlined text-[22px]">help</span>
            Help
          </Link>
          <Link className="flex items-center gap-4 text-sm font-bold text-[#424754]" href="/profile">
            <span className="material-symbols-outlined text-[22px]">logout</span>
            Logout
          </Link>
        </div>
      </div>
    </aside>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-[360px] items-center justify-between overflow-hidden py-12 lg:py-16">
      <div className="relative z-10 max-w-4xl">
        <h1 className="text-[72px] font-black leading-[0.98] text-[#111827] md:text-[88px]">
          AI掼蛋
          <br />
          成长路线
        </h1>
        <p className="mt-8 max-w-2xl text-lg font-semibold leading-8 text-[#424754]">
          从新手到高手，AI陪你建立真正的牌局判断力。每一个阶段都拆解成可训练的知识节点，进入课程后直接学习一张 AI 知识卡。
        </p>
      </div>
      <div className="relative hidden h-64 flex-1 lg:block" aria-hidden="true">
        <div className="absolute right-10 top-12 grid w-72 gap-3 rounded-2xl border border-[#d8e3fb] bg-white/55 p-4 shadow-[0_18px_50px_rgba(0,88,190,0.08)] backdrop-blur-md">
          <div className="h-3 w-28 rounded bg-[#0058be]" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-20 rounded-xl border border-[#d8e3fb] bg-white" />
            <div className="h-20 rounded-xl border border-[#d8e3fb] bg-[#e7eeff]" />
            <div className="h-20 rounded-xl border border-[#d8e3fb] bg-white" />
          </div>
          <div className="h-2 w-44 rounded bg-[#c2c6d6]" />
          <div className="h-2 w-32 rounded bg-[#d8e3fb]" />
        </div>
      </div>
    </section>
  );
}

function ProgressStages({ activeCategory }: { activeCategory: GuandanCategory }) {
  const activeIndex = Math.max(
    0,
    guandanLearningPath.categories.findIndex((category) => category.id === activeCategory.id)
  );

  return (
    <section className="mb-16">
      <h2 className="mb-6 text-2xl font-black text-[#111c2d]">你的成长阶段</h2>
      <div className="grid gap-4 rounded-xl border border-white/70 bg-white/72 p-5 shadow-[0_14px_34px_rgba(59,130,246,0.10)] backdrop-blur-xl lg:grid-cols-4">
        {guandanLearningPath.categories.map((category, index) => {
          const active = index === activeIndex;
          const passed = index < activeIndex;
          return (
            <button
              className="relative flex min-h-16 items-center gap-4 text-left"
              key={category.id}
              type="button"
            >
              <span
                className={[
                  "grid h-12 w-12 shrink-0 place-items-center rounded-xl text-[22px] shadow-sm",
                  active
                    ? "bg-[#0058be] text-white shadow-[0_0_20px_rgba(0,88,190,0.42)] ring-4 ring-[#0058be]/15"
                    : passed
                      ? "bg-[#d8e3fb] text-[#0058be]"
                      : "bg-[#d8e3fb] text-[#727785]"
                ].join(" ")}
              >
                <span className="material-symbols-outlined">{stageIcons[index] ?? "school"}</span>
              </span>
              <span>
                <span
                  className={[
                    "block text-xl font-black",
                    active ? "text-[#0058be]" : "text-[#727785]"
                  ].join(" ")}
                >
                  {getStageLabel(category.id)}
                </span>
                {active ? (
                  <span className="mt-1 block text-xs font-bold text-[#424754]">当前进度 45%</span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CategoryChapters({
  activeCategoryId,
  categories,
  onChange
}: {
  activeCategoryId: string;
  categories: GuandanCategory[];
  onChange: (categoryId: string) => void;
}) {
  return (
    <section className="mb-16 grid gap-6 md:grid-cols-4">
      {categories.map((category, index) => {
        const active = category.id === activeCategoryId;
        return (
          <button
            className={[
              "group flex h-48 flex-col justify-between rounded-xl border bg-white/64 p-10 text-left backdrop-blur-xl transition",
              active
                ? "border-[#0058be] shadow-[0_12px_30px_rgba(0,88,190,0.08)]"
                : "border-white/50 opacity-60 hover:opacity-100"
            ].join(" ")}
            key={category.id}
            onClick={() => onChange(category.id)}
            type="button"
          >
            <span className="text-6xl font-black leading-none text-[#111c2d]/8">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>
              <span className="block text-xl font-black text-[#111c2d]">{category.name}</span>
              <span className="mt-1 block text-sm font-semibold text-[#727785]">
                {getChapterSubtitle(category.id)}
              </span>
            </span>
            {active ? (
              <span className="h-1.5 overflow-hidden rounded-full bg-[#0058be]/18">
                <span className="block h-full w-3/4 bg-[#0058be]" />
              </span>
            ) : null}
          </button>
        );
      })}
    </section>
  );
}

function CourseGrid({ courses }: { courses: GuandanCourse[] }) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {courses.slice(0, 12).map((course, index) => (
        <article
          className="group flex min-h-[390px] flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"
          key={course.id}
        >
          <CoursePreview index={index} course={course} />
          <div className="mb-3 flex items-start justify-between gap-3">
            <span className="rounded-xl bg-[#0058be]/10 px-3 py-1 text-[10px] font-black text-[#0058be]">
              {getCourseTag(course, index)}
            </span>
            <span className="text-xs font-bold text-[#727785]">{15 + (index % 4) * 5} Mins</span>
          </div>
          <div className="flex-1">
            <h3 className="line-clamp-1 text-2xl font-black leading-8 text-[#111c2d]">
              {course.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-base font-semibold leading-7 text-[#424754]">
              {course.description}
            </p>
          </div>
          <Link
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0058be] text-sm font-black text-white shadow-[0_10px_24px_rgba(0,88,190,0.18)] transition hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.45)]"
            href={`/lessons/${course.id}`}
          >
            开始训练
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
          </Link>
        </article>
      ))}
    </section>
  );
}

function CoursePreview({ course, index }: { course: GuandanCourse; index: number }) {
  const symbols = ["A", "K", "Q", "J", "10"];
  const colors = [
    "from-[#e7eeff] to-[#ffffff]",
    "from-[#d4e3ff] to-[#f9f9ff]",
    "from-[#f0f3ff] to-[#ffffff]",
    "from-[#dee8ff] to-[#ffffff]"
  ];

  return (
    <div
      className={`mb-5 flex h-48 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${colors[index % colors.length]} transition group-hover:scale-[1.02]`}
      aria-label={`${course.title} 训练预览`}
    >
      <div className="relative h-28 w-44">
        {symbols.slice(0, 4).map((symbol, cardIndex) => (
          <div
            className="absolute top-2 h-24 w-16 rounded-lg border border-[#d8e3fb] bg-white shadow-[0_8px_24px_rgba(0,88,190,0.10)]"
            key={symbol}
            style={{
              left: `${cardIndex * 32}px`,
              transform: `rotate(${(cardIndex - 1.5) * 5}deg)`
            }}
          >
            <span
              className={[
                "absolute left-2 top-2 text-lg font-black",
                cardIndex % 2 === 0 ? "text-[#ba1a1a]" : "text-[#111c2d]"
              ].join(" ")}
            >
              {symbol}
            </span>
            <span
              className={[
                "absolute bottom-2 right-2 text-2xl",
                cardIndex % 2 === 0 ? "text-[#ba1a1a]" : "text-[#111c2d]"
              ].join(" ")}
            >
              {cardIndex % 2 === 0 ? "♥" : "♣"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoachBubble() {
  return (
    <div className="pointer-events-none fixed bottom-8 right-8 z-50 hidden items-end gap-4 md:flex">
      <div className="pointer-events-auto max-w-xs rounded-3xl rounded-br-none border border-[#0058be]/20 bg-white/90 p-4 shadow-xl backdrop-blur-md">
        <p className="text-sm font-bold leading-6 text-[#111c2d]">
          Ace: 今天建议训练 <span className="text-[#0058be]">牌力判断</span>，你离升级只有一步之遥了！
        </p>
      </div>
      <Link
        className="group pointer-events-auto relative grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 border-white bg-[#0058be] shadow-2xl"
        href="/coach"
      >
        <Image
          alt="AI Coach Ace"
          className="object-cover transition group-hover:scale-110"
          fill
          sizes="64px"
          src="/assets/coach/coach-analysis-mode.png"
        />
      </Link>
    </div>
  );
}

function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-[#c2c6d6]/35 bg-[#eef4ff]/92 backdrop-blur-xl md:hidden">
      {mobileNavItems.map((item) => {
        const active = item.href === "/learning-path";
        return (
          <Link
            className={["flex flex-col items-center gap-1 text-[10px] font-bold", active ? "text-[#0058be]" : "text-[#424754]"].join(" ")}
            href={item.href}
            key={item.label}
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function getChapterSubtitle(categoryId: string) {
  const subtitles: Record<string, string> = {
    basic: "掌握核心规则",
    advanced: "战术深度解析",
    expert: "全局博弈逻辑",
    endgame: "终极决策考验"
  };
  return subtitles[categoryId] ?? "知识节点训练";
}

function getStageLabel(categoryId: string) {
  const labels: Record<string, string> = {
    basic: "入门",
    advanced: "进阶",
    expert: "高手",
    endgame: "大师残局"
  };
  return labels[categoryId] ?? "训练";
}

function getCourseTag(course: GuandanCourse, index: number) {
  if (index === 0) return "INTRO";
  if (course.difficulty.includes("高级")) return "LEVEL 3";
  if (course.difficulty.includes("中级")) return "LEVEL 2";
  return "LEVEL 1";
}
