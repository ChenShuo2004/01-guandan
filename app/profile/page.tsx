import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AnimatedProgress } from "@/components/ui/AnimatedProgress";
import { GlowCard } from "@/components/ui/GlowCard";
import { analyzeGrowth } from "@/lib/player/GrowthAnalyzer";
import { defaultPlayerModel } from "@/lib/profile/PlayerModel";
import { buildTrainingPlan } from "@/lib/training/TrainingPlanner";

const levelTrack = ["青铜", "白银", "黄金", "大师"];

const trainingRecords = [
  {
    id: "endgame-review",
    icon: "extension",
    title: "残局分析训练",
    mode: "基础对抗模式 · 第一阶段",
    status: "胜利",
    statusTone: "success",
    time: "昨天 14:30",
    insight: "本局主要问题：没有及时判断炸弹价值，导致后期失去主动权。"
  },
  {
    id: "bomb-control",
    icon: "gavel",
    title: "炸弹判断实战",
    mode: "高级博弈模式 · 第五阶段",
    status: "待复盘",
    statusTone: "danger",
    time: "3 天前",
    insight: "防守策略偏保守，对手剩三张时没有果断压制。建议重练强手博弈。"
  },
  {
    id: "teamwork",
    icon: "groups",
    title: "队友配合强化",
    mode: "团队意识模式 · 模拟对局",
    status: "分析中",
    statusTone: "neutral",
    time: "4 天前",
    insight: "对局已完成，Ace 正在分析队友协同数据，下一轮会优先给配合建议。"
  }
];

export default function ProfilePage() {
  const analysis = analyzeGrowth();
  const profile = analysis.profile;
  const plan = buildTrainingPlan(profile);
  const weakestSkill = [...profile.skills].sort((a, b) => a.score - b.score)[0];
  const strongestSkill = [...profile.skills].sort((a, b) => b.score - a.score)[0];

  return (
    <AppShell title="我的成长档案" subtitle="Ace 会把每次训练沉淀成你的能力画像。" variant="wide">
      <div className="space-y-5">
        <GlowCard className="overflow-hidden p-0" data-profile-card>
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="p-5 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-lg bg-[#e7eeff] px-3 py-1.5 text-xs font-black text-[#0058be]">
                <span className="material-symbols-outlined text-[16px]">summarize</span>
                训练总结
              </div>
              <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight text-[#111c2d] sm:text-4xl">
                胜率提升明显，继续保持。
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Metric label="最近完成" value={`${profile.completedTrainings} 次训练`} />
                <Metric label="胜率状态" value={`${profile.winRate}%`} />
                <Metric label="待加强项" value={weakestSkill.label} tone="danger" />
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0058be] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(0,88,190,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(0,88,190,0.28)]"
                  href="/training"
                >
                  继续训练
                </Link>
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-[#0058be] bg-white px-5 text-sm font-black text-[#0058be] transition hover:bg-[#f0f7ff]"
                  href="#ability"
                >
                  查看能力分析
                </Link>
              </div>
            </div>

            <div className="border-t border-[#e7eeff] bg-[#f0f7ff] p-5 sm:p-8 lg:border-l lg:border-t-0">
              <div className="rounded-2xl border border-[#d8e3fb] bg-white p-5 shadow-[0_16px_40px_rgba(0,88,190,0.06)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase text-[#727785]">当前段位</p>
                    <h3 className="mt-2 text-3xl font-black text-[#0058be]">{profile.level}</h3>
                  </div>
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#d4e3ff] text-[#0058be]">
                    <span className="material-symbols-outlined text-[30px]">military_tech</span>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-black text-[#657488]">
                    {levelTrack.map((level) => (
                      <span key={level}>{level}</span>
                    ))}
                  </div>
                  <AnimatedProgress
                    className="mt-3"
                    value={(profile.levelIndex / (levelTrack.length - 1)) * 100}
                  />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MiniStat label="综合积分" value={profile.totalScore.toLocaleString("zh-CN")} />
                  <MiniStat label="连续训练" value={`${profile.streakDays} 天`} />
                </div>
              </div>
            </div>
          </div>
        </GlowCard>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <GlowCard id="ability" data-profile-card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black text-[#0058be]">能力画像</p>
                <h2 className="mt-1 text-2xl font-black text-[#111c2d]">看见短板，训练才有方向</h2>
              </div>
              <span className="w-fit rounded-lg bg-[#e7eeff] px-3 py-2 text-sm font-black text-[#0058be]">
                {plan.difficultyLabel}
              </span>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center">
                <svg className="h-full w-full overflow-visible" viewBox="0 0 260 260">
                  {[104, 76, 48].map((radius) => (
                    <circle
                      cx="130"
                      cy="130"
                      fill="none"
                      key={radius}
                      r={radius}
                      stroke="#d8e3fb"
                      strokeWidth="1.5"
                    />
                  ))}
                  {profile.skills.map((_, index) => {
                    const point = polarPoint(130, 130, 104, -90 + index * (360 / profile.skills.length));
                    return (
                      <line
                        key={index}
                        stroke="#d8e3fb"
                        strokeWidth="1.5"
                        x1="130"
                        x2={point.x}
                        y1="130"
                        y2={point.y}
                      />
                    );
                  })}
                  <polygon
                    fill="rgba(0,88,190,0.18)"
                    points={radarPointsFromScores(profile.skills.map((skill) => skill.score))}
                    stroke="#0058be"
                    strokeLinejoin="round"
                    strokeWidth="4"
                  />
                  {profile.skills.map((skill, index) => {
                    const point = polarPoint(130, 130, 122, -90 + index * (360 / profile.skills.length));
                    return (
                      <text
                        fill="#111c2d"
                        fontSize="12"
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
              </div>

              <div className="grid gap-3">
                {profile.skills.map((skill) => (
                  <div
                    className="rounded-2xl border border-[#e7eeff] bg-[#f9fbff] p-4"
                    key={skill.key}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-[#111c2d]">{skill.label}</p>
                        <p className="mt-1 text-xs font-bold text-[#727785]">
                          {trendLabel(skill.trend)}
                        </p>
                      </div>
                      <span className="rounded-lg bg-white px-3 py-1 text-sm font-black text-[#0058be] shadow-sm">
                        {skill.score}
                      </span>
                    </div>
                    <AnimatedProgress className="mt-4" value={skill.score} showValue />
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#52657a]">
                      {abilityDescription(skill.label, skill.score, skill.trend)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </GlowCard>

          <GlowCard className="ai-coach-card text-white shadow-[0_22px_70px_rgba(0,88,190,0.24)]" data-profile-card>
            <div className="ai-coach-dots" />
            <div className="ai-coach-scan" />

            <p className="text-sm font-black text-[#d8f6ff]">Ace 今日建议</p>
            <h3 className="mt-3 text-2xl font-black leading-tight">{plan.title}</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#ecf7ff]">
              {plan.focusReason}
            </p>

            <div className="mt-5 rounded-2xl border border-white/20 bg-white/12 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase text-[#d8f6ff]">Coach Memory</span>
                <span className="h-2 w-2 rounded-full bg-[#8cffef] shadow-[0_0_18px_rgba(140,255,239,0.86)]" />
              </div>
              <div className="mt-3 space-y-3">
                {defaultPlayerModel.coachMemory.slice(0, 2).map((note) => (
                  <div key={note.id}>
                    <p className="text-sm font-black">{note.title}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-[#dff6ff]">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Link
              className="ripple-button mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-white text-sm font-black text-[#0058be] shadow-[0_16px_32px_rgba(0,28,90,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(0,198,255,0.28)]"
              href="/training"
            >
              进入训练桌
            </Link>
          </GlowCard>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <GlowCard data-profile-card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-[#0058be]">训练记录</p>
                <h2 className="mt-1 text-2xl font-black text-[#111c2d]">最近复盘</h2>
              </div>
              <div className="hidden rounded-xl bg-[#f0f3ff] p-1 sm:flex">
                {["全部", "胜利", "复盘"].map((item, index) => (
                  <button
                    className={
                      index === 0
                        ? "rounded-lg bg-[#0058be] px-4 py-2 text-xs font-black text-white"
                        : "rounded-lg px-4 py-2 text-xs font-black text-[#657488]"
                    }
                    key={item}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {trainingRecords.map((record) => (
                <RecordItem key={record.id} record={record} />
              ))}
            </div>
          </GlowCard>

          <GlowCard data-profile-card>
            <p className="text-sm font-black text-[#0058be]">下一轮路线</p>
            <h2 className="mt-1 text-2xl font-black text-[#111c2d]">优先补齐 {weakestSkill.label}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#52657a]">
              你的强项是 {strongestSkill.label}，下一步不要泛练，集中把短板补到 70 分以上。
            </p>
            <div className="mt-5 space-y-3">
              {plan.tasks.map((task, index) => (
                <div className="rounded-2xl border border-[#e7eeff] bg-[#f9fbff] p-4" key={task.id}>
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#d4e3ff] text-sm font-black text-[#0058be]">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-[#111c2d]">{task.title}</h3>
                      <p className="mt-1 text-xs font-semibold leading-5 text-[#657488]">
                        {task.description}
                      </p>
                      <div className="mt-3 flex gap-2 text-xs font-black text-[#0058be]">
                        <span className="rounded-lg bg-[#e7eeff] px-2 py-1">
                          难度 {task.difficulty}
                        </span>
                        <span className="rounded-lg bg-[#e7eeff] px-2 py-1">
                          {task.estimatedMinutes} 分钟
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({
  label,
  tone = "default",
  value
}: {
  label: string;
  tone?: "default" | "danger";
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#f0f7ff] px-4 py-3">
      <p className="text-xs font-black text-[#657488]">{label}</p>
      <p className={tone === "danger" ? "mt-1 text-lg font-black text-[#ba1a1a]" : "mt-1 text-lg font-black text-[#0058be]"}>
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f0f7ff] p-3">
      <p className="text-xs font-black text-[#657488]">{label}</p>
      <p className="mt-1 text-lg font-black text-[#111c2d]">{value}</p>
    </div>
  );
}

function RecordItem({
  record
}: {
  record: {
    icon: string;
    insight: string;
    mode: string;
    status: string;
    statusTone: string;
    time: string;
    title: string;
  };
}) {
  const statusClass =
    record.statusTone === "success"
      ? "bg-[#2170e4] text-white"
      : record.statusTone === "danger"
        ? "bg-[#ffdad6] text-[#ba1a1a]"
        : "bg-[#d8e3fb] text-[#424754]";

  return (
    <div className="rounded-2xl border border-[#e7eeff] bg-white p-4 shadow-[0_10px_28px_rgba(0,88,190,0.04)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0f7ff] text-[#0058be]">
            <span className="material-symbols-outlined text-[22px]">{record.icon}</span>
          </div>
          <div>
            <h3 className="text-base font-black text-[#111c2d]">{record.title}</h3>
            <p className="mt-1 text-sm font-semibold text-[#657488]">{record.mode}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <span className={`rounded-lg px-3 py-1 text-xs font-black ${statusClass}`}>
            {record.status}
          </span>
          <span className="text-sm font-semibold text-[#657488]">{record.time}</span>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#f0f3ff] p-3 text-sm font-semibold leading-6 text-[#52657a]">
        <span className="material-symbols-outlined mt-0.5 text-[18px] text-[#0058be]">
          psychology
        </span>
        <p>{record.insight}</p>
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <Link className="px-3 py-2 text-sm font-black text-[#0058be]" href="/history">
          查看结果
        </Link>
        <Link
          className="rounded-xl bg-[#d8e3fb] px-4 py-2 text-sm font-black text-[#0058be] transition hover:bg-[#c7d7ed]"
          href="/history"
        >
          AI 复盘
        </Link>
      </div>
    </div>
  );
}

function trendLabel(trend: string) {
  if (trend === "up") return "持续提升";
  if (trend === "down") return "需要校准";
  return "稳定观察";
}

function abilityDescription(label: string, score: number, trend: string) {
  if (trend === "up") return `${label} 正在变稳，下一轮继续用实战题巩固判断。`;
  if (trend === "down") return `${label} 是今日优先校准项，Ace 会给出更短的判断路径。`;
  if (score >= 70) return `${label} 已接近稳定区，适合用高压题验证。`;
  return `${label} 还在校准中，建议通过专项训练补齐。`;
}

function radarPointsFromScores(scores: number[]) {
  return scores
    .map((score, index) => {
      const radius = (score / 100) * 104;
      const point = polarPoint(130, 130, radius, -90 + index * (360 / scores.length));
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
