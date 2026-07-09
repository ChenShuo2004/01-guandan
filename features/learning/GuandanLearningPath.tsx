"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getCategoryCourses,
  guandanLearningPath,
  type GuandanCategory
} from "@/lib/guandan/catalog";

const mapNodes = ["基础入门", "牌型判断", "出牌策略", "队友配合", "残局分析"];

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
              Knowledge Map
            </span>
            <h1 className="mt-4 text-3xl font-black leading-10 text-[#12395a]">
              AI掼蛋成长路线
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-[#52657a]">
              不再用大图堆叠课程。每个阶段拆成可训练的知识节点，进入课程后直接学习一张 AI 知识卡。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-[22px] bg-[#f0f7ff] p-3 text-center">
            <Metric label="课程" value="49" />
            <Metric label="题目" value="74" />
            <Metric label="分类" value="4" />
          </div>
        </div>
      </section>

      <CategoryTabs
        activeCategoryId={activeCategory.id}
        categories={guandanLearningPath.categories}
        onChange={setActiveCategoryId}
      />

      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_18px_50px_rgba(0,88,190,0.05)]">
          <p className="text-sm font-black text-[#0058be]">Knowledge Map</p>
          <div className="mt-5 space-y-3">
            {mapNodes.map((node, index) => (
              <div className="flex items-center gap-3" key={node}>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#e7eeff] text-sm font-black text-[#0058be]">
                  {index + 1}
                </div>
                <div className="min-w-0 rounded-[18px] border border-[#d8e3fb] bg-[#fbfdff] px-3 py-2">
                  <p className="text-sm font-black text-[#12395a]">{node}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold leading-7 text-[#52657a]">
            当前阶段：{activeCategory.name}。先扫知识点，再进入课程卡片。
          </p>
        </aside>

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

          <div className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {courses.map((course, index) => (
              <article
                className="rounded-[22px] border border-[#d8e3fb] bg-[#fbfdff] p-4 shadow-[0_10px_30px_rgba(0,88,190,0.04)]"
                key={course.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-sm font-black text-[#0058be]">
                    {index + 1}
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-[#52657a]">
                    {course.difficulty}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-black leading-7 text-[#12395a]">
                  {course.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#52657a]">
                  {course.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {course.knowledgePoints.slice(0, 4).map((point) => (
                    <span
                      className="rounded-full bg-[#f0f7ff] px-2.5 py-1 text-xs font-bold text-[#52657a]"
                      key={point}
                    >
                      {point}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs font-black text-[#6f7b91]">
                    {course.exerciseIds.length} 道练习
                  </span>
                  <Button className="min-h-10 px-3 py-2" href={`/lessons/${course.id}`}>
                    开始学习
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
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
