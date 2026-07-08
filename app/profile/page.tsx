import { AppShell } from "@/components/layout/AppShell";
import { analyzeGrowth } from "@/lib/player/GrowthAnalyzer";
import { defaultPlayerModel } from "@/lib/profile/PlayerModel";
import { buildTrainingPlan } from "@/lib/training/TrainingPlanner";

const levelTrack = ["青铜", "白银", "黄金", "大师"];
const achievements = [
  { title: "连续训练", value: "3 天" },
  { title: "牌型稳定", value: "78 分" },
  { title: "Coach 记录", value: "2 条" }
];

export default function ProfilePage() {
  const analysis = analyzeGrowth();
  const profile = analysis.profile;
  const plan = buildTrainingPlan(profile);
  const radarPointsValue = radarPointsFromScores(profile.skills.map((skill) => skill.score));

  return (
    <AppShell title="个人成长系统" subtitle="查看你的掼蛋能力画像、训练地图和 AI Coach 记忆。" variant="wide">
      <div className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)_300px]">
        <section className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
          <p className="text-sm font-black text-[#0058be]">我的段位</p>
          <div className="mt-6 rounded-[26px] bg-[linear-gradient(145deg,#eaf8ff,#ffffff)] p-5 text-center">
            <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border-[10px] border-[#d4e3ff] bg-white shadow-inner">
              <span className="text-3xl font-black text-[#0058be]">{profile.level}</span>
            </div>
            <p className="mt-4 text-4xl font-black text-[#12395a]">{profile.totalScore}</p>
            <p className="mt-1 text-sm font-bold text-[#657488]">综合成长分</p>
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
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#dcecff]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#4bb8ff,#16c9bd)]"
                style={{ width: `${(profile.levelIndex / (levelTrack.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
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
                {[100, 76, 52, 28].map((radius) => (
                  <polygon
                    fill="none"
                    key={radius}
                    points={radarPolygon(130, 130, radius, profile.skills.length)}
                    stroke="#c7d7ed"
                  />
                ))}
                <polygon
                  fill="rgba(75,184,255,0.24)"
                  points={radarPointsValue}
                  stroke="#0058be"
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

            <div className="grid content-start gap-3 md:grid-cols-2">
              {profile.skills.map((skill) => (
                <div className="rounded-2xl bg-[#f0f7ff] p-4" key={skill.key}>
                  <div className="flex items-center justify-between gap-3 text-sm font-black">
                    <span>{skill.label}</span>
                    <span className="text-[#0058be]">{skill.score}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[#d7e8ff]">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#4bb8ff,#16c9bd)]" style={{ width: `${skill.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-5">
          <section className="rounded-[28px] bg-[#0058be] p-6 text-white shadow-[0_20px_60px_rgba(0,88,190,0.18)]">
            <p className="text-sm font-black text-[#bfe9ff]">AI Coach 今日计划</p>
            <h3 className="mt-3 text-2xl font-black">{plan.title}</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#ecf7ff]">{plan.focusReason}</p>
            <a
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white text-sm font-black text-[#0058be] transition hover:-translate-y-0.5"
              href="/training"
            >
              进入训练桌
            </a>
          </section>

          <section className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
            <p className="text-sm font-black text-[#0058be]">Coach 记忆</p>
            <div className="mt-4 space-y-3">
              {defaultPlayerModel.coachMemory.map((note) => (
                <div className="rounded-2xl bg-[#f0f7ff] p-4" key={note.id}>
                  <p className="font-black text-[#12395a]">{note.title}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#52657a]">{note.content}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
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
              <div className="relative rounded-[24px] bg-[#f0f7ff] p-5" key={task.id}>
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
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
          <p className="text-sm font-black text-[#0058be]">成就</p>
          <div className="mt-5 grid gap-3">
            {achievements.map((item) => (
              <div className="flex items-center justify-between rounded-2xl bg-[#f0f7ff] p-4" key={item.title}>
                <span className="font-black text-[#12395a]">{item.title}</span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#0058be]">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
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
