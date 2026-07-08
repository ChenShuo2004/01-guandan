"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { getTodayTraining } from "@/features/daily-training";
import { useProgress } from "@/features/progress/useProgress";

const abilityScores = [
  { label: "牌型理解", value: 82 },
  { label: "牌权", value: 70 },
  { label: "炸弹使用", value: 62 },
  { label: "残局能力", value: 76 },
  { label: "配合", value: 68 }
];

export function DailyTrainingDashboard() {
  const { progress, isReady } = useProgress();
  const todayTraining = useMemo(
    () => (isReady ? getTodayTraining(progress) : undefined),
    [isReady, progress]
  );
  const trainingHref = todayTraining?.lessonId
    ? `/lessons/${todayTraining.lessonId}`
    : "/practice";

  return (
    <div className="space-y-6">
      <section className="grid min-h-[432px] items-center gap-8 rounded-[24px] bg-white px-10 py-10 shadow-[0_20px_60px_rgba(0,88,190,0.06)] lg:grid-cols-[1fr_360px]">
        <div className="max-w-xl">
          <span className="inline-flex rounded-full bg-[#d4e3ff] px-4 py-2 text-sm font-black text-[#0058be]">
            教练在线
          </span>
          <h2 className="mt-5 text-xl font-black leading-8 text-[#0058be]">
            你好，我是 Ace。
            <br />
            让我看看你的掼蛋水平。
          </h2>
          <p className="mt-6 text-base font-semibold leading-8 text-[#424754]">
            今日建议训练：
            <strong className="text-[#0058be]"> 残局判断</strong>。基于你最近的比赛数据，
            提升残局决策能让你的胜率提高 12%。
          </p>
          <Button className="mt-8 h-14 min-w-52 text-base" href="/coach">
            开始能力测评
            <span className="material-symbols-outlined ml-2 text-[22px]">arrow_forward</span>
          </Button>
        </div>
        <div className="flex justify-center">
          <Image
            alt="Ace 教练"
            className="h-64 w-64 object-contain drop-shadow-[0_22px_40px_rgba(0,88,190,0.18)]"
            height={256}
            src="/assets/coach/coach-victory-celebration.png"
            width={256}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#0058be]">能力画像 Profile</h3>
            <span className="rounded-full bg-[#ffdcc6] px-4 py-2 text-sm font-black text-[#924700]">
              进阶玩家
            </span>
          </div>
          <div className="mt-8 flex justify-center">
            <RadarChart />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <StatCard label="综合得分" value="2,480" />
            <StatCard label="全服排名" value="前 5%" />
          </div>
        </section>

        <div className="grid gap-6">
          <section className="rounded-[24px] border-l-4 border-[#0058be] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
            <div className="flex items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-black text-[#0058be]">
                  今日训练：残局判断专项
                </h3>
                <div className="mt-5 grid grid-cols-2 gap-8 text-sm">
                  <div>
                    <p className="font-black text-[#111c2d]">推荐原因</p>
                    <p className="mt-1 font-semibold text-[#424754]">残局判断评分待提升</p>
                  </div>
                  <div>
                    <p className="font-black text-[#111c2d]">预计耗时</p>
                    <p className="mt-1 font-semibold text-[#424754]">5 分钟</p>
                  </div>
                </div>
              </div>
              <Button className="min-w-28" href={trainingHref}>
                开始训练
              </Button>
            </div>
          </section>

          <section className="rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
            <h3 className="text-lg font-black text-[#0058be]">
              进阶路径 Training Path
            </h3>
            <div className="mt-10 flex items-center justify-between">
              {["基础理解", "牌型判断", "控牌能力", "残局分析", "高级策略"].map(
                (label, index) => (
                  <div className="flex flex-col items-center gap-3" key={label}>
                    <div
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black",
                        index < 3
                          ? "bg-[#2170e4] text-white"
                          : index === 3
                            ? "border-4 border-[#adc6ff] bg-[#2170e4] text-white shadow-[0_0_0_6px_rgba(173,198,255,0.35)]"
                            : "bg-[#e7eeff] text-[#727785]"
                      ].join(" ")}
                    >
                      {index < 3 ? "✓" : index + 1}
                    </div>
                    <span
                      className={[
                        "text-sm font-black",
                        index === 3 ? "text-[#0058be]" : "text-[#424754]",
                        index === 4 ? "text-[#a4a8b3]" : ""
                      ].join(" ")}
                    >
                      {label}
                    </span>
                  </div>
                )
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f0f3ff] p-4">
      <p className="text-sm font-semibold text-[#727785]">{label}</p>
      <p className="mt-1 text-xl font-black text-[#0058be]">{value}</p>
    </div>
  );
}

function RadarChart() {
  const points = "100,18 163,64 142,142 59,153 35,82";

  return (
    <div className="relative h-64 w-64">
      <svg aria-label="能力雷达图" className="h-full w-full" viewBox="0 0 200 200">
        {[80, 60, 40, 20].map((radius) => (
          <polygon
            fill="none"
            key={radius}
            points={polygonPoints(100, 100, radius)}
            stroke="#c2c6d6"
            strokeWidth="1"
          />
        ))}
        {abilityScores.map((item, index) => {
          const angle = -90 + index * 72;
          const end = polarPoint(100, 100, 82, angle);
          const label = polarPoint(100, 100, 106, angle);
          return (
            <g key={item.label}>
              <line
                stroke="#c2c6d6"
                strokeWidth="1"
                x1="100"
                x2={end.x}
                y1="100"
                y2={end.y}
              />
              <text
                fill="#424754"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
                x={label.x}
                y={label.y}
              >
                {item.label}
              </text>
            </g>
          );
        })}
        <polygon fill="rgba(33,112,228,0.24)" points={points} stroke="#0058be" strokeWidth="4" />
      </svg>
    </div>
  );
}

function polygonPoints(cx: number, cy: number, radius: number) {
  return Array.from({ length: 5 })
    .map((_, index) => {
      const point = polarPoint(cx, cy, radius, -90 + index * 72);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  const radians = (Math.PI / 180) * angle;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}
