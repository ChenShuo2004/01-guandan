"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { GameArena } from "@/components/game/GameArena";
import type { GameEngineState } from "@/lib/guandan/gameState";
import { CardTracker } from "@/lib/memory/CardTracker";
import { createMemoryQuestion, type MemoryQuestion } from "@/lib/memory/MemoryQuestionGenerator";
import { buildMemoryReport, type MemoryAnswerRecord } from "@/lib/memory/MemoryReport";

export function MemoryTrainingExperience() {
  const tracker = useMemo(() => new CardTracker(), []);
  const [stage, setStage] = useState<"intro" | "playing" | "report">("intro");
  const [state, setState] = useState<GameEngineState | null>(null);
  const [question, setQuestion] = useState<MemoryQuestion | null>(null);
  const [records, setRecords] = useState<MemoryAnswerRecord[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const lastCheckpoint = useRef(0);

  const report = useMemo(() => buildMemoryReport(records), [records]);
  const memorySnapshot = useMemo(() => tracker.snapshot(state?.history ?? []), [state?.history, tracker]);
  const appeared = (label: string) => {
    return memorySnapshot.appeared[label] ?? 0;
  };

  const handleStateChange = useCallback((nextState: GameEngineState) => {
    setState(nextState);
    const historyLength = nextState.history.length;
    if (historyLength > 0 && historyLength % 4 === 0 && lastCheckpoint.current !== historyLength && !question) {
      lastCheckpoint.current = historyLength;
      setQuestion(createQuantityChallenge(nextState.history, tracker, historyLength / 4));
      setSelectedAnswer(null);
    }
  }, [question, tracker]);

  function openMemoryTest() {
    if (!state || state.history.length === 0 || question) return;
    setQuestion(createQuantityChallenge(state.history, tracker, Math.max(1, Math.ceil(state.history.length / 4))));
    setSelectedAnswer(null);
  }

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
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#74dfff]">MEMORY TRAINING</p>
          <h1 className="mt-4 text-3xl font-black">掼蛋记牌训练场</h1>
          <p className="mt-5 text-lg font-black leading-8">本轮不练出牌，只训练你记住牌面变化。</p>
          <p className="mt-1 leading-7 text-[#b8cde0]">AI 会自动进行牌局。请观察已经出现的关键牌，在测试节点回答当前牌数量。</p>
          <div className="mt-5 rounded-2xl bg-white/[0.06] p-4 text-sm leading-6 text-[#d8efff]">
            训练目标：记住已经出现的炸弹、A、2 和大小王。
          </div>
          <button className="mt-7 min-h-14 w-full rounded-2xl bg-[#0f64ff] text-base font-black shadow-lg" onClick={() => setStage("playing")} type="button">
            开始训练
          </button>
        </section>
      </main>
    );
  }

  if (stage === "report") {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-[#071426] px-5 text-white">
        <section className="w-full max-w-lg rounded-[30px] border border-[#68d8ff]/30 bg-[#0e2944]/90 p-7 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#74dfff]">MEMORY REPORT</p>
          <h1 className="mt-3 text-3xl font-black">记牌训练总结</h1>
          <div className="mt-7 rounded-3xl bg-white/[0.07] p-5 text-center"><p className="text-sm text-[#b8cde0]">记牌准确率</p><p className="mt-2 text-6xl font-black text-[#74dfff]">{report.accuracy}%</p></div>
          <p className="mt-6 rounded-2xl bg-[#071426]/60 p-4 text-sm leading-6 text-[#d8efff]">{report.advice}</p>
          <button className="mt-6 min-h-12 w-full rounded-2xl bg-[#0f64ff] font-black" onClick={() => window.location.assign("/practice")} type="button">返回训练大厅</button>
        </section>
      </main>
    );
  }

  return (
    <div className="relative">
      <GameArena observerMode observerPaused={Boolean(question)} onObserverStateChange={handleStateChange} />
      <aside className="pointer-events-none fixed left-4 top-[104px] z-[100] w-[min(270px,24vw)] rounded-2xl border border-white/60 bg-white/80 p-4 text-[#12395a] shadow-xl backdrop-blur-xl max-lg:hidden">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f64ff]">训练状态</p>
        <p className="mt-3 text-lg font-black">记牌专项训练</p>
        <p className="mt-2 text-sm font-bold leading-6">本轮目标：记住已出现的炸弹和关键牌。</p>
        <div className="mt-4 flex items-center justify-between border-t border-[#b7d9ea] pt-3 text-sm font-black"><span>当前阶段</span><span className="text-[#0f64ff]">{state?.gameStatus === "finished" ? "已完成" : "观察中"}</span></div>
        <p className="mt-3 text-sm font-bold leading-6 text-[#345f78]">{state?.gameStatus === "finished" ? "训练结束，可以查看结果。" : "牌局正在自动推进，请专注观察。"}</p>
      </aside>
      <aside className="pointer-events-auto fixed right-4 top-[104px] z-[100] w-[min(270px,24vw)] rounded-2xl border border-white/60 bg-white/80 p-4 text-[#12395a] shadow-xl backdrop-blur-xl max-lg:hidden">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f64ff]">记牌数据</p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">{["A", "2", "SJ", "BJ"].map((label) => <div className="rounded-xl bg-[#edf8ff] p-2" key={label}><p className="text-xs font-black text-[#47718b]">{label}</p><p className="mt-1 text-lg font-black">{appeared(label)}</p><p className="text-[10px] font-bold text-[#6a8da0]">已出现</p></div>)}</div>
        <button className="mt-4 min-h-11 w-full rounded-xl bg-[#0f64ff] text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-[#9ab8c8]" disabled={!state?.history.length || Boolean(question)} onClick={openMemoryTest} type="button">记牌测试</button>
        <div className="mt-4 border-t border-[#b7d9ea] pt-3"><p className="text-sm font-black">测试结果 · {records.length} 次</p>{records.length ? <p className="mt-2 text-sm font-bold text-[#345f78]">最近一次：{records.at(-1)?.correct ? "回答正确" : "需要再观察"}</p> : <p className="mt-2 text-sm font-bold text-[#7895a5]">完成测试后显示结果</p>}</div>
        <button className="mt-3 w-full text-left text-sm font-black text-[#0f64ff] disabled:text-[#9ab8c8]" disabled={state?.gameStatus !== "finished"} onClick={() => setStage("report")} type="button">查看训练结果 →</button>
      </aside>
      {question ? (
        <div className="fixed inset-0 z-[180] grid place-items-center bg-[#071426]/70 px-5 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-[28px] border border-[#74dfff]/45 bg-[#0e2944] p-6 text-white shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#74dfff]">记牌挑战</p>
            <h2 className="mt-4 text-xl font-black leading-8">请回答当前牌数量</h2>
            <p className="mt-4 text-lg font-bold leading-8">{question.prompt}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">{question.options.map((option) => <button className={`min-h-12 rounded-2xl border font-black ${selectedAnswer === option ? option === question.answer ? "border-emerald-300 bg-emerald-400/20" : "border-red-300 bg-red-400/20" : "border-white/15 bg-white/[0.07]"}`} disabled={Boolean(selectedAnswer)} key={option} onClick={() => answer(option)} type="button">{option}</button>)}</div>
            {selectedAnswer ? <div className="mt-5 rounded-2xl bg-white/[0.08] p-4 text-sm leading-6"><p className="font-black">{selectedAnswer === question.answer ? "回答正确，你已经掌握关键牌变化。" : "再关注已经出现的位置。"}</p><p className="mt-2 text-[#b8cde0]">正确答案：{question.answer}。{question.explanation}</p><button className="mt-4 min-h-11 w-full rounded-xl bg-[#0f64ff] font-black" onClick={continueGame} type="button">继续观察</button></div> : null}
          </section>
        </div>
      ) : null}
      {state?.gameStatus === "finished" && !question ? <button className="fixed bottom-8 left-1/2 z-[160] -translate-x-1/2 rounded-full bg-[#0f64ff] px-6 py-4 font-black text-white shadow-xl" onClick={() => setStage("report")} type="button">查看训练结果</button> : null}
    </div>
  );
}

function createQuantityChallenge(history: GameEngineState["history"], tracker: CardTracker, checkpoint: number): MemoryQuestion {
  const question = createMemoryQuestion(tracker.snapshot(history), checkpoint);
  return question.type === "inference" ? createMemoryQuestion(tracker.snapshot(history), 2) : question;
}
