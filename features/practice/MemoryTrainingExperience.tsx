"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { GameArena } from "@/components/game/GameArena";
import type { GameEngineState } from "@/lib/guandan/gameState";
import { CardTracker } from "@/lib/memory/CardTracker";
import { createMemoryQuestion, type MemoryQuestion } from "@/lib/memory/MemoryQuestionGenerator";
import { buildMemoryReport, type MemoryAnswerRecord } from "@/lib/memory/MemoryReport";

type TrainingLevel = "beginner" | "intermediate" | "advanced";

const levels: Array<{ id: TrainingLevel; label: string; goal: string; items: string[] }> = [
  { id: "beginner", label: "初级记牌", goal: "记住关键大牌", items: ["A", "K", "级牌", "大小王"] },
  { id: "intermediate", label: "中级记牌", goal: "计算剩余数量", items: ["A 剩余数量", "2 剩余数量", "王数量", "炸弹可能性"] },
  { id: "advanced", label: "高级记牌", goal: "完成牌局推理", items: ["玩家持牌分析", "剩余牌型判断", "控制牌判断"] }
];

export function MemoryTrainingExperience() {
  const tracker = useMemo(() => new CardTracker(), []);
  const [stage, setStage] = useState<"intro" | "difficulty" | "playing" | "report">("intro");
  const [level, setLevel] = useState<TrainingLevel>("beginner");
  const [state, setState] = useState<GameEngineState | null>(null);
  const [question, setQuestion] = useState<MemoryQuestion | null>(null);
  const [records, setRecords] = useState<MemoryAnswerRecord[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const lastCheckpoint = useRef(0);

  const report = useMemo(() => buildMemoryReport(records), [records]);
  const handleStateChange = useCallback((nextState: GameEngineState) => {
    setState(nextState);
    const historyLength = nextState.history.length;
    if (historyLength > 0 && historyLength % 4 === 0 && lastCheckpoint.current !== historyLength && !question) {
      lastCheckpoint.current = historyLength;
      setQuestion(createMemoryQuestion(tracker.snapshot(nextState.history), historyLength / 4));
      setSelectedAnswer(null);
    }
  }, [question, tracker]);

  function answer(option: string) {
    if (!question || selectedAnswer) return;
    setSelectedAnswer(option);
    setRecords((current) => [...current, { question, answer: option, correct: option === question.answer }]);
  }

  function continueGame() {
    setQuestion(null);
    setSelectedAnswer(null);
  }

  if (stage === "intro") {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-[#071426] px-5 text-white">
        <section className="w-full max-w-md rounded-[30px] border border-[#68d8ff]/30 bg-[#0e2944]/90 p-7 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#74dfff]">MEMORY LAB · AI COACH</p>
          <h1 className="mt-4 text-3xl font-black">AI 掼蛋记牌训练场</h1>
          <p className="mt-5 text-lg font-black leading-8">今天我们不练出牌。</p>
          <p className="mt-1 leading-7 text-[#b8cde0]">你的任务是观察整场牌局，训练自己的记牌能力。AI 会自动进行对局，并在关键节点检查你的记忆。</p>
          <button className="mt-7 min-h-14 w-full rounded-2xl bg-[#0f64ff] text-base font-black shadow-lg" onClick={() => setStage("difficulty")} type="button">开始挑战</button>
        </section>
      </main>
    );
  }

  if (stage === "difficulty") {
    return (
      <main className="min-h-[100dvh] bg-[#071426] px-5 py-10 text-white">
        <section className="mx-auto w-full max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#74dfff]">CHOOSE YOUR TRAINING</p>
          <h1 className="mt-3 text-3xl font-black">选择训练等级</h1>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {levels.map((item) => (
              <button className={`rounded-3xl border p-5 text-left transition ${level === item.id ? "border-[#74dfff] bg-[#123b5c]" : "border-white/10 bg-white/[0.05]"}`} key={item.id} onClick={() => setLevel(item.id)} type="button">
                <p className="text-xl font-black">{item.label}</p>
                <p className="mt-2 text-sm text-[#b8cde0]">目标：{item.goal}</p>
                <div className="mt-5 space-y-2 text-sm font-bold text-[#d8efff]">{item.items.map((value) => <p key={value}>· {value}</p>)}</div>
              </button>
            ))}
          </div>
          <button className="mt-8 min-h-14 w-full rounded-2xl bg-[#0f64ff] text-base font-black md:w-64" onClick={() => setStage("playing")} type="button">进入 AI 牌桌</button>
        </section>
      </main>
    );
  }

  if (stage === "report") {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-[#071426] px-5 text-white">
        <section className="w-full max-w-lg rounded-[30px] border border-[#68d8ff]/30 bg-[#0e2944]/90 p-7 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#74dfff]">AI MEMORY REPORT</p>
          <h1 className="mt-3 text-3xl font-black">AI 记牌训练报告</h1>
          <div className="mt-7 rounded-3xl bg-white/[0.07] p-5 text-center"><p className="text-sm text-[#b8cde0]">记牌准确率</p><p className="mt-2 text-6xl font-black text-[#74dfff]">{report.accuracy}%</p></div>
          <div className="mt-5 space-y-3 text-sm font-bold">{Object.entries(report.categories).map(([name, score]) => <div className="flex items-center justify-between" key={name}><span>{name}</span><span className="text-[#ffd36d]">{"★".repeat(score)}{"☆".repeat(5 - score)}</span></div>)}</div>
          <p className="mt-6 rounded-2xl bg-[#071426]/60 p-4 text-sm leading-6 text-[#d8efff]">AI 建议：{report.advice}</p>
          <button className="mt-6 min-h-12 w-full rounded-2xl bg-[#0f64ff] font-black" onClick={() => window.location.assign("/practice")} type="button">返回训练营</button>
        </section>
      </main>
    );
  }

  return (
    <div className="relative">
      <GameArena observerMode observerLevel={level} observerPaused={Boolean(question)} onObserverStateChange={handleStateChange} />
      {question ? (
        <div className="fixed inset-0 z-[180] grid place-items-center bg-[#071426]/70 px-5 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-[28px] border border-[#74dfff]/45 bg-[#0e2944] p-6 text-white shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#74dfff]">ACE COACH · 记忆检查</p>
            <h2 className="mt-4 text-xl font-black leading-8">让我检查一下你的记牌情况。</h2>
            <p className="mt-4 text-lg font-bold leading-8">{question.prompt}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">{question.options.map((option) => <button className={`min-h-12 rounded-2xl border font-black ${selectedAnswer === option ? option === question.answer ? "border-emerald-300 bg-emerald-400/20" : "border-red-300 bg-red-400/20" : "border-white/15 bg-white/[0.07]"}`} disabled={Boolean(selectedAnswer)} key={option} onClick={() => answer(option)} type="button">{option}</button>)}</div>
            {selectedAnswer ? <div className="mt-5 rounded-2xl bg-white/[0.08] p-4 text-sm leading-6"><p className="font-black">{selectedAnswer === question.answer ? "很好，你已经准确追踪到当前牌局变化。" : "这里容易遗漏，回想刚才几轮 AI 打出的牌。"}</p><p className="mt-2 text-[#b8cde0]">正确答案：{question.answer}。{question.explanation}</p><button className="mt-4 min-h-11 w-full rounded-xl bg-[#0f64ff] font-black" onClick={continueGame} type="button">继续观察</button>{records.length >= 3 ? <button className="mt-2 min-h-10 w-full rounded-xl border border-white/15 font-black" onClick={() => { setQuestion(null); setStage("report"); }} type="button">查看训练报告</button> : null}</div> : null}
          </section>
        </div>
      ) : null}
      {state?.gameStatus === "finished" && !question ? <button className="fixed bottom-8 left-1/2 z-[160] -translate-x-1/2 rounded-full bg-[#0f64ff] px-6 py-4 font-black text-white shadow-xl" onClick={() => setStage("report")} type="button">查看训练报告</button> : null}
    </div>
  );
}
