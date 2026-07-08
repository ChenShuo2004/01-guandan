import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";

const dimensions = [
  { icon: "style", title: "牌型理解", desc: "判断组合和主牌结构", score: "82" },
  { icon: "bolt", title: "控牌能力", desc: "掌控出牌节奏", score: "76" },
  { icon: "psychology", title: "残局判断", desc: "关键轮次选择", score: "68" },
  { icon: "groups", title: "配合意识", desc: "识别队友意图", score: "74" }
];

export default function CoachPage() {
  return (
    <AppShell title="能力诊断" subtitle="发现你的核心实力，生成下一步训练建议。" variant="wide">
      <div className="space-y-6">
        <section className="grid gap-6 rounded-[24px] bg-white p-8 shadow-[0_20px_60px_rgba(0,88,190,0.06)] lg:grid-cols-[1fr_300px]">
          <div>
            <p className="text-sm font-black uppercase text-[#0058be]">Diagnostic</p>
            <h2 className="mt-3 text-4xl font-black leading-[3rem]">
              发现你的
              <span className="text-[#0058be]"> 核心实力</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-[#424754]">
              Ace 会从牌型、牌权、残局和配合四个维度评估当前水平，并推荐最值得训练的一项。
            </p>
            <Button className="mt-8 h-14 min-w-40 text-base" href="/practice">
              开始诊断
            </Button>
          </div>
          <div className="rounded-[22px] bg-[#e7eeff] p-6">
            <Image
              alt="Ace 分析模式"
              className="mx-auto h-44 w-44 object-contain"
              height={176}
              src="/assets/coach/coach-analysis-mode.png"
              width={176}
            />
            <div className="mt-4 rounded-2xl bg-white p-4 text-center">
              <p className="text-sm font-bold text-[#727785]">AI 评估可信度</p>
              <p className="mt-1 text-3xl font-black text-[#0058be]">82%</p>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
          <h3 className="text-lg font-black text-[#0058be]">测评维度</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dimensions.map((item) => (
              <div className="rounded-[18px] border border-[#d8e3fb] bg-[#f9f9ff] p-5" key={item.title}>
                <span className="material-symbols-outlined rounded-xl bg-[#d4e3ff] p-3 text-[26px] text-[#0058be]">
                  {item.icon}
                </span>
                <h4 className="mt-5 text-lg font-black">{item.title}</h4>
                <p className="mt-2 text-sm font-semibold text-[#727785]">{item.desc}</p>
                <div className="mt-5 h-2 rounded-full bg-[#e7eeff]">
                  <div className="h-full rounded-full bg-[#0058be]" style={{ width: `${item.score}%` }} />
                </div>
                <p className="mt-2 text-sm font-black text-[#0058be]">{item.score} 分</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
