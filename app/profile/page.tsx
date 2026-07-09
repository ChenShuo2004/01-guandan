import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { AnimatedProgress } from "@/components/ui/AnimatedProgress";
import { GlowCard } from "@/components/ui/GlowCard";
import { analyzeGrowth } from "@/lib/player/GrowthAnalyzer";
import type { SkillProfileItem } from "@/lib/player/SkillProfile";
import { defaultPlayerModel } from "@/lib/profile/PlayerModel";
import { buildTrainingPlan } from "@/lib/training/TrainingPlanner";

const levelTrack = ["青铜", "白银", "黄金", "大师"];
const chartBars = [42, 58, 36, 78, 70, 95, 86];

export default function ProfilePage() {
  const analysis = analyzeGrowth();
  const profile = analysis.profile;
  const plan = buildTrainingPlan(profile);
  const weakestSkill = [...profile.skills].sort((a, b) => a.score - b.score)[0];

  return (
    <AppShell title="能力画像" subtitle="看清当前能力结构，下一轮训练才不会乱练。" variant="wide">
      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="order-2 space-y-4 xl:order-1">
          <GlowCard className="p-5" interactive={false}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#0058be]">Rank Growth</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-[#ba1a1a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ba1a1a]" />
                Live
              </span>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs font-black uppercase text-[#727785]">Current Rank</p>
              <h2 className="mt-2 text-5xl font-black leading-none text-[#0058be]">
                {profile.level}
              </h2>
              <p className="mt-3 text-3xl font-black text-[#111c2d]">
                {profile.totalScore.toLocaleString("zh-CN")}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#727785]">综合积分</p>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between text-xs font-black text-[#657488]">
                <span>距离黄金 III</span>
                <span className="text-[#0058be]">还差 160 分</span>
              </div>
              <AnimatedProgress className="mt-3" value={84} />
            </div>
          </GlowCard>

          <StatTile icon="analytics" label="胜率" value={`${profile.winRate}%`} />
          <StatTile icon="model_training" label="训练次数" value={`${profile.completedTrainings} 次`} />
          <StatTile icon="calendar_today" label="连续训练" value={`${profile.streakDays} 天`} tone="warm" />
        </aside>

        <GlowCard className="order-1 p-5 sm:p-8 xl:order-2" interactive={false}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-3xl font-black leading-tight text-[#111c2d]">AI 能力画像</h2>
              <p className="mt-2 text-sm font-semibold text-[#424754]">从“能打”走向“会赢”。</p>
            </div>
            <span className="w-fit rounded-xl bg-[#2170e4] px-4 py-2 text-xs font-black text-white">
              {plan.difficultyLabel}
            </span>
          </div>

          <div className="mt-8 flex justify-center">
            <RadarChart skills={profile.skills} />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {profile.skills.slice(0, 4).map((skill) => (
              <SkillCard key={skill.key} skill={skill} />
            ))}
          </div>
        </GlowCard>

        <aside className="order-3 space-y-5">
          <GlowCard className="overflow-hidden p-0" interactive={false}>
            <div className="relative h-44 bg-[#e7eeff]">
              <Image
                alt="Ace AI 教练"
                className="h-full w-full object-cover"
                height={176}
                src="/assets/coach/coach-analysis-mode.png"
                width={300}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="rounded-lg bg-[#0058be] px-2 py-1 text-[10px] font-black uppercase text-white">
                  Pro Coach
                </span>
                <h3 className="mt-2 text-xl font-black text-[#111c2d]">Ace 今日训练建议</h3>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e7eeff] text-[#0058be]">
                  <span className="material-symbols-outlined text-[24px]">lightbulb</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#727785]">今日核心重点</p>
                  <p className="font-black text-[#0058be]">{weakestSkill.label}</p>
                </div>
              </div>

              <blockquote className="mt-5 rounded-xl border-l-4 border-[#0058be] bg-[#f0f3ff] p-4 text-sm font-semibold leading-6 text-[#263143]">
                “你的{weakestSkill.label}已经进入可训练区，下一阶段重点练关键回合的判断速度。”
              </blockquote>

              <ul className="mt-5 space-y-3">
                {plan.tasks.map((task) => (
                  <li className="flex items-start gap-2 text-xs font-semibold leading-5 text-[#424754]" key={task.id}>
                    <span className="material-symbols-outlined mt-0.5 text-[15px] text-[#0058be]">
                      check_circle
                    </span>
                    <span>{task.title}</span>
                  </li>
                ))}
              </ul>

              <a
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0058be] text-sm font-black text-white shadow-[0_12px_26px_rgba(0,88,190,0.24)] transition hover:bg-[#2170e4]"
                href="/training"
              >
                开始专项训练
                <span className="material-symbols-outlined text-[18px]">bolt</span>
              </a>
            </div>
          </GlowCard>

          <GlowCard className="p-5" interactive={false}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#111c2d]">近期战绩曲线</h3>
              <span className="material-symbols-outlined text-[18px] text-[#727785]">more_horiz</span>
            </div>
            <div className="mt-5 flex h-24 items-end gap-2">
              {chartBars.map((height, index) => (
                <div
                  className={index >= 3 ? "flex-1 rounded-t bg-[#0058be]" : "flex-1 rounded-t bg-[#d8e3fb]"}
                  key={`${height}-${index}`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-black uppercase text-[#727785]">
              <span>Mon</span>
              <span>Today</span>
            </div>
          </GlowCard>
        </aside>
      </div>
    </AppShell>
  );
}

function StatTile({
  icon,
  label,
  tone = "blue",
  value
}: {
  icon: string;
  label: string;
  tone?: "blue" | "warm";
  value: string;
}) {
  return (
    <GlowCard className="flex items-center gap-3 p-4" interactive={false}>
      <div
        className={
          tone === "warm"
            ? "grid h-11 w-11 place-items-center rounded-xl bg-[#ffdcc6] text-[#924700]"
            : "grid h-11 w-11 place-items-center rounded-xl bg-[#d4e3ff] text-[#0058be]"
        }
      >
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-[#727785]">{label}</p>
        <p className="text-xl font-black text-[#111c2d]">{value}</p>
      </div>
    </GlowCard>
  );
}

function SkillCard({ skill }: { skill: SkillProfileItem }) {
  const isWeak = skill.trend === "down";
  const accent = isWeak ? "#ba1a1a" : "#0058be";

  return (
    <div className="rounded-2xl border border-[#d8e3fb] bg-[#f7faff] p-4">
      <div className="flex items-start justify-between gap-3">
        <span
          className="rounded-lg px-2 py-1 text-xs font-black"
          style={{
            backgroundColor: isWeak ? "#ffdad6" : "#d8e3fb",
            color: accent
          }}
        >
          {trendText(skill.trend)}
        </span>
        <span className="text-2xl font-black" style={{ color: accent }}>
          {skill.score}
        </span>
      </div>
      <h3 className="mt-3 text-base font-black text-[#111c2d]">{skill.label}</h3>
      <p className="mt-2 min-h-10 text-xs font-semibold leading-5 text-[#424754]">
        {skillDescription(skill)}
      </p>
      <AnimatedProgress className="mt-4" value={skill.score} />
    </div>
  );
}

function RadarChart({ skills }: { skills: SkillProfileItem[] }) {
  return (
    <svg className="h-[360px] w-full max-w-[460px] overflow-visible" viewBox="0 0 300 300">
      {[118, 86, 54].map((radius) => (
        <circle
          cx="150"
          cy="150"
          fill="none"
          key={radius}
          r={radius}
          stroke="#d8e3fb"
          strokeWidth="1.5"
        />
      ))}
      {skills.map((_, index) => {
        const point = polarPoint(150, 150, 118, -90 + index * (360 / skills.length));
        return (
          <line
            key={index}
            stroke="#d8e3fb"
            strokeWidth="1.5"
            x1="150"
            x2={point.x}
            y1="150"
            y2={point.y}
          />
        );
      })}
      <polygon
        fill="rgba(0,88,190,0.18)"
        points={radarPointsFromScores(skills.map((skill) => skill.score))}
        stroke="#0058be"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      {skills.map((skill, index) => {
        const point = polarPoint(150, 150, 138, -90 + index * (360 / skills.length));
        return (
          <text
            fill="#111c2d"
            fontSize="13"
            fontWeight="800"
            key={skill.key}
            textAnchor="middle"
            x={point.x}
            y={point.y}
          >
            {skill.label}
          </text>
        );
      })}
    </svg>
  );
}

function trendText(trend: SkillProfileItem["trend"]) {
  if (trend === "up") return "提升中";
  if (trend === "down") return "需要关注";
  return "稳定";
}

function skillDescription(skill: SkillProfileItem) {
  if (skill.trend === "up") return `${skill.label}正在变强，下一轮训练继续巩固关键判断。`;
  if (skill.trend === "down") return `${skill.label}是今日优先校准项，Ace 会给出更短路径。`;
  return `${skill.label}还在校准中，建议通过专项训练补齐。`;
}

function radarPointsFromScores(scores: number[]) {
  return scores
    .map((score, index) => {
      const radius = (score / 100) * 118;
      const point = polarPoint(150, 150, radius, -90 + index * (360 / scores.length));
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
