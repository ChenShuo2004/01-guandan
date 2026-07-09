import { AppShell } from "@/components/layout/AppShell";
import { AnimatedProgress } from "@/components/ui/AnimatedProgress";
import { GlowCard } from "@/components/ui/GlowCard";
import { MagicBento, type MagicBentoItem } from "@/components/ui/MagicBento";
import { MasonryAnimation } from "@/components/ui/MasonryAnimation";
import { RankFrame } from "@/components/ui/RankFrame";
import { analyzeGrowth } from "@/lib/player/GrowthAnalyzer";
import { defaultPlayerModel } from "@/lib/profile/PlayerModel";
import { buildTrainingPlan } from "@/lib/training/TrainingPlanner";

const levelTrack = ["青铜", "白银", "黄金", "大师"];

export default function ProfilePage() {
  const analysis = analyzeGrowth();
  const profile = analysis.profile;
  const plan = buildTrainingPlan(profile);
  const radarPointsValue = radarPointsFromScores(profile.skills.map((skill) => skill.score));
  const abilityItems: MagicBentoItem[] = profile.skills.map((skill) => ({
    id: skill.key,
    title: skill.label,
    score: skill.score,
    label: trendLabel(skill.trend),
    description: abilityDescription(skill.label, skill.score, skill.trend)
  }));

  return (
    <AppShell title="个人成长系统" subtitle="Ace 正在把每次训练沉淀成你的能力档案。" variant="wide">
      <MasonryAnimation
        animateFrom="bottom"
        blurToFocus
        className="profile-training-space"
        duration={0.6}
        ease="power3.out"
        hoverScale={0.98}
        scaleOnHover
        stagger={0.08}
      >
        <div data-profile-background />

        <div className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)_300px]">
          <GlowCard data-profile-card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-[#0058be]">段位成长卡</p>
                <h2 className="mt-1 text-2xl font-black text-[#12395a]">AI Rank Profile</h2>
              </div>
              <span className="rounded-full bg-[#eaf8ff] px-3 py-1 text-xs font-black text-[#0066ff]">
                Live
              </span>
            </div>

            <div className="mt-6 rounded-[26px] border border-[#d9ebff] bg-[linear-gradient(145deg,#f4fbff,#ffffff)] p-4 text-center shadow-inner">
              <RankFrame label="综合积分" level={profile.level} score={profile.totalScore} />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <Metric label="胜率" value={`${profile.winRate}%`} />
              <Metric label="训练" value={`${profile.completedTrainings}`} />
              <Metric label="连胜" value={`${profile.streakDays}`} />
            </div>

            <div className="mt-6">
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
          </GlowCard>

          <GlowCard data-profile-card>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-black text-[#0058be]">能力雷达</p>
                <h2 className="mt-1 text-2xl font-black text-[#12395a]">从“能打”走向“会赢”</h2>
              </div>
              <span className="rounded-full bg-[#eaf8ff] px-4 py-2 text-sm font-black text-[#0058be]">
                {plan.difficultyLabel}
              </span>
            </div>

            <div className="mt-6 grid gap-6">
              <div className="flex justify-center">
                <svg className="h-[320px] w-[320px]" viewBox="0 0 260 260">
                  <defs>
                    <filter id="profileRadarGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur result="blur" stdDeviation="5" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {[100, 76, 52, 28].map((radius) => (
                    <polygon
                      fill="none"
                      key={radius}
                      points={radarPolygon(130, 130, radius, profile.skills.length)}
                      stroke="#c7d7ed"
                    />
                  ))}
                  <polygon
                    fill="rgba(0,198,255,0.18)"
                    filter="url(#profileRadarGlow)"
                    points={radarPointsValue}
                    stroke="#0066ff"
                    strokeWidth="4"
                  />
                  {profile.skills.map((skill, index) => {
                    const p = polarPoint(130, 130, 122, -90 + index * (360 / profile.skills.length));
                    return (
                      <text
                        fill="#334155"
                        fontSize="12"
                        fontWeight="800"
                        key={skill.key}
                        textAnchor="middle"
                        x={p.x}
                        y={p.y}
                      >
                        {skill.label}
                      </text>
                    );
                  })}
                </svg>
              </div>

              <MagicBento
                clickEffect
                enableBorderGlow
                enableMagnetism
                enableSpotlight
                enableStars
                enableTilt
                glowColor="0, 180, 255"
                items={abilityItems}
                particleCount={12}
                spotlightRadius={300}
              />
            </div>
          </GlowCard>

          <GlowCard
            className="ai-coach-card text-white shadow-[0_22px_70px_rgba(0,88,190,0.24)]"
            data-profile-card
          >
            <div className="ai-coach-dots" />
            <div className="ai-coach-scan" />

            <p className="text-sm font-black text-[#bfe9ff]">AI Coach 今日计划</p>
            <h3 className="mt-3 text-2xl font-black leading-tight">{plan.title}</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#ecf7ff]">{plan.focusReason}</p>

            <div className="mt-5 rounded-[22px] border border-white/20 bg-white/12 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#d8f6ff]">
                  Ace Memory
                </span>
                <span className="h-2 w-2 rounded-full bg-[#8cffef] shadow-[0_0_18px_rgba(140,255,239,0.86)]" />
              </div>
              <div className="mt-3 space-y-3">
                {defaultPlayerModel.coachMemory.slice(0, 2).map((note) => (
                  <div key={note.id}>
                    <p className="text-sm font-black">{note.title}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-[#dff6ff]">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <a
              className="ripple-button mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white text-sm font-black text-[#0058be] shadow-[0_16px_32px_rgba(0,28,90,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(0,198,255,0.28)]"
              href="/training"
            >
              进入训练桌
            </a>
          </GlowCard>
        </div>

        <GlowCard className="mt-5" data-profile-card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[#0058be]">训练地图</p>
              <h2 className="mt-1 text-2xl font-black text-[#12395a]">下一轮成长路线</h2>
            </div>
            <span className="rounded-full bg-[#eaf8ff] px-4 py-2 text-sm font-black text-[#0058be]">
              {plan.tasks.length} 个任务
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {plan.tasks.map((task, index) => (
              <div
                className="relative overflow-hidden rounded-[24px] border border-[#d9ebff] bg-[#f0f7ff] p-5 transition hover:-translate-y-1 hover:border-[#9ee7ff] hover:shadow-[0_18px_40px_rgba(0,102,255,0.1)]"
                key={task.id}
              >
                <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[radial-gradient(circle,rgba(0,198,255,0.24),transparent_68%)]" />
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#4bb8ff] text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-black text-[#12395a]">{task.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#52657a]">{task.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs font-black text-[#0058be]">
                  <span>难度 {task.difficulty}</span>
                  <span>{task.estimatedMinutes} 分钟</span>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>
      </MasonryAnimation>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f0f7ff] px-3 py-4">
      <p className="text-xs font-black text-[#657488]">{label}</p>
      <p className="mt-1 text-xl font-black text-[#0058be]">{value}</p>
    </div>
  );
}

function trendLabel(trend: string) {
  if (trend === "up") return "Improving";
  if (trend === "down") return "Needs Focus";
  return "Stable";
}

function abilityDescription(label: string, score: number, trend: string) {
  if (trend === "up") return `${label} 正在变稳，下一轮训练继续巩固关键判断。`;
  if (trend === "down") return `${label} 是今日优先校准项，Ace 会给出更短的判断路径。`;
  if (score >= 70) return `${label} 已接近稳定区，适合用实战题验证。`;
  return `${label} 还在校准中，建议通过专项训练补齐。`;
}

function radarPointsFromScores(scores: number[]) {
  return scores
    .map((score, index) => {
      const point = polarPoint(130, 130, score, -90 + index * (360 / scores.length));
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

function radarPolygon(cx: number, cy: number, radius: number, count: number) {
  return Array.from({ length: count })
    .map((_, index) => {
      const point = polarPoint(cx, cy, radius, -90 + index * (360 / count));
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
