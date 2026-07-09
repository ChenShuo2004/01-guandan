"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getCategoryCourses,
  guandanLearningPath,
  type GuandanCategory
} from "@/lib/guandan/catalog";

export function GuandanLearningPath() {
  const [activeCategoryId, setActiveCategoryId] = useState(
    guandanLearningPath.categories[0]?.id ?? "basic"
  );
  const activeCategory =
    guandanLearningPath.categories.find((category) => category.id === activeCategoryId) ??
    guandanLearningPath.categories[0];
  const courses = useMemo(() => getCategoryCourses(activeCategory), [activeCategory]);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_20px_60px_rgba(0,88,190,0.06)] lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-[#e7eeff] px-3 py-1.5 text-xs font-black text-[#0058be]">
              PDF 知识资产已接入
            </span>
            <h1 className="mt-4 text-3xl font-black leading-10 text-[#12395a]">
              AI掼蛋成长路线
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-[#52657a]">
              从《掼蛋技巧秘籍》PDF 抽取课程、题目和示例图片。每门课都绑定来源章节、PDF 页码、练习题和 AI 教练讲解。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-[22px] bg-[#f0f7ff] p-3 text-center">
            <Metric label="课程" value="49" />
            <Metric label="题目" value="74" />
            <Metric label="图片" value="49" />
          </div>
        </div>
      </section>

      <CategoryTabs
        activeCategoryId={activeCategory.id}
        categories={guandanLearningPath.categories}
        onChange={setActiveCategoryId}
      />

      <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_18px_50px_rgba(0,88,190,0.05)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#12395a]">{activeCategory.name}</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-[#52657a]">
              {activeCategory.description}
            </p>
          </div>
          <span className="rounded-full bg-[#e7eeff] px-3 py-1.5 text-xs font-black text-[#0058be]">
            {courses.length} 门课
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article
              className="overflow-hidden rounded-[24px] border border-[#d8e3fb] bg-[#fbfdff]"
              key={course.id}
            >
              <div className="relative aspect-[4/3] bg-[#edf5ff]">
                <Image
                  alt={`${course.title} PDF 示例图`}
                  className="object-contain p-2"
                  fill
                  sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                  src={course.exampleImages[0]}
                />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-[#0058be]">
                    {course.difficulty}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-[#6f7b91]">
                    {course.sourceChapter}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black leading-7 text-[#12395a]">
                    {course.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#52657a]">
                    {course.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {course.knowledgePoints.slice(0, 3).map((point) => (
                    <span
                      className="rounded-full bg-[#f0f7ff] px-2.5 py-1 text-xs font-bold text-[#52657a]"
                      key={point}
                    >
                      {point}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-xs font-black text-[#6f7b91]">
                    {course.exerciseIds.length} 道练习
                  </span>
                  <Button className="min-h-10 px-3 py-2" href={`/lessons/${course.id}`}>
                    开始学习
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <AssessmentEntry
          count="20题"
          description="快速判断规则、牌型、简单出牌和主攻助攻基础。"
          href="/assessment/session/simple"
          title="简单能力测试"
        />
        <AssessmentEntry
          count="50题"
          description="覆盖牌力、炸弹、主攻、助攻、记牌、残局和心理策略。"
          href="/assessment/session/full"
          title="全面能力测试"
        />
      </section>
    </div>
  );
}

function CategoryTabs({
  activeCategoryId,
  categories,
  onChange
}: {
  activeCategoryId: string;
  categories: GuandanCategory[];
  onChange: (categoryId: string) => void;
}) {
  return (
    <div className="grid gap-2 rounded-[24px] border border-[#d8e3fb] bg-white p-2 shadow-[0_12px_36px_rgba(0,88,190,0.04)] sm:grid-cols-4">
      {categories.map((category) => {
        const active = category.id === activeCategoryId;
        return (
          <button
            className={[
              "min-h-12 rounded-[18px] px-3 py-2 text-sm font-black transition",
              active ? "bg-[#0058be] text-white" : "text-[#52657a] hover:bg-[#f0f7ff]"
            ].join(" ")}
            key={category.id}
            onClick={() => onChange(category.id)}
            type="button"
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[72px]">
      <p className="text-2xl font-black text-[#12395a]">{value}</p>
      <p className="text-xs font-black text-[#6f7b91]">{label}</p>
    </div>
  );
}

function AssessmentEntry({
  count,
  description,
  href,
  title
}: {
  count: string;
  description: string;
  href: string;
  title: string;
}) {
  return (
    <article className="rounded-[24px] border border-[#d8e3fb] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-[#12395a]">{title}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#52657a]">{description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#e7eeff] px-3 py-1.5 text-xs font-black text-[#0058be]">
          {count}
        </span>
      </div>
      <Button className="mt-4 w-full" href={href}>
        开始测试
      </Button>
    </article>
  );
}
