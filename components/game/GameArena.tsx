"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ActionToolbar } from "@/components/game/ActionToolbar";
import { buildCounterHint, CardCounter } from "@/components/game/CardCounter";
import { GameTable } from "@/components/game/GameTable";
import { HandCards } from "@/components/game/HandCards";
import { useGameStore } from "@/store/gameStore";
import { getRankLabel } from "@/lib/guandan/card";
import { cn } from "@/lib/utils";
import type { TrainingPhase } from "@/lib/guandan/gameState";
import type { ArenaPlayer } from "@/types/game";

type TrainingLevel = "beginner" | "intermediate" | "advanced";

interface ArenaSettings {
  sound: boolean;
  aiTips: boolean;
}

const trainingLevels: Array<{
  id: TrainingLevel;
  label: string;
  title: string;
  goal: string;
  items: string[];
}> = [
  {
    id: "beginner",
    label: "初级",
    title: "初级训练",
    goal: "学习基础规则",
    items: ["牌型认识", "出牌顺序", "基础组合", "简单判断"]
  },
  {
    id: "intermediate",
    label: "中级",
    title: "中级训练",
    goal: "提升牌局理解",
    items: ["牌权判断", "队友配合", "控牌技巧", "进攻防守选择"]
  },
  {
    id: "advanced",
    label: "高级",
    title: "高级训练",
    goal: "高手决策训练",
    items: ["残局分析", "复杂牌局推演", "风险判断", "最优策略选择"]
  }
];

const defaultSettings: ArenaSettings = {
  sound: true,
  aiTips: true
};

export function GameArena() {
  const router = useRouter();
  const [activeLevel, setActiveLevel] = useState<TrainingLevel>("beginner");
  const [activePanel, setActivePanel] = useState<"coach" | "rules" | "settings" | null>(null);
  const [settings, setSettings] = useState<ArenaSettings>(defaultSettings);
  const [, setAiCountdown] = useState<number | null>(null);
  const aiActionKeyRef = useRef<string | null>(null);
  const aiTimerRef = useRef<number | null>(null);
  const userActionKeyRef = useRef<string | null>(null);
  const userTimerRef = useRef<number | null>(null);
  const {
    state,
    currentPlayer,
    userPlayer,
    selectedCardIds,
    isUserTurn,
    clearSelectedCards,
    continueTraining,
    selectCard,
    setSelectedCards,
    sortHand,
    playSelectedCards,
    pass,
    requestTip,
    toggleCardCounter,
    showSolution,
    setTurnAction,
    clearRoundActions,
    runAIAction,
    restart
  } = useGameStore();

  const activeTrainingLevel = useMemo(
    () => trainingLevels.find((level) => level.id === activeLevel) ?? trainingLevels[0],
    [activeLevel]
  );
  const levelRankLabel = getRankLabel(state.levelRank);
  const cardCounterHint = useMemo(
    () => buildCounterHint(state.cardRemainingCount),
    [state.cardRemainingCount]
  );

  const completeAIAction = useCallback(() => {
    if (aiTimerRef.current) {
      window.clearInterval(aiTimerRef.current);
      aiTimerRef.current = null;
    }

    setAiCountdown(null);
    runAIAction();
  }, [runAIAction]);

  useEffect(() => {
    if (state.trainingPhase !== "playing" || state.gameStatus !== "playing" || currentPlayer?.kind !== "ai") return;

    const actionKey = `${state.turnNumber}-${currentPlayer.id}`;
    if (aiActionKeyRef.current === actionKey) return;

    aiActionKeyRef.current = actionKey;
    const seconds = 5;

    setTurnAction({
      playerId: currentPlayer.id,
      status: "thinking",
      label: `AI ${currentPlayer.role} 思考中`,
      remainingSeconds: seconds
    });

    setAiCountdown(seconds);
    let remaining = seconds;
    aiTimerRef.current = window.setInterval(() => {
      remaining -= 1;
      setAiCountdown(remaining);
      setTurnAction({
        playerId: currentPlayer.id,
        status: remaining > 0 ? "thinking" : "playing",
        label: remaining > 0 ? `AI ${currentPlayer.role} 思考中` : `${currentPlayer.role} 准备出牌`,
        remainingSeconds: Math.max(remaining, 0)
      });

      if (remaining <= 0) {
        completeAIAction();
      }
    }, 1000);

    return () => {
      if (aiTimerRef.current) {
        window.clearInterval(aiTimerRef.current);
        aiTimerRef.current = null;
      }
    };
  }, [completeAIAction, currentPlayer?.id, currentPlayer?.kind, currentPlayer?.role, setTurnAction, state.gameStatus, state.trainingPhase, state.turnNumber]);

  useEffect(() => {
    if (state.trainingPhase !== "playing" || state.gameStatus !== "playing" || currentPlayer?.id !== "player") return;

    const actionKey = `${state.turnNumber}-player`;
    if (userActionKeyRef.current === actionKey) return;

    userActionKeyRef.current = actionKey;
    let remaining = 15;

    setTurnAction({
      playerId: "player",
      status: "waiting",
      label: "轮到你出牌",
      remainingSeconds: remaining
    });

    userTimerRef.current = window.setInterval(() => {
      remaining -= 1;
      setTurnAction({
        playerId: "player",
        status: remaining > 0 ? "waiting" : "analyzing",
        label: remaining > 0 ? "轮到你出牌" : "时间到，Ace Coach 给出提示",
        remainingSeconds: Math.max(remaining, 0)
      });

      if (remaining <= 0) {
        if (userTimerRef.current) {
          window.clearInterval(userTimerRef.current);
          userTimerRef.current = null;
        }
        requestTip();
      }
    }, 1000);

    return () => {
      if (userTimerRef.current) {
        window.clearInterval(userTimerRef.current);
        userTimerRef.current = null;
      }
    };
  }, [currentPlayer?.id, requestTip, setTurnAction, state.gameStatus, state.trainingPhase, state.turnNumber]);

  useEffect(() => {
    if (!state.roundComplete) return;

    const timer = window.setTimeout(clearRoundActions, 1200);
    return () => window.clearTimeout(timer);
  }, [clearRoundActions, state.roundClearKey, state.roundComplete]);

  useEffect(() => {
    const raw = window.localStorage.getItem("guandan-training-arena-settings");
    if (!raw) return;

    try {
      setSettings({
        ...defaultSettings,
        ...(JSON.parse(raw) as Partial<ArenaSettings>)
      });
    } catch {
      setSettings(defaultSettings);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("guandan-training-arena-settings", JSON.stringify(settings));
  }, [settings]);

  const arenaPlayers = useMemo(
    () =>
      state.players.map<ArenaPlayer>((player) => {
        const actionState = state.playerActionState[player.id];

        return {
          id: player.id,
          name: player.name,
          role: roleLabel(player.seat),
          position: player.seat,
          cardCount: player.hand.length,
          score: player.score,
          isUser: player.id === "player",
          status:
            state.gameStatus === "finished"
              ? "waiting"
              : actionState?.status === "thinking"
                ? "thinking"
                : currentPlayer?.id === player.id
                  ? player.kind === "ai"
                    ? "thinking"
                    : "active"
                  : player.passed
                    ? "passed"
                    : "waiting",
          countdown:
            actionState?.playerId === player.id
              ? actionState.remainingSeconds
              : state.turnAction.playerId === player.id
                ? state.turnAction.remainingSeconds
                : null
        };
      }),
    [
      currentPlayer?.id,
      state.gameStatus,
      state.playerActionState,
      state.players,
      state.turnAction.playerId,
      state.turnAction.remainingSeconds
    ]
  );

  const phase = state.trainingPhase;
  const roundStatus =
    phase === "analysis"
      ? "AI 正在分析这手牌..."
      : isUserTurn
        ? "轮到你出牌"
        : `${currentPlayer?.role ?? "对家"}出牌中...`;
  const goLobby = () => router.push("/");
  const coachMood = state.coachFeedback.type === "mistake" ? "warning" : isUserTurn ? "teaching" : "thinking";

  function changeLevel(level: TrainingLevel) {
    setActiveLevel(level);
    restart();
  }

  function updateSettings(nextSettings: Partial<ArenaSettings>) {
    setSettings((current) => ({
      ...current,
      ...nextSettings
    }));
  }

  function skipAIWait() {
    if (currentPlayer?.kind !== "ai" || state.trainingPhase !== "playing") return;
    completeAIAction();
  }

  const coachTeachingText = state.cardCounterVisible
    ? `${formatCoachTeaching(
        state.coachFeedback.message,
        state.coachFeedback.reason,
        state.coachFeedback.suggestion
      )}\n记牌提示：${cardCounterHint}`
    : formatCoachTeaching(
        state.coachFeedback.message,
        state.coachFeedback.reason,
        state.coachFeedback.suggestion
      );

  return (
    <main className="training-arena relative h-[100dvh] min-h-[390px] overflow-hidden bg-[#72caff] text-[#12395a]">
      <ArenaBackground />
      <ArenaTopBar
        activeLevel={activeLevel}
        levelTitle={activeTrainingLevel.title}
        levelRank={levelRankLabel}
        onBackToLobby={goLobby}
        onOpenCoach={() => setActivePanel("coach")}
        onOpenRules={() => setActivePanel("rules")}
        onOpenSettings={() => setActivePanel("settings")}
        onSelectLevel={changeLevel}
        phase={phase}
      />

      <section className="relative z-10 mx-auto h-full w-full max-w-[1680px] px-4 pb-3 pt-[84px] lg:px-5">
        <GameTable
          levelRank={levelRankLabel}
          players={arenaPlayers}
          roundActions={state.currentRoundActions}
          turnAction={state.turnAction}
        />

        <CardCounter counts={state.cardRemainingCount} levelRank={levelRankLabel} visible={state.cardCounterVisible} />

        {settings.aiTips ? (
          <motion.section
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-5 top-[190px] z-[62] flex max-h-[210px] w-[min(380px,28vw)] items-start gap-4 overflow-y-auto rounded-2xl bg-white px-5 py-4 text-left shadow-[0_22px_54px_rgba(42,132,196,0.24)] max-xl:top-[176px] max-xl:w-[330px] max-lg:left-3 max-lg:top-[96px] max-lg:max-h-[126px] max-lg:w-[300px] max-lg:gap-3 max-lg:px-4 max-lg:py-3"
            initial={{ opacity: 0, x: -18 }}
            key={state.coachFeedback.message}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/70 bg-white/62 shadow-[0_10px_24px_rgba(45,125,188,0.18)] max-lg:h-10 max-lg:w-10">
              <Image
                alt=""
                className="object-cover p-0.5"
                fill
                sizes="48px"
                src={coachMood === "warning" ? "/assets/coach/coach-analysis-mode.png" : "/assets/coach/coach-bubble-hologram.png"}
              />
            </span>
            <div className="min-w-0">
              <p className="text-lg font-black text-[#12395a] max-lg:text-base">Ace Coach 建议</p>
              <p className="mt-2 whitespace-pre-wrap text-base font-bold leading-7 text-[#244d68] max-lg:mt-1 max-lg:text-sm max-lg:leading-5">
                {coachTeachingText}
              </p>
            </div>
          </motion.section>
        ) : null}

        <div className="absolute right-7 top-[86px] z-50 hidden w-[238px] xl:block">
          <PerformancePanel level={activeTrainingLevel} phase={phase} />
        </div>

        <div className="pointer-events-none absolute left-1/2 top-[61%] z-40 w-[min(560px,42vw)] -translate-x-1/2 text-center text-white drop-shadow-[0_3px_8px_rgba(34,92,146,0.42)] max-lg:top-[54%] max-lg:w-[360px]">
          <AnalysisPanel reason={state.coachFeedback.reason} status={roundStatus} />
        </div>

        <section className="training-hand-dock absolute bottom-3 left-3 right-3 z-[60] min-w-0 lg:left-[120px] lg:right-[120px] 2xl:left-[150px] 2xl:right-[150px]">
          <ActionToolbar
            canAct={isUserTurn}
            cardCounterVisible={state.cardCounterVisible}
            isAIThinking={currentPlayer?.kind === "ai" && state.trainingPhase === "playing"}
            onBackToLobby={goLobby}
            onContinue={continueTraining}
            onPass={pass}
            onPlay={playSelectedCards}
            onRestart={restart}
            onShowSolution={showSolution}
            onSortHand={sortHand}
            onStart={continueTraining}
            onTip={requestTip}
            onToggleCardCounter={toggleCardCounter}
            onUndo={clearSelectedCards}
            onSkipAIWait={skipAIWait}
            phase={phase}
            selectedCount={state.selectedCards.length}
          />
          <HandCards
            cards={userPlayer?.hand ?? []}
            disabled={!isUserTurn}
            invalidCardIds={state.invalidCardIds}
            invalidPulseKey={state.invalidPulseKey}
            levelRank={levelRankLabel}
            onSelectionChange={setSelectedCards}
            onSelectCard={selectCard}
            selectedCardIds={selectedCardIds}
            variant="arena"
          />
        </section>
      </section>

      <ArenaModal onClose={() => setActivePanel(null)} open={activePanel === "coach"} title="AI Coach">
        <CoachTeachingContent
          message={state.coachFeedback.message}
          reason={state.coachFeedback.reason}
          suggestion={state.coachFeedback.suggestion}
        />
      </ArenaModal>

      <ArenaModal onClose={() => setActivePanel(null)} open={activePanel === "rules"} title="训练规则">
        <div className="space-y-4 text-base font-bold leading-7 text-[#24557a]">
          <RuleBlock title="掼蛋基础规则" items={["四人两两组队，目标是尽快出完手牌。", "轮到你时必须出同牌型且更大的牌，炸弹可压普通牌型。", "一圈都不出时，牌权回到上一位出牌者。"]} />
          <RuleBlock title="牌型说明" items={["单牌、对子、三张、三带二、顺子是基础牌型。", "四张及以上同点数为炸弹，四王炸最大。", "顺子不包含 2 和大小王。"]} />
          <RuleBlock title="级牌说明" items={["本局级牌会在牌桌顶部显示。", "手牌中的级牌使用金色边框和“级”标签标出。", "做判断时先确认级牌能否改变牌权。"]} />
          <RuleBlock title="大小王说明" items={["小王使用蓝色主题，牌面显示 SMALL JOKER。", "大王使用红色主题，牌面显示 BIG JOKER。", "大小王尺寸略大于普通牌，便于第一眼识别。"]} />
          <RuleBlock title="训练规则" items={["选择等级后会生成一局训练牌局。", "先操作，再看 Ace Coach 的分析和推荐思路。", "每轮完成 学习 → 判断 → 反馈 → 成长。"]} />
        </div>
      </ArenaModal>

      <ArenaModal onClose={() => setActivePanel(null)} open={activePanel === "settings"} title="设置">
        <div className="space-y-4 text-[#12395a]">
          <SettingToggle checked={settings.sound} label="音效" onChange={(sound) => updateSettings({ sound })} />
          <SettingToggle checked={settings.aiTips} label="AI 提示" onChange={(aiTips) => updateSettings({ aiTips })} />
          <section className="rounded-2xl bg-[#f3f9ff] p-5 text-base font-bold leading-7 text-[#345f78]">
            AI 行动固定 5 秒。牌面固定 100%，训练场不再提供缩放。
          </section>
        </div>
      </ArenaModal>
    </main>
  );
}

function ArenaBackground() {
  return (
    <div aria-hidden className="absolute inset-0">
      <Image
        alt=""
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src="/assets/arena/sky-training-arena.png"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(59,170,244,0.10)_55%,rgba(44,139,214,0.22))]" />
    </div>
  );
}

function ArenaTopBar({
  activeLevel,
  levelTitle,
  levelRank,
  onBackToLobby,
  onOpenCoach,
  onOpenRules,
  onOpenSettings,
  onSelectLevel,
  phase
}: {
  activeLevel: TrainingLevel;
  levelTitle: string;
  levelRank: string;
  onBackToLobby: () => void;
  onOpenCoach: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onSelectLevel: (level: TrainingLevel) => void;
  phase: TrainingPhase;
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-[80] h-[84px] border-b border-white/20 bg-[#d7f3ff]/28 shadow-[0_10px_32px_rgba(34,122,187,0.10)] backdrop-blur-md">
      <div className="flex h-full items-center justify-between gap-3 px-4 lg:px-7">
        <div className="relative flex h-[82px] w-[360px] shrink-0 items-center rounded-br-[28px] bg-white/76 pl-7 shadow-[0_10px_24px_rgba(37,126,191,0.14)] max-lg:w-[220px] max-lg:pl-4">
          <div>
            <p className="whitespace-nowrap text-[24px] font-black leading-7 text-[#f6b42d] max-lg:text-[18px]">
              Ace <span className="text-[#12395a]">掼蛋训练空间</span>
            </p>
            <p className="mt-1 text-[10px] font-black text-[#255675] max-lg:line-clamp-2 max-lg:max-w-[185px]">
              AI Coach 陪你从基础规则到高级牌局决策。
            </p>
            <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-[#2b6b93] max-lg:hidden">
              {levelTitle}
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 rounded-full bg-white/34 px-3 py-2 text-base font-black text-[#12395a] shadow-[0_10px_24px_rgba(52,142,207,0.14)] backdrop-blur-xl md:flex max-lg:gap-1 max-lg:px-2">
          <LevelCardBadge levelRank={levelRank} />
          {trainingLevels.map((level) => (
            <button
              className={cn(
                "h-10 rounded-full px-5 text-sm font-black transition max-lg:h-12 max-lg:w-12 max-lg:px-0 max-lg:leading-4",
                activeLevel === level.id
                  ? "bg-[#0f64ff] text-white shadow-[0_10px_24px_rgba(15,100,255,0.24)]"
                  : "bg-white/35 text-[#17496d] hover:bg-white/62"
              )}
              key={level.id}
              onClick={() => onSelectLevel(level.id)}
              type="button"
            >
              {level.label}
            </button>
          ))}
          <span className="ml-2 rounded-full bg-[#12395a]/88 px-3 py-1 text-xs text-white max-lg:hidden">{phaseText[phase]}</span>
        </div>

        <nav className="flex min-w-0 items-center gap-3 max-lg:gap-2">
          <HudButton icon="◉" label="AI Coach" onClick={onOpenCoach} />
          <HudButton icon="ⓘ" label="规则" onClick={onOpenRules} />
          <HudButton icon="⚙" label="设置" onClick={onOpenSettings} />
          <button
            className="h-12 rounded-full bg-[#0f64ff] px-7 text-base font-black text-white shadow-[0_14px_30px_rgba(15,100,255,0.28)] transition hover:-translate-y-0.5 max-lg:w-12 max-lg:px-0"
            onClick={onBackToLobby}
            type="button"
          >
            <span className="max-lg:sr-only">退出房间</span>
            <span aria-hidden className="hidden max-lg:inline">退</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

function LevelCardBadge({ levelRank }: { levelRank: string }) {
  return (
    <section className="mr-1 flex h-10 items-center gap-2 rounded-full border border-[#f2c24c]/80 bg-white/90 px-2.5 text-[#12395a] shadow-[0_10px_24px_rgba(164,105,0,0.14)] backdrop-blur max-lg:h-12 max-lg:px-2">
      <p className="whitespace-nowrap text-[10px] font-black text-[#9a6800] max-lg:hidden">
        本局级牌
      </p>
      <div className="relative grid h-8 w-8 place-items-center rounded-lg border-2 border-[#f2c24c] bg-white text-lg font-black text-[#0f172a] shadow-[0_6px_14px_rgba(164,105,0,0.12)] max-lg:h-9 max-lg:w-9">
        {levelRank}
        <span className="absolute -right-1 -top-1 rounded bg-[#ffd76a] px-1 text-[9px] leading-4 text-[#7a4a00]">
          级
        </span>
      </div>
    </section>
  );
}

const phaseText: Record<TrainingPhase, string> = {
  idle: "准备",
  playing: "训练中",
  analysis: "分析中",
  completed: "完成"
};

function HudButton({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <button
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/42 px-5 text-sm font-black text-[#12395a] shadow-[0_10px_24px_rgba(52,142,207,0.14)] backdrop-blur-xl transition hover:-translate-y-0.5 max-lg:w-11 max-lg:px-0"
      onClick={onClick}
      type="button"
    >
      <span>{icon}</span>
      <span className="max-lg:sr-only">{label}</span>
    </button>
  );
}

function PerformancePanel({
  level,
  phase
}: {
  level: (typeof trainingLevels)[number];
  phase: TrainingPhase;
}) {
  return (
    <section className="rounded-[12px] border border-white/62 bg-white/68 p-4 text-[#12395a] shadow-[0_20px_45px_rgba(42,132,196,0.20)] backdrop-blur-xl">
      <h2 className="text-base font-black">{level.title}</h2>
      <p className="mt-1 text-sm font-bold text-[#346d92]">{level.goal}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {level.items.map((item) => (
          <span className="rounded-full bg-[#d9f3ff]/80 px-3 py-1 text-xs font-black text-[#0f64a0]" key={item}>
            {item}
          </span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 border-b border-[#8ecded]/60 pb-2 text-center text-sm font-bold text-[#346d92]">
        <span>玩家</span>
        <span>本轮</span>
        <span>表现</span>
      </div>
      <div className="grid grid-cols-3 py-2 text-center text-sm font-black text-[#0f64a0]">
        <span>我方</span>
        <span>{phase === "completed" ? "20" : "--"}</span>
        <span>--</span>
      </div>
      <div className="grid grid-cols-3 py-1 text-center text-sm font-bold text-[#346d92]">
        <span>对方</span>
        <span>--</span>
        <span>--</span>
      </div>
    </section>
  );
}

function AnalysisPanel({ reason, status }: { reason: string; status: string }) {
  return (
    <section className="rounded-[20px] border border-white/40 bg-[#236fa8]/40 px-5 py-3 shadow-[0_18px_42px_rgba(35,112,178,0.16)] backdrop-blur-xl">
      <p className="text-[20px] font-black">{status}</p>
      <p className="mt-1 line-clamp-2 text-sm font-bold text-white/86">{reason}</p>
    </section>
  );
}

function ArenaModal({
  children,
  onClose,
  open,
  title
}: {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-[#08233d]/34 p-5 backdrop-blur-sm">
      <section className="max-h-[86vh] w-[min(640px,92vw)] overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_24px_70px_rgba(8,35,61,0.30)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#12395a]">{title}</h2>
          <button
            className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf5ff] text-xl font-black text-[#12395a]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function RuleBlock({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="rounded-2xl bg-[#f3f9ff] p-5">
      <h3 className="text-lg font-black text-[#12395a]">{title}</h3>
      <ul className="mt-3 space-y-2 text-base leading-7">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </section>
  );
}

function SettingToggle({
  checked,
  label,
  onChange
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-2xl bg-[#f3f9ff] p-5 text-lg font-black">
      {label}
      <button
        aria-pressed={checked}
        className={cn(
          "relative h-8 w-14 rounded-full transition",
          checked ? "bg-[#0f64ff]" : "bg-[#9fbfd2]"
        )}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span
          className={cn(
            "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
            checked ? "left-7" : "left-1"
          )}
        />
      </button>
    </label>
  );
}

function CoachTeachingContent({
  message,
  reason,
  suggestion
}: {
  message: string;
  reason: string;
  suggestion: string;
}) {
  return (
    <article className="space-y-5 text-[#12395a]">
      <section className="rounded-2xl bg-[#f3f9ff] p-5">
        <h3 className="text-xl font-black">Ace Coach 建议</h3>
        <p className="mt-3 whitespace-pre-wrap text-lg font-bold leading-8">{message}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-[#d8ecf8]">
        <h4 className="text-lg font-black">原因</h4>
        <p className="mt-2 whitespace-pre-wrap text-base font-bold leading-7 text-[#345f78]">{reason}</p>
      </section>
      <section className="rounded-2xl bg-[#fff8df] p-5">
        <h4 className="text-lg font-black text-[#8a6500]">下一步</h4>
        <p className="mt-2 whitespace-pre-wrap text-base font-bold leading-7 text-[#6d5300]">{suggestion}</p>
      </section>
    </article>
  );
}

function formatCoachTeaching(message: string, reason: string, suggestion: string) {
  return `${message}\n原因：${reason}\n建议：${suggestion}`;
}

function roleLabel(position: string) {
  if (position === "left") return "上家";
  if (position === "right") return "下家";
  if (position === "top") return "对家";
  return "我";
}
