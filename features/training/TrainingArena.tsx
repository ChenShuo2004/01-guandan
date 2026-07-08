"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CoachAvatar } from "@/components/game/CoachAvatar";
import { CoachFeedback } from "@/components/game/CoachFeedback";
import { HandCards } from "@/components/game/HandCards";
import { PlayedCards } from "@/components/game/PlayedCards";
import { TurnTimer } from "@/components/game/TurnTimer";
import type { Card, CardRank, CardSuit } from "@/lib/guandan/card";
import { detectCardPattern } from "@/lib/guandan/cardRule";
import { cn } from "@/lib/utils";
import { getAbilityKey, trainingSessions } from "@/training/training-session";
import type {
  TrainingFeedback,
  TrainingFeedbackLevel,
  TrainingProgress,
  TrainingSession
} from "@/types/training-session";

const progressStorageKey = "guandan-training-progress-v1";

const emptyProgress: TrainingProgress = {
  completed: 0,
  abilities: {},
  mistakes: {}
};

export function TrainingArena() {
  const [sessionIndex, setSessionIndex] = useState(0);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [feedback, setFeedback] = useState<TrainingFeedback | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [progress, setProgress] = useState<TrainingProgress>(emptyProgress);
  const evaluatedRef = useRef(false);

  const session = trainingSessions[sessionIndex];
  const playerCards = useMemo(() => parseCards(session.playerCards, session.id), [session]);
  const opponentCards = useMemo(() => parseOpponentCards(session), [session]);
  const selectedCardIds = useMemo(() => selectedCards.map((card) => card.id), [selectedCards]);
  const timerKey = `${session.id}-${feedback ? "done" : "active"}`;

  useEffect(() => {
    const rawProgress = window.localStorage.getItem(progressStorageKey);
    if (!rawProgress) return;

    try {
      setProgress({ ...emptyProgress, ...JSON.parse(rawProgress) });
    } catch {
      window.localStorage.removeItem(progressStorageKey);
    }
  }, []);

  useEffect(() => {
    evaluatedRef.current = false;
  }, [sessionIndex]);

  const saveProgress = useCallback((level: TrainingFeedbackLevel, activeSession: TrainingSession) => {
    setProgress((current) => {
      const abilityKey = getAbilityKey(activeSession.ability);
      const nextProgress: TrainingProgress = {
        completed: current.completed + 1,
        abilities: {
          ...current.abilities,
          [abilityKey]: (current.abilities[abilityKey] ?? 0) + (level === "wrong" ? 0 : 1)
        },
        mistakes: {
          ...current.mistakes,
          [abilityKey]: (current.mistakes[abilityKey] ?? 0) + (level === "wrong" ? 1 : 0)
        }
      };

      window.localStorage.setItem(progressStorageKey, JSON.stringify(nextProgress));
      return nextProgress;
    });
  }, []);

  const evaluateAction = useCallback(
    (action: string) => {
      if (feedback || evaluatedRef.current) return;

      evaluatedRef.current = true;
      const level = getFeedbackLevel(action, session.correctAction);
      const nextFeedback = buildFeedback(level, action, session);
      setSelectedAction(action);
      setFeedback(nextFeedback);
      saveProgress(level, session);
    },
    [feedback, saveProgress, session]
  );

  const handleTimeout = useCallback(() => {
    evaluateAction("超时分析");
  }, [evaluateAction]);

  function confirmSelectedCards() {
    if (selectedCards.length === 0) {
      evaluateAction("未选择");
      return;
    }

    evaluateAction(deriveActionFromCards(selectedCards));
  }

  function goNext() {
    evaluatedRef.current = false;
    setSelectedCards([]);
    setFeedback(null);
    setSelectedAction(null);
    setSessionIndex((index) => (index + 1) % trainingSessions.length);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <TrainingBackdrop />

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1540px] grid-rows-[auto_1fr_auto] gap-4 px-4 py-4 lg:grid-cols-[1fr_360px] lg:grid-rows-[auto_1fr] lg:px-6">
        <header className="rounded-[28px] border border-white/10 bg-white/[0.07] px-4 py-4 shadow-[0_20px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl lg:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <CoachAvatar mood={feedback?.level === "wrong" ? "warning" : "teaching"} />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#77d7ff]">AI Training Arena</p>
                <h1 className="mt-1 text-2xl font-black tracking-normal md:text-3xl">Ace 掼蛋训练场</h1>
                <p className="mt-2 max-w-[680px] text-sm font-bold leading-6 text-white/62">
                  今天只练一个判断：观察场景，选择动作，获得 Ace 反馈。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center md:w-[360px]">
              <Metric label="完成" value={String(progress.completed)} />
              <Metric label="能力" value={String(Object.keys(progress.abilities).length)} />
              <Metric label="错因" value={String(Object.values(progress.mistakes).reduce((sum, count) => sum + count, 0))} />
            </div>
          </div>
        </header>

        <div className="relative grid min-h-[620px] gap-4 lg:min-h-0">
          <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.06] shadow-[0_30px_100px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(67,184,255,0.18),transparent_33%),radial-gradient(circle_at_50%_72%,rgba(47,240,200,0.12),transparent_35%)]" />

            <div className="relative z-10 flex h-full min-h-[620px] flex-col p-4 md:p-5">
              <div className="grid gap-3 md:grid-cols-[1fr_280px] md:items-start">
                <ScenarioPanel session={session} index={sessionIndex + 1} total={trainingSessions.length} />
                <TurnTimer
                  onTimeout={handleTimeout}
                  resetKey={timerKey}
                  running={!feedback}
                  seconds={15}
                />
              </div>

              <div className="relative mt-4 flex flex-1 items-center justify-center">
                <div className="absolute inset-x-[3%] top-1/2 h-[310px] -translate-y-1/2 rounded-[50%] border border-[#77d7ff]/28 bg-[radial-gradient(circle_at_50%_42%,rgba(119,215,255,0.20),rgba(12,38,67,0.76)_58%,rgba(9,17,32,0.94)_100%)] shadow-[0_0_0_8px_rgba(119,215,255,0.04),0_0_90px_rgba(69,185,255,0.20),inset_0_0_90px_rgba(119,215,255,0.12)] md:h-[390px]" />
                <div className="absolute inset-x-[16%] top-1/2 h-[210px] -translate-y-1/2 rounded-[50%] border border-dashed border-white/14" />

                <div className="relative z-10 grid w-full max-w-[820px] gap-6 text-center">
                  <div className="mx-auto rounded-full border border-white/10 bg-white/[0.07] px-5 py-2 text-sm font-black text-[#d8f7ff] backdrop-blur">
                    {session.opponentAction}
                  </div>
                  <PlayedCards cards={opponentCards} />
                  <div className="mx-auto max-w-[620px] rounded-3xl border border-white/10 bg-[#07111f]/55 px-5 py-4 text-sm font-bold leading-6 text-white/72 backdrop-blur-xl">
                    {feedback ? (
                      <span>
                        你的选择：<b className="text-white">{selectedAction}</b>
                      </span>
                    ) : (
                      "选择手牌后确认出牌，或直接选择不出。"
                    )}
                  </div>
                </div>
              </div>

              <div className="relative z-20 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <HandCards
                  cards={playerCards}
                  disabled={Boolean(feedback)}
                  groupSelection
                  onSelectCard={() => undefined}
                  onSelectionChange={setSelectedCards}
                  selectedCardIds={selectedCardIds}
                  showOrganizer
                />

                <div className="grid grid-cols-3 gap-2 md:w-[300px] md:grid-cols-1">
                  <TrainingActionButton
                    disabled={Boolean(feedback)}
                    label="不出"
                    onClick={() => evaluateAction(session.correctAction === "不要炸" ? "不要炸" : "不出")}
                    tone="quiet"
                  />
                  <TrainingActionButton
                    disabled={Boolean(feedback)}
                    label={selectedCards.length > 0 ? `确认出牌 ${selectedCards.length}` : "确认出牌"}
                    onClick={confirmSelectedCards}
                    tone="primary"
                  />
                  <TrainingActionButton
                    disabled={Boolean(feedback)}
                    label="提示分析"
                    onClick={() => evaluateAction("提示分析")}
                    tone="coach"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-4">
          <CoachFeedback feedback={feedback} />

          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#77d7ff]">Training Progress</p>
            <div className="mt-4 grid gap-3">
              {["炸弹判断", "牌权判断", "队友配合", "出牌规划"].map((ability) => {
                const key = getAbilityKey(ability);
                const mastered = progress.abilities[key] ?? 0;
                const mistakes = progress.mistakes[key] ?? 0;

                return (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3" key={ability}>
                    <div className="flex items-center justify-between gap-3 text-sm font-black">
                      <span>{ability}</span>
                      <span className="text-[#77d7ff]">{mastered}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          mistakes > mastered ? "bg-rose-300" : "bg-gradient-to-r from-[#77d7ff] to-[#2ff0c8]"
                        )}
                        style={{ width: `${Math.min(100, (mastered / 5) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <button
            className="h-14 rounded-2xl bg-gradient-to-r from-[#77d7ff] to-[#2ff0c8] px-5 text-base font-black text-[#06111f] shadow-[0_18px_44px_rgba(47,240,200,0.20)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
            disabled={!feedback}
            onClick={goNext}
            type="button"
          >
            下一题
          </button>
        </aside>
      </section>
    </main>
  );
}

function ScenarioPanel({
  index,
  session,
  total
}: {
  index: number;
  session: TrainingSession;
  total: number;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#07111f]/50 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#77d7ff]/14 px-3 py-1 text-xs font-black text-[#b8eeff]">
          {index}/{total}
        </span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/70">
          {session.ability}
        </span>
      </div>
      <h2 className="mt-4 text-2xl font-black">{session.title}</h2>
      <p className="mt-2 text-sm font-bold leading-6 text-white/70">{session.description}</p>
      <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-6 text-white/76">
        {session.scenario}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
      <p className="text-xs font-black text-white/48">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function TrainingActionButton({
  disabled,
  label,
  onClick,
  tone
}: {
  disabled?: boolean;
  label: string;
  onClick: () => void;
  tone: "quiet" | "primary" | "coach";
}) {
  const toneClass = {
    quiet: "border-white/12 bg-white/[0.08] text-white",
    primary: "border-[#2ff0c8]/45 bg-[#2ff0c8]/18 text-[#d9fff7]",
    coach: "border-[#77d7ff]/45 bg-[#77d7ff]/18 text-[#d8f7ff]"
  }[tone];

  return (
    <button
      className={cn(
        "h-14 rounded-2xl border px-4 text-sm font-black shadow-[0_12px_34px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0",
        toneClass
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function TrainingBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(119,215,255,0.22),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(47,240,200,0.14),transparent_30%),linear-gradient(180deg,#07111f_0%,#0b1d33_52%,#07111f_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px] opacity-45" />
    </div>
  );
}

function parseCards(cardLabels: string[], idPrefix: string): Card[] {
  return cardLabels.map((label, index) => parseCard(label, `${idPrefix}-${index}`));
}

function parseOpponentCards(session: TrainingSession) {
  const labels = session.opponentAction.match(/(?:10|[3-9JQKA2])[♠♥♣♦]/g) ?? [];
  return parseCards(labels, `${session.id}-opponent`);
}

function parseCard(label: string, id: string): Card {
  const suitSymbol = label.slice(-1);
  const rankLabel = label.slice(0, -1);
  const suitMap: Record<string, CardSuit> = {
    "♠": "spade",
    "♥": "heart",
    "♣": "club",
    "♦": "diamond"
  };
  const rankMap: Record<string, CardRank> = {
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
    "2": 15
  };

  return {
    id,
    suit: suitMap[suitSymbol] ?? "spade",
    rank: rankMap[rankLabel] ?? 3,
    isJoker: false,
    deckIndex: 1
  };
}

function deriveActionFromCards(cards: Card[]) {
  const pattern = detectCardPattern(cards);

  if (pattern.type === "bomb" || pattern.type === "fourJokers") return "使用炸弹";
  if (pattern.type === "straight") return "出顺子";
  if (pattern.type === "single" || pattern.type === "pair" || pattern.type === "triple") return "压小牌";
  return "未选择";
}

function getFeedbackLevel(action: string, correctAction: string): TrainingFeedbackLevel {
  if (action === correctAction) return "correct";
  if (action === "提示分析" || action === "超时分析") return "normal";
  return "wrong";
}

function buildFeedback(
  level: TrainingFeedbackLevel,
  action: string,
  session: TrainingSession
): TrainingFeedback {
  if (level === "correct") {
    return {
      level,
      title: "判断优秀",
      message: "这一步和当前训练目标一致。",
      reason: session.explanation,
      suggestion: "记住这个触发条件，下次遇到相似牌局先判断队友节奏和资源成本。"
    };
  }

  if (level === "normal") {
    return {
      level,
      title: "方向正确",
      message: "先停下来分析是对的，但还要更快识别关键资源。",
      reason: `本题标准动作是“${session.correctAction}”。${session.explanation}`,
      suggestion: "下一题先用 5 秒判断：谁有牌权、炸弹是否必要、队友是否已经领先。"
    };
  }

  return {
    level,
    title: "需要调整",
    message: action === "使用炸弹" ? "这一步可以更好。" : "这个动作没有解决当前牌局重点。",
    reason:
      action === "使用炸弹"
        ? "你现在使用炸弹，会降低后期控制能力。"
        : `本题更好的动作是“${session.correctAction}”。${session.explanation}`,
    suggestion: action === "使用炸弹" ? "等待对手关键牌型，再用炸弹切断节奏。" : "先围绕训练目标做判断，不要只看手里能不能出。"
  };
}
