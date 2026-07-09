import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";

const filters = ["全部", "胜利", "复盘"];

const records = [
  {
    id: "endgame",
    icon: "extension",
    title: "残局分析训练",
    subtitle: "基础对抗模式 · 第一阶段",
    status: "Victory",
    tone: "success",
    time: "昨天 14:30",
    insight: "本局主要问题：没有及时判断炸弹价值，导致后期失去主动权。"
  },
  {
    id: "bomb",
    icon: "gavel",
    title: "炸弹判断实战",
    subtitle: "高级博弈模式 · 第五阶段",
    status: "Failure",
    tone: "danger",
    time: "3 天前",
    insight: "防守策略过于保守，在对手剩三张牌时未能果断压制，建议重修强手博弈。"
  },
  {
    id: "team",
    icon: "groups",
    title: "队友配合强化",
    subtitle: "团队意识模式 · 模拟对局",
    status: "To Review",
    tone: "neutral",
    time: "4 天前",
    insight: "对局已完成，Ace 正在分析队友协同数据，点击 AI 复盘查看深度建议。"
  },
  {
    id: "control",
    icon: "speed",
    title: "控牌逻辑训练",
    subtitle: "基础逻辑模式 · 进阶版",
    status: "Victory",
    tone: "success",
    time: "5 天前",
    insight: "控牌思路清晰，准确预判了对手的单牌走势，是一次标准的高水平对局。"
  }
];

export default function HistoryPage() {
  return (
    <AppShell title="我的记录" subtitle="训练结果、错因和复盘建议都沉淀在这里。" variant="wide">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="grid overflow-hidden rounded-[24px] border border-[#d8e3fb] bg-white/80 shadow-[0_20px_60px_rgba(0,88,190,0.06)] backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="p-6 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-xl bg-[#d8e3fb] px-3 py-1.5 text-xs font-black text-[#0058be]">
              <span className="material-symbols-outlined text-[16px]">summarize</span>
              训练总结
            </div>
            <h2 className="mt-5 text-2xl font-black leading-tight text-[#111c2d] sm:text-4xl">
              胜率提升明显，继续保持。
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <SummaryStat label="最近完成" value="12 次训练" />
              <SummaryStat label="胜率状态" value="持续提升中" />
              <SummaryStat label="待加强项" value="残局判断能力" tone="danger" />
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0058be] px-6 text-sm font-black text-white shadow-[0_12px_26px_rgba(0,88,190,0.24)] transition hover:bg-[#2170e4]"
                href="/training"
              >
                继续训练
              </a>
              <a
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#0058be] bg-white px-6 text-sm font-black text-[#0058be] transition hover:bg-[#f0f3ff]"
                href="/profile"
              >
                查看能力分析
              </a>
            </div>
          </div>
          <div className="hidden items-center justify-center bg-[#f0f7ff] p-6 sm:flex">
            <Image
              alt="Ace 连胜庆祝"
              className="h-56 w-56 object-contain drop-shadow-2xl"
              height={224}
              src="/assets/coach/coach-victory-celebration.png"
              width={224}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-black text-[#111c2d]">训练记录</h3>
            <div className="flex w-fit rounded-xl bg-[#e7eeff] p-1">
              {filters.map((filter, index) => (
                <button
                  className={
                    index === 0
                      ? "rounded-lg bg-[#0058be] px-4 py-2 text-sm font-black text-white"
                      : "rounded-lg px-4 py-2 text-sm font-black text-[#424754] transition hover:text-[#0058be]"
                  }
                  key={filter}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {records.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>

          <div className="flex justify-center py-5">
            <button
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black text-[#424754] transition hover:bg-[#e7eeff] hover:text-[#0058be]"
              type="button"
            >
              加载更多记录
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function SummaryStat({
  label,
  tone = "default",
  value
}: {
  label: string;
  tone?: "default" | "danger";
  value: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#727785]">{label}</p>
      <p className={tone === "danger" ? "mt-1 text-xl font-black text-[#ba1a1a]" : "mt-1 text-xl font-black text-[#0058be]"}>
        {value}
      </p>
    </div>
  );
}

function RecordCard({
  record
}: {
  record: {
    icon: string;
    insight: string;
    status: string;
    subtitle: string;
    time: string;
    title: string;
    tone: string;
  };
}) {
  const statusClass =
    record.tone === "success"
      ? "bg-[#2170e4] text-white"
      : record.tone === "danger"
        ? "bg-[#ffdad6] text-[#ba1a1a]"
        : "bg-[#d8e3fb] text-[#424754]";

  return (
    <article className="rounded-2xl border border-[#d8e3fb] bg-white/80 p-5 shadow-[0_12px_34px_rgba(0,88,190,0.05)] backdrop-blur transition hover:border-[#adc6ff]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className={
              record.tone === "danger"
                ? "grid h-11 w-11 place-items-center rounded-xl bg-[#ffdad6] text-[#ba1a1a]"
                : "grid h-11 w-11 place-items-center rounded-xl bg-[#e7eeff] text-[#0058be]"
            }
          >
            <span className="material-symbols-outlined text-[22px]">{record.icon}</span>
          </div>
          <div>
            <h4 className="text-base font-black text-[#111c2d]">{record.title}</h4>
            <p className="mt-1 text-sm font-semibold text-[#657488]">{record.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`rounded-lg px-3 py-1 text-xs font-black uppercase ${statusClass}`}>
            {record.status}
          </span>
          <span className="text-sm font-semibold text-[#657488]">{record.time}</span>
        </div>
      </div>
      <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#f0f3ff] p-4 text-sm font-semibold leading-6 text-[#424754]">
        <span className="material-symbols-outlined mt-0.5 text-[18px] text-[#0058be]">
          psychology
        </span>
        <p>{record.insight}</p>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <a className="px-3 py-2 text-sm font-black text-[#0058be]" href="/complete">
          查看结果
        </a>
        <a
          className="rounded-xl bg-[#d8e3fb] px-4 py-2 text-sm font-black text-[#0058be] transition hover:bg-[#cfdaf2]"
          href="/coach"
        >
          AI 复盘
        </a>
      </div>
    </article>
  );
}
