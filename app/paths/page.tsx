import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";

const trainingCards = [
  { icon: "style", title: "基础牌型", desc: "先建立稳定识别", tag: "Beginner" },
  { icon: "sports_esports", title: "残局判断", desc: "关键轮次做选择", tag: "Hot" },
  { icon: "groups", title: "队友配合", desc: "看懂对家意图", tag: "Team" },
  { icon: "military_tech", title: "高级策略", desc: "整局节奏控制", tag: "Pro" }
];

export default function PathsPage() {
  return (
    <AppShell title="训练中心" subtitle="掌控你的策略，Ace 会按路径安排训练。" variant="wide">
      <div className="space-y-6">
        <section className="grid gap-6 rounded-[24px] bg-white p-8 shadow-[0_20px_60px_rgba(0,88,190,0.06)] lg:grid-cols-[1fr_280px]">
          <div>
            <p className="text-sm font-black text-[#0058be]">训练中心</p>
            <h2 className="mt-3 text-4xl font-black leading-[3rem]">掌控你的策略，Ace。</h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-[#424754]">
              从基础理解到残局分析，每个模块都用短训练完成一次明确提升。
            </p>
            <div className="mt-8 flex gap-3">
              <Button href="/practice">继续训练</Button>
              <Button href="/coach" variant="secondary">重新诊断</Button>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-[22px] bg-[#e7eeff]">
            <Image
              alt="Ace 训练中心"
              className="h-48 w-48 object-contain"
              height={192}
              src="/assets/coach/coach-bubble-hologram.png"
              width={192}
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trainingCards.map((card) => (
            <div className="rounded-[22px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]" key={card.title}>
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined rounded-xl bg-[#d4e3ff] p-3 text-[#0058be]">
                  {card.icon}
                </span>
                <span className="rounded-full bg-[#ffdcc6] px-3 py-1 text-xs font-black text-[#924700]">
                  {card.tag}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-black">{card.title}</h3>
              <p className="mt-2 text-sm font-semibold text-[#727785]">{card.desc}</p>
              <Button className="mt-6 w-full" href="/practice" variant="secondary">
                进入训练
              </Button>
            </div>
          ))}
        </section>

        <section className="rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
          <h3 className="text-lg font-black text-[#0058be]">进阶路径</h3>
          <div className="mt-6 grid gap-3">
            {["基础理解", "牌型判断", "控牌能力", "残局分析"].map((step, index) => (
              <div className="flex items-center gap-4 rounded-2xl bg-[#f0f3ff] p-4" key={step}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0058be] text-sm font-black text-white">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-black">{step}</p>
                  <p className="text-sm font-semibold text-[#727785]">完成一个判断训练，解锁下一阶段。</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
