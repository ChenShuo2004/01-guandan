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
  { href: "/training", icon: "grid_view", label: "竞技大厅" },
  { href: "/assessment/start", icon: "insert_chart", label: "能力测评" },
  { href: "/learning-path", icon: "rocket_launch", label: "训练路线" },
  { href: "/practice", icon: "style", label: "残局挑战" },
  { href: "/profile", icon: "person", label: "能力画像" },
  { href: "/profile", icon: "history", label: "我的记录" }
];

const stageIcons = ["star", "trending_up", "psychology", "workspace_premium"];

const mobileNavItems = [
  { href: "/", icon: "grid_view", label: "大厅" },
  { href: "/learning-path", icon: "rocket_launch", label: "路线" },
  { href: "/training", icon: "style", label: "训练" },
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
    <div className="min-h-screen overflow-x-hidden bg-[#f4f7ff] text-[#07172f]">
      <AcademySideNav />

      <main className="relative min-h-screen px-4 pb-24 pt-2 sm:ml-[154px] sm:px-7 sm:pb-12 lg:px-10">
        <AmbientDots />
        <div className="relative mx-auto w-full max-w-[1060px]">
          <HeroSection />
          <ProgressStages
            activeCategory={activeCategory}
            onChange={setActiveCategoryId}
          />
          <CategoryChapters
            activeCategoryId={activeCategory.id}
            categories={guandanLearningPath.categories}
            onChange={setActiveCategoryId}
          />
          <CourseGrid courses={courses} />
        </div>
      </main>

      <CoachBubble />
      <MobileBottomNav />
    </div>
  );
}

function AcademySideNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[154px] flex-col border-r border-[#dbe4f4] bg-[#edf3ff]/92 px-3 py-4 shadow-[12px_0_34px_rgba(15,45,88,0.04)] backdrop-blur-xl sm:flex">
      <Link className="flex items-center gap-2 px-1" href="/learning-path">
        <span className="grid h-[22px] w-[22px] place-items-center rounded-[6px] bg-[#075fd7] text-white shadow-[0_6px_18px_rgba(7,95,215,0.26)]">
          <span className="material-symbols-outlined text-[15px]">school</span>
        </span>
        <span className="min-w-0">
          <span className="block text-[12px] font-black leading-4 text-[#07172f]">掼蛋大师</span>
          <span className="block truncate text-[6px] font-bold leading-3 text-[#62728a]">
            AI成长训练平台
          </span>
        </span>
      </Link>

      <nav className="mt-7 grid gap-2">
        {sideNavItems.map((item) => {
          const active = item.label === "训练路线";
          return (
            <Link
              className={[
                "flex h-[29px] min-h-[29px] items-center gap-2 rounded-[8px] px-3 text-[7px] font-black transition",
                active
                  ? "bg-[#075fd7] text-white shadow-[0_8px_18px_rgba(7,95,215,0.28)]"
                  : "text-[#263852] hover:bg-white/72"
              ].join(" ")}
              href={item.href}
              key={item.label}
            >
              <span className="material-symbols-outlined text-[12px]">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        className="mt-auto flex h-[29px] min-h-[29px] items-center justify-center rounded-[8px] bg-[#075fd7] text-[7px] font-black text-white shadow-[0_8px_18px_rgba(7,95,215,0.28)]"
        href="/training"
      >
        开始训练
      </Link>
    </aside>
  );
}

function AmbientDots() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span className="absolute right-[9%] top-[9%] h-2 w-2 rounded-full bg-[#1677d2]/35 shadow-[0_0_10px_rgba(22,119,210,0.42)]" />
      <span className="absolute right-[30%] top-[18%] h-1.5 w-1.5 rounded-full bg-[#1677d2]/30" />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-[186px] items-center py-4 sm:py-6">
      <div className="relative z-10 max-w-[420px]">
        <h1 className="text-[40px] font-black leading-[0.94] tracking-normal text-[#06142b]">
          AI 掼蛋
          <br />
          成长路线
        </h1>
        <p className="mt-5 max-w-[410px] text-[11px] font-semibold leading-[1.65] text-[#5b6880]">
          从新手到高手，AI 陪你建立真正的牌局判断力。每一个阶段都拆解成可训练的知识节点，进入课程后直接学习一张 AI 知识卡。
        </p>
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
    <section className="mb-9">
      <h2 className="mb-3 text-[9px] font-black text-[#07172f]">你的成长阶段</h2>
      <div className="grid gap-3 sm:grid-cols-4">
        {guandanLearningPath.categories.map((category, index) => {
          const active = index === activeIndex;
          return (
            <button
              className={[
                "flex h-[49px] min-w-0 items-center gap-2 rounded-[10px] border px-3 text-left transition",
                active
                  ? "border-[#075fd7] bg-[#075fd7] text-white shadow-[0_10px_20px_rgba(7,95,215,0.28)]"
                  : "border-[#dce4f1] bg-white text-[#5b6880] hover:border-[#b9c9e5] hover:bg-white/88"
              ].join(" ")}
              key={category.id}
              onClick={() => onChange(category.id)}
              type="button"
            >
              <span
                className={[
                  "grid h-[25px] w-[25px] shrink-0 place-items-center rounded-full",
                  active ? "bg-white/20 text-white" : "bg-[#eaf1ff] text-[#075fd7]"
                ].join(" ")}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {stageIcons[index] ?? "school"}
                </span>
              </span>
              <span className="min-w-0">
                <span
                  className={[
                    "block whitespace-nowrap text-[9px] font-black",
                    active ? "text-white" : "text-[#506079]"
                  ].join(" ")}
                >
                  {getStageLabel(category.id)}
                </span>
                {active ? (
                  <span className="mt-0.5 block text-[6px] font-bold text-white/85">
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
    <section className="mb-9 grid gap-4 sm:grid-cols-4">
      {categories.map((category, index) => {
        const active = category.id === activeCategoryId;
        return (
          <button
            className={[
              "group relative flex h-[119px] flex-col justify-center overflow-hidden rounded-[14px] border p-4 text-center transition",
              active
                ? "border-[#cfe0f7] bg-white shadow-[0_12px_24px_rgba(16,74,145,0.10)]"
                : "border-[#e8edf6] bg-[#f2f6ff]/58 opacity-70 hover:opacity-100"
            ].join(" ")}
            key={category.id}
            onClick={() => onChange(category.id)}
            type="button"
          >
            <span
              className={[
                "absolute left-1/2 top-3 -translate-x-1/2 text-[49px] font-black leading-none",
                active ? "text-[#075fd7]/10" : "text-[#d6deef]/46"
              ].join(" ")}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="relative mt-8">
              <span className="block text-[10px] font-black leading-5 text-[#263852]">
                {category.name}
              </span>
              <span className="mt-0.5 block text-[6px] font-bold text-[#7d899c]">
                {getChapterSubtitle(category.id)}
              </span>
            </span>
            {active ? (
              <span className="absolute bottom-0 left-2 right-2 h-[3px] overflow-hidden rounded-full bg-[#dce9ff]">
                <span className="block h-full w-3/4 bg-[#1477ef]" />
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
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      {courses.slice(0, 8).map((course, index) => (
        <Link
          className="group block overflow-hidden rounded-[13px] border border-[#eef2f8] bg-white p-3 shadow-[0_10px_28px_rgba(20,52,96,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(20,52,96,0.10)]"
          href={`/lessons/${course.id}`}
          key={course.id}
        >
          <CoursePreview index={index} course={course} />
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="rounded-full bg-[#fff2dd] px-2 py-1 text-[7px] font-black text-[#c47705]">
              {getCourseTag(course, index)}
            </span>
            <span className="text-[7px] font-bold text-[#8a96a9]">
              {8 + (index % 4) * 2} 分钟
            </span>
          </div>
          <h3 className="mt-2 line-clamp-1 text-[12px] font-black leading-5 text-[#14233a]">
            {course.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-[8px] font-semibold leading-4 text-[#6f7d92]">
            {course.description}
          </p>
        </Link>
      ))}
    </section>
  );
}

function CoursePreview({ course, index }: { course: GuandanCourse; index: number }) {
  const image = course.exampleImages[0];

  return (
    <div className="relative h-[75px] overflow-hidden rounded-[10px] bg-[#e9eef8]">
      {image ? (
        <Image
          alt={`${course.title} 训练预览`}
          className="object-cover transition duration-300 group-hover:scale-105"
          fill
          sizes="(min-width: 1024px) 220px, (min-width: 640px) 45vw, 92vw"
          src={image}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#eef5ff] to-white">
          <span className="material-symbols-outlined text-[24px] text-[#075fd7]">style</span>
        </div>
      )}
    </div>
  );
}

function CoachBubble() {
  return (
    <div className="pointer-events-none fixed bottom-8 right-5 z-50 hidden items-end gap-3 sm:flex">
      <div className="pointer-events-auto max-w-[265px] rounded-[10px] border border-[#dce4f1] bg-white/92 px-4 py-3 shadow-[0_12px_30px_rgba(20,52,96,0.14)] backdrop-blur-md">
        <p className="text-[9px] font-bold leading-5 text-[#253750]">
          Ace: 今天建议训练 <span className="text-[#075fd7]">牌力判断</span>，你离高手只差一步之遥了！
        </p>
      </div>
      <Link
        className="group pointer-events-auto relative grid h-[40px] w-[40px] place-items-center overflow-hidden rounded-full border-2 border-white bg-[#075fd7] shadow-[0_10px_22px_rgba(7,95,215,0.22)]"
        href="/coach"
      >
        <Image
          alt="AI Coach Ace"
          className="object-cover transition group-hover:scale-110"
          fill
          sizes="40px"
          src="/assets/coach/coach-analysis-mode.png"
        />
      </Link>
    </div>
  );
}

function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-[#dce4f1] bg-white/94 backdrop-blur-xl sm:hidden">
      {mobileNavItems.map((item) => {
        const active = item.href === "/learning-path";
        return (
          <Link
            className={[
              "flex flex-col items-center gap-1 text-[10px] font-bold",
              active ? "text-[#075fd7]" : "text-[#62728a]"
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
  if (index === 0) return "AI知识";
  if (course.difficulty.includes("高级")) return "进阶";
  if (course.difficulty.includes("中级")) return "训练";
  return "入门";
}
