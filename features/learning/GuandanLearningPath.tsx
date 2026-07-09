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

const sideNavItems = [
  { href: "/training", icon: "dashboard", label: "竞技大厅" },
  { href: "/assessment/start", icon: "analytics", label: "能力测评" },
  { href: "/learning-path", icon: "fitness_center", label: "训练路线" },
  { href: "/practice", icon: "extension", label: "训练营" },
  { href: "/profile", icon: "person", label: "能力画像" },
  { href: "/history", icon: "history", label: "我的记录" }
];

const stageIcons = ["star", "trending_up", "psychology", "workspace_premium"];

const mobileNavItems = [
  { href: "/training", icon: "dashboard", label: "大厅" },
  { href: "/learning-path", icon: "fitness_center", label: "路线" },
  { href: "/practice", icon: "extension", label: "残局" },
  { href: "/profile", icon: "person", label: "我的" }
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
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#f9f9ff_0%,#eef4ff_100%)] text-[#111c2d]">
      <AcademySideNav />

      <main className="min-h-screen px-4 pb-24 pt-8 md:ml-72 md:px-12 md:py-12">
        <HeroSection />
        <ProgressStages activeCategory={activeCategory} onChange={setActiveCategoryId} />
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

function AcademySideNav() {
  return (
    <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-72 flex-col border-r border-[#dbe2f0] bg-[#f0f3ff] p-6 md:flex">
      <Link className="mb-10 flex items-center gap-3 px-2" href="/learning-path">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0058be] text-white">
          <span className="material-symbols-outlined text-[24px]">school</span>
        </span>
        <span>
          <span className="block text-xl font-bold leading-tight text-[#111c2d]">掼蛋大师</span>
          <span className="block text-[11px] font-medium tracking-wide text-[#424754]">
            AI 进阶训练平台
          </span>
        </span>
      </Link>

      <nav className="flex flex-grow flex-col gap-1.5">
        {sideNavItems.map((item) => {
          const active = item.label === "训练路线";
          return (
            <Link
              className={[
                "flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all",
                active
                  ? "bg-[#0058be] text-white shadow-lg shadow-[#0058be]/20"
                  : "text-[#424754] hover:bg-white/50"
              ].join(" ")}
              href={item.href}
              key={item.label}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        className="mt-auto flex w-full items-center justify-center rounded-2xl bg-[#0058be] py-4 text-sm font-bold text-white shadow-xl shadow-[#0058be]/25 transition-transform hover:scale-[1.02]"
        href="/training"
      >
        开始训练
      </Link>
    </aside>
  );
}

function HeroSection() {
  return (
    <section className="relative mb-16 flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
      <div className="z-10 max-w-2xl">
        <h1 className="mb-8 text-5xl font-bold leading-[1.04] tracking-normal text-[#111c2d] sm:text-6xl lg:text-7xl">
          AI 掼蛋
          <br />
          成长路线
        </h1>
        <p className="max-w-xl text-base font-medium leading-relaxed text-[#424754]/80 md:text-lg">
          从新手到高手，AI 陪你建立真正的牌局判断力。每一个阶段都拆解成可训练的知识节点，进入课程后直接学习一张 AI 知识卡。
        </p>
      </div>

      <div className="relative hidden w-full justify-center lg:flex lg:w-1/3" aria-hidden="true">
        <div className="relative h-64 w-64">
          <div className="absolute inset-0 rounded-full bg-[#0058be]/10 blur-[80px]" />
          <div className="absolute right-0 top-1/4 h-4 w-4 rounded-full bg-[#0058be] opacity-40 blur-[2px]" />
          <div className="absolute bottom-1/4 left-0 h-3 w-3 rounded-full bg-[#0060ac] opacity-30 blur-[1px]" />
        </div>
      </div>
    </section>
  );
}

function ProgressStages({
  activeCategory,
  onChange
}: {
  activeCategory: GuandanCategory;
  onChange: (categoryId: string) => void;
}) {
  const activeIndex = Math.max(
    0,
    guandanLearningPath.categories.findIndex((category) => category.id === activeCategory.id)
  );

  return (
    <section className="mb-16">
      <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-[#424754]">
        你的成长阶段
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {guandanLearningPath.categories.map((category, index) => {
          const active = index === activeIndex;
          return (
            <button
              className={[
                "flex min-h-[88px] items-center gap-4 rounded-[24px] p-5 text-left transition-all",
                active
                  ? "bg-[#0058be] text-white shadow-lg shadow-[#0058be]/20"
                  : "border border-[#dbe2f0] bg-white text-[#111c2d]/50 hover:border-[#0058be]/30"
              ].join(" ")}
              key={category.id}
              onClick={() => onChange(category.id)}
              type="button"
            >
              <span
                className={[
                  "grid h-12 w-12 shrink-0 place-items-center rounded-full",
                  active ? "bg-white/20 text-white" : "bg-[#eef2ff] text-[#0058be]"
                ].join(" ")}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {stageIcons[index] ?? "school"}
                </span>
              </span>
              <span>
                <span className="block text-base font-bold">{getStageLabel(category.id)}</span>
                {active ? (
                  <span className="mt-0.5 block text-[10px] font-medium text-white/70">
                    当前进度 45%
                  </span>
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
    <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-4">
      {categories.map((category, index) => {
        const active = category.id === activeCategoryId;
        return (
          <button
            className={[
              "group relative flex h-56 flex-col items-center justify-center overflow-hidden rounded-[32px] border p-10 text-center transition-all",
              active
                ? "border-[#0058be]/20 bg-white/70 shadow-[0_4px_24px_-4px_rgba(0,88,190,0.08)] backdrop-blur-xl hover:bg-white"
                : "border-[#dbe2f0]/30 bg-[#eef2ff]/50 hover:bg-white"
            ].join(" ")}
            key={category.id}
            onClick={() => onChange(category.id)}
            type="button"
          >
            <span
              className={[
                "absolute left-6 top-4 select-none text-8xl font-black leading-none",
                active ? "text-[#0058be]/5" : "text-[#111c2d]/5"
              ].join(" ")}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3
              className={[
                "z-10 mb-1 text-xl font-bold",
                active ? "text-[#111c2d]" : "text-[#111c2d]/40"
              ].join(" ")}
            >
              {category.name}
            </h3>
            <p
              className={[
                "z-10 text-xs font-medium",
                active ? "text-[#424754]" : "text-[#424754]/40"
              ].join(" ")}
            >
              {getChapterSubtitle(category.id)}
            </p>
            {active ? (
              <span className="absolute bottom-0 left-0 h-1 w-full bg-[#0058be]/20">
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
    <section className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
      {courses.slice(0, 8).map((course, index) => (
        <article
          className="group flex h-full flex-col rounded-[28px] bg-white p-5 shadow-[0_4px_24px_-4px_rgba(0,88,190,0.08)] transition-all hover:-translate-y-1"
          key={course.id}
        >
          <CoursePreview course={course} />
          <div className="mb-3 flex items-center gap-2">
            <span
              className={[
                "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                index === 2
                  ? "bg-orange-500/10 text-orange-600"
                  : "bg-[#0058be]/10 text-[#0058be]"
              ].join(" ")}
            >
              {getCourseTag(course, index)}
            </span>
            <span className="text-[11px] font-medium text-[#424754]">
              {15 + (index % 4) * 5} Mins
            </span>
          </div>
          <div className="flex-grow">
            <h4 className="mb-2 line-clamp-2 text-xl font-bold leading-tight text-[#111c2d]">
              {course.title}
            </h4>
            <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-[#424754]">
              {course.description}
            </p>
          </div>
          <Link
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0058be] py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            href={`/lessons/${course.id}`}
          >
            开始训练
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </article>
      ))}
    </section>
  );
}

function CoursePreview({ course }: { course: GuandanCourse }) {
  const image = course.exampleImages[0];

  return (
    <div className="mb-5 aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-[#eef2ff]">
      {image ? (
        <Image
          alt={`${course.title} 课程缩略图`}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          height={360}
          src={image}
          width={480}
        />
      ) : (
        <div className="grid h-full place-items-center text-[#0058be]">
          <span className="material-symbols-outlined text-[36px]">style</span>
        </div>
      )}
    </div>
  );
}

function CoachBubble() {
  return (
    <div className="pointer-events-none fixed bottom-8 right-8 z-50 hidden items-end gap-4 md:flex">
      <div className="pointer-events-auto max-w-xs rounded-[32px] rounded-br-none border border-[#0058be]/10 bg-white/95 p-5 shadow-2xl backdrop-blur-md">
        <p className="text-[13px] font-medium leading-relaxed text-[#111c2d]">
          Ace: 今天建议训练 <span className="font-bold text-[#0058be]">牌力判断</span>
          ，你离升级只有一步之遥了！
        </p>
      </div>
      <Link
        className="group pointer-events-auto relative grid h-16 w-16 place-items-center overflow-hidden rounded-full border-4 border-white bg-[#0058be] shadow-2xl transition-transform hover:scale-105"
        href="/coach"
      >
        <Image
          alt="AI Coach Ace"
          className="object-cover"
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
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-[#dbe2f0] bg-white/94 backdrop-blur-xl md:hidden">
      {mobileNavItems.map((item) => {
        const active = item.href === "/learning-path";
        return (
          <Link
            className={[
              "flex flex-col items-center gap-1 text-[10px] font-bold",
              active ? "text-[#0058be]" : "text-[#424754]"
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
  if (index === 0) return "Intro";
  if (course.difficulty.includes("高级")) return "Level 3";
  if (course.difficulty.includes("中级")) return index === 2 ? "Level 2" : "Level 1";
  return "Level 1";
}
