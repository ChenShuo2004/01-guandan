import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";

const profileItems = [
  { label: "牌权", value: "78%" },
  { label: "残局", value: "68%" },
  { label: "配合", value: "74%" }
];

export default function ProfilePage() {
  return (
    <AppShell title="个人能力分析" subtitle="查看能力变化和下一步训练方向。" variant="wide">
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_260px]">
        <section className="rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
          <p className="text-sm font-black text-[#0058be]">总分</p>
          <div className="mt-8 flex justify-center">
            <div className="flex h-56 w-56 items-center justify-center rounded-full border-[18px] border-[#d4e3ff] shadow-[inset_0_0_0_10px_#f9f9ff]">
              <div className="text-center">
                <p className="text-5xl font-black text-[#0058be]">2,840</p>
                <p className="mt-2 text-sm font-black text-[#727785]">综合能力</p>
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-3">
            {profileItems.map((item) => (
              <div className="rounded-2xl bg-[#f0f3ff] p-4" key={item.label}>
                <div className="flex items-center justify-between text-sm font-black">
                  <span>{item.label}</span>
                  <span className="text-[#0058be]">{item.value}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[#d8e3fb]">
                  <div className="h-full rounded-full bg-[#0058be]" style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
          <h2 className="text-xl font-black text-[#0058be]">能力雷达</h2>
          <div className="mt-8 flex justify-center">
            <svg className="h-80 w-80" viewBox="0 0 240 240">
              {[96, 72, 48, 24].map((radius) => (
                <polygon
                  fill="none"
                  key={radius}
                  points={radarPoints(120, 120, radius)}
                  stroke="#c2c6d6"
                />
              ))}
              <polygon
                fill="rgba(33,112,228,0.22)"
                points="120,30 194,87 170,182 72,190 48,92"
                stroke="#0058be"
                strokeWidth="5"
              />
              {["牌型", "牌权", "炸弹", "残局", "配合"].map((label, index) => {
                const p = polarPoint(120, 120, 118, -90 + index * 72);
                return (
                  <text
                    fill="#424754"
                    fontSize="13"
                    fontWeight="800"
                    key={label}
                    textAnchor="middle"
                    x={p.x}
                    y={p.y}
                  >
                    {label}
                  </text>
                );
              })}
            </svg>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Insight title="优势" text="牌型理解稳定，能快速识别主牌结构。" />
            <Insight title="待提升" text="残局分析需要更多关键轮次训练。" />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[24px] bg-[#0058be] p-6 text-white shadow-[0_20px_60px_rgba(0,88,190,0.18)]">
            <Image
              alt="Ace 建议"
              className="mx-auto h-40 w-40 object-contain"
              height={160}
              src="/assets/coach/coach-streak-encouragement.png"
              width={160}
            />
            <h3 className="mt-5 text-xl font-black">下一步建议</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#ecf1ff]">
              今天优先完成残局判断专项，先把出炸时机练稳。
            </p>
            <Button className="mt-6 w-full border-white bg-white text-[#0058be] hover:bg-[#ecf1ff]" href="/practice" variant="secondary">
              去训练
            </Button>
          </section>

          <section className="rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
            <p className="text-sm font-black text-[#0058be]">近期表现</p>
            <div className="mt-5 space-y-3 text-sm font-semibold text-[#424754]">
              <p>完成训练：12 次</p>
              <p>连续学习：7 天</p>
              <p>胜率提升：+12%</p>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

function Insight({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-2xl bg-[#f0f3ff] p-4">
      <p className="font-black text-[#0058be]">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#424754]">{text}</p>
    </div>
  );
}

function radarPoints(cx: number, cy: number, radius: number) {
  return Array.from({ length: 5 })
    .map((_, index) => {
      const p = polarPoint(cx, cy, radius, -90 + index * 72);
      return `${p.x},${p.y}`;
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
