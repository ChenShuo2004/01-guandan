"use client";

import { useEffect, useState } from "react";
import type { MemoryMethod } from "@/content/memory-methods";

const leftPositions = [
  ["脚尖", "王"],
  ["前脚掌", "级牌"],
  ["脚跟", "A"],
  ["向内", "K"],
  ["向外", "Q"]
];
const rightPositions = [
  ["放平", "0 张"],
  ["脚尖", "1 张"],
  ["前脚掌", "2 张"],
  ["脚跟", "3 张"],
  ["整脚", "4 张"]
];

export function FootPositionDiagram({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setActive((value) => {
        if (value >= 4) {
          window.clearInterval(timer);
          setPlaying(false);
          return 0;
        }
        return value + 1;
      });
    }, 720);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <div className={`rounded-2xl border border-[#b9dcf5] bg-[#eef8ff] p-4 ${compact ? "text-xs" : ""}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-black text-[#12395a]">脚步映射演示</p>
        <button
          className="min-h-10 rounded-xl bg-[#12395a] px-3 font-black text-white transition hover:-translate-y-0.5 active:scale-95"
          onClick={() => {
            setActive(0);
            setPlaying(true);
          }}
          type="button"
        >
          {playing ? "演示中…" : "开始演示"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MappingColumn active={active} label="左脚 · 牌种" positions={leftPositions} />
        <MappingColumn active={active} label="右脚 · 数量" positions={rightPositions} />
      </div>
      <div className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-center font-black text-[#1d5b84]">
        牌种定位 <span className="mx-1 text-[#5d9bc6]">→</span> 观察出牌
        <span className="mx-1 text-[#5d9bc6]">→</span> 更新数量 <span className="mx-1 text-[#5d9bc6]">→</span> 恢复自然
      </div>
    </div>
  );
}

function MappingColumn({ active, label, positions }: { active: number; label: string; positions: string[][] }) {
  return (
    <div className="rounded-xl border border-[#d6eafa] bg-white p-3">
      <p className="mb-2 font-black text-[#12395a]">{label}</p>
      <div className="space-y-1.5">
        {positions.map(([position, value], index) => (
          <button
            className={`flex min-h-9 w-full items-center justify-between rounded-lg border px-2 text-left font-bold transition ${
              active === index ? "border-[#f2b84b] bg-[#fff4d9] text-[#8c5b06]" : "border-transparent bg-[#f5faff] text-[#416b86]"
            }`}
            key={position}
            onClick={() => undefined}
            type="button"
          >
            <span>{position}</span>
            <span>{value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MethodMappingDemo({ method }: { method: MemoryMethod }) {
  if (method.id === "foot-position") return <FootPositionDiagram />;

  const labels = method.id === "mental-zones"
    ? ["王 · 4", "级牌 · 8", "A · 8", "K · 8"]
    : method.id === "number-sequence"
      ? ["王 4", "级牌 8", "A 8", "K 8"]
      : method.id === "visual-snapshot"
        ? ["开局", "第一圈", "中盘", "残局"]
        : method.id === "player-association"
          ? ["上家 · A ×1", "对家 · 炸弹", "下家 · 王 ×1"]
          : ["脚步：王、级牌", "数字：A、K", "玩家：炸弹"];

  return (
    <div className="rounded-2xl border border-[#b9dcf5] bg-[#eef8ff] p-4">
      <p className="mb-3 font-black text-[#12395a]">记忆映射</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {labels.map((label, index) => (
          <div className="flex items-center justify-between rounded-xl bg-white px-3 py-3 font-black text-[#24557a]" key={label}>
            <span>{label}</span>
            <span className="text-[#f0a923]">{index === labels.length - 1 ? "当前" : "已记录"}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-center text-sm font-black text-[#1d5b84]">
        {method.slogan}
      </div>
    </div>
  );
}

export function MethodPrincipleFlow({ method }: { method: MemoryMethod }) {
  return (
    <div className="grid gap-2 sm:grid-cols-5">
      {method.steps.map((step, index) => (
        <div className="relative rounded-xl border border-[#d6eafa] bg-white px-3 py-3 text-center" key={step.id}>
          <span className="mx-auto mb-2 grid h-7 w-7 place-items-center rounded-full bg-[#dcefff] text-xs font-black text-[#176192]">
            {index + 1}
          </span>
          <p className="text-sm font-black text-[#12395a]">{step.title}</p>
          {index < method.steps.length - 1 ? <span className="absolute -right-2 top-1/2 hidden text-[#5d9bc6] sm:block">→</span> : null}
        </div>
      ))}
    </div>
  );
}

export function MethodScenarioDemo({ method }: { method: MemoryMethod }) {
  const scenario = method.scenarios[0];
  return (
    <div className="rounded-2xl border border-[#d6eafa] bg-[#f7fbff] p-4">
      <p className="font-black text-[#12395a]">{scenario.title}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        {[["当前", scenario.initialState], ["事件", scenario.event], ["更新", scenario.calculation], ["结果", scenario.result]].map(([label, value]) => (
          <div className="rounded-xl bg-white p-3" key={label}>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#6b99b6]">{label}</p>
            <p className="mt-1 text-sm font-bold leading-6 text-[#24557a]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
