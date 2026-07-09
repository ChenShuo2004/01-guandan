"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ActionButtons } from "@/components/game/ActionButtons";
import { GameTable } from "@/components/game/GameTable";
import { HandCards } from "@/components/game/HandCards";
import { useGameStore } from "@/store/gameStore";
import { cn } from "@/lib/utils";
import type { TrainingPhase } from "@/lib/guandan/gameState";
import type { ArenaPlayer } from "@/types/game";

type TrainingSpeed = "slow" | "standard" | "fast" | "skip";

interface ArenaSettings {
  sound: boolean;
  animations: boolean;
  aiTips: boolean;
  aiSpeed: TrainingSpeed;
  cardScale: number;
}

const defaultSettings: ArenaSettings = {
  sound: true,
  animations: true,
  aiTips: true,
  aiSpeed: "standard",
  cardScale: 0.62
};

const aiSpeedSeconds: Record<TrainingSpeed, number> = {
  slow: 5,
  standard: 3,
  fast: 1,
  skip: 0
};

const trainingPoints = {
  total: 1280,
  today: 80,
  records: [
    { label: "牌权判断", value: "+24", note: "识别当前回合能否接管牌权" },
    { label: "控牌节奏", value: "+18", note: "减少过早消耗炸弹和关键对子" },
    { label: "队友配合", value: "+16", note: "优先理解对家的压制与让牌信号" }
  ]
};

export function GameArena() {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<"coach" | "rules" | "settings" | "feedback" | "points" | null>(null);
  const [settings, setSettings] = useState<ArenaSettings>(defaultSettings);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [compactLayout, setCompactLayout] = useState(false);
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
    showSolution,
    setTurnAction,
    clearRoundActions,
    runAIAction,
    restart
  } = useGameStore();

  const effectiveCardScale = compactLayout ? 0.38 : settings.cardScale;

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

    const actionKey = `${state.turnNumber}-${currentPlayer.id}-${settings.aiSpeed}`;
    if (aiActionKeyRef.current === actionKey) return;

    aiActionKeyRef.current = actionKey;
    const seconds = aiSpeedSeconds[settings.aiSpeed];

    setTurnAction({
      playerId: currentPlayer.id,
      status: "thinking",
      label: `AI ${currentPlayer.role} 思考中`,
      remainingSeconds: seconds
    });

    if (seconds === 0) {
      window.setTimeout(completeAIAction, 350);
      return;
    }

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
  }, [completeAIAction, currentPlayer?.id, currentPlayer?.kind, currentPlayer?.role, setTurnAction, settings.aiSpeed, state.gameStatus, state.trainingPhase, state.turnNumber]);

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
    function syncLayout() {
      setCompactLayout(window.innerWidth < 1024 || window.innerHeight < 620);
    }

    syncLayout();
    window.addEventListener("resize", syncLayout);
    return () => window.removeEventListener("resize", syncLayout);
  }, []);

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
      state.players.map<ArenaPlayer>((player) => ({
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
            : state.turnAction.playerId === player.id && state.turnAction.status === "thinking"
              ? "thinking"
              : currentPlayer?.id === player.id
              ? player.kind === "ai"
                ? "thinking"
                : "active"
              : player.passed
                ? "passed"
                : "waiting",
        countdown: state.turnAction.playerId === player.id ? state.turnAction.remainingSeconds : null
      })),
    [currentPlayer?.id, state.gameStatus, state.players, state.turnAction.playerId, state.turnAction.remainingSeconds, state.turnAction.status]
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

  function saveFeedback() {
    if (!feedbackText.trim()) return;

    const feedback = {
      id: `feedback-${Date.now()}`,
      text: feedbackText.trim(),
      source: "training-arena",
      phase,
      createdAt: new Date().toISOString()
    };
    const previous = JSON.parse(window.localStorage.getItem("guandan-training-feedback") ?? "[]") as Array<typeof feedback>;
    window.localStorage.setItem("guandan-training-feedback", JSON.stringify([feedback, ...previous]));
    setFeedbackText("");
    setFeedbackSaved(true);
  }

  return (
    <main className="training-arena relative h-[100dvh] min-h-[390px] overflow-hidden bg-[#72caff] text-[#12395a]">
      <ArenaBackground />
      <ArenaTopBar
        onBackToLobby={goLobby}
        onOpenCoach={() => setActivePanel("coach")}
        onOpenFeedback={() => setActivePanel("feedback")}
        onOpenPoints={() => setActivePanel("points")}
        onOpenRules={() => setActivePanel("rules")}
        onOpenSettings={() => setActivePanel("settings")}
        phase={phase}
        points={trainingPoints}
      />

      <section className="relative z-10 mx-auto h-full w-full max-w-[1680px] px-4 pb-3 pt-[84px] lg:px-5">
        <GameTable
          players={arenaPlayers}
          roundActions={state.currentRoundActions}
          turnAction={state.turnAction}
        />

        {settings.aiTips ? (
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-1/2 top-[92px] z-[62] flex max-h-[184px] w-[min(560px,44vw)] -translate-x-1/2 items-start gap-4 overflow-y-auto rounded-2xl bg-white px-5 py-4 text-left shadow-[0_22px_54px_rgba(42,132,196,0.24)] max-lg:top-[90px] max-lg:max-h-[120px] max-lg:w-[320px] max-lg:gap-3 max-lg:px-4 max-lg:py-3"
            initial={{ opacity: 0, y: -14 }}
            key={`${state.coachFeedback.message}-${state.coachFeedback.reason}`}
            transition={settings.animations ? { duration: 0.45, delay: 0.32, ease: "easeOut" } : { duration: 0 }}
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
                {formatCoachTeaching(state.coachFeedback.message, state.coachFeedback.reason, state.coachFeedback.suggestion)}
              </p>
            </div>
          </motion.section>
        ) : null}

        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-7 top-[86px] z-50 hidden w-[238px] xl:block"
          initial={{ opacity: 0, x: 18 }}
          transition={settings.animations ? { duration: 0.42, delay: 0.62, ease: "easeOut" } : { duration: 0 }}
        >
          <TrainingPointsPanel phase={phase} points={trainingPoints} />
        </motion.div>

        <div className="pointer-events-none absolute left-1/2 top-[61%] z-40 w-[min(560px,42vw)] -translate-x-1/2 text-center text-white drop-shadow-[0_3px_8px_rgba(34,92,146,0.42)] max-lg:top-[54%] max-lg:w-[360px]">
          <AnalysisPanel reason={state.coachFeedback.reason} status={roundStatus} />
        </div>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="training-hand-dock absolute bottom-3 left-3 right-[158px] z-[60] min-w-0 lg:left-[220px] lg:right-[240px] 2xl:left-[300px] 2xl:right-[300px]"
          initial={{ opacity: 0, y: 24 }}
          transition={settings.animations ? { duration: 0.5, delay: 0.72, ease: "easeOut" } : { duration: 0 }}
        >
          <ReferenceActionBar
            canAct={isUserTurn}
            onPlay={playSelectedCards}
            onTip={requestTip}
            selectedCount={selectedCardIds.length}
          />
          <HandCards
            cards={userPlayer?.hand ?? []}
            cardScale={effectiveCardScale}
            disabled={!isUserTurn}
            invalidCardIds={state.invalidCardIds}
            invalidPulseKey={state.invalidPulseKey}
            onSelectionChange={setSelectedCards}
            onSelectCard={selectCard}
            selectedCardIds={selectedCardIds}
            variant="arena"
          />
        </motion.section>

        <motion.aside
          animate={{ opacity: 1, x: 0 }}
          className="absolute bottom-3 right-3 z-[60] w-[142px] lg:right-7 lg:w-[188px]"
          initial={{ opacity: 0, x: 22 }}
          transition={settings.animations ? { duration: 0.42, delay: 0.82, ease: "easeOut" } : { duration: 0 }}
        >
          <div className="mb-2 rounded-[24px] border border-white/42 bg-[#6db8e8]/36 px-3 py-2 text-sm font-black text-[#143d5d] shadow-[0_18px_45px_rgba(38,126,190,0.18)] backdrop-blur-xl lg:mb-3 lg:px-4 lg:py-3 lg:text-base">
            <span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#1ee271]" />
            本轮可出牌
          </div>
          <ActionButtons
            canAct={isUserTurn}
            compact
            isAIThinking={currentPlayer?.kind === "ai" && state.trainingPhase === "playing"}
            onBackToLobby={goLobby}
            onContinue={continueTraining}
            onPass={pass}
            onPlay={playSelectedCards}
            onRestart={restart}
            secondaryOnly
            onShowSolution={showSolution}
            onSortHand={sortHand}
            onStart={continueTraining}
            onTip={requestTip}
            onUndo={clearSelectedCards}
            onSkipAIWait={skipAIWait}
            phase={phase}
            selectedCount={state.selectedCards.length}
          />
        </motion.aside>
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
          <RuleBlock title="训练规则" items={["进入训练场后会生成一局训练牌局。", "先操作，再看 Ace Coach 的分析和推荐思路。", "每轮完成 学习 → 判断 → 反馈 → 成长。"]} />
        </div>
      </ArenaModal>

      <ArenaModal onClose={() => setActivePanel(null)} open={activePanel === "points"} title="训练点数">
        <TrainingPointsDetails points={trainingPoints} />
      </ArenaModal>

      <ArenaModal onClose={() => setActivePanel(null)} open={activePanel === "settings"} title="设置">
        <div className="space-y-4 text-[#12395a]">
          <SettingToggle checked={settings.sound} label="音效" onChange={(sound) => updateSettings({ sound })} />
          <SettingToggle checked={settings.animations} label="动画" onChange={(animations) => updateSettings({ animations })} />
          <SettingToggle checked={settings.aiTips} label="AI 提示" onChange={(aiTips) => updateSettings({ aiTips })} />
          <SpeedSelector speed={settings.aiSpeed} onChange={(aiSpeed) => updateSettings({ aiSpeed })} />
          <label className="block rounded-2xl bg-[#f3f9ff] p-5 font-black">
            <span className="flex items-center justify-between text-lg">
              牌面大小
              <span>{Math.round(settings.cardScale * 100)}%</span>
            </span>
            <input
              className="mt-3 w-full accent-[#0f64ff]"
              max="0.9"
              min="0.52"
              onChange={(event) => updateSettings({ cardScale: Number(event.target.value) })}
              step="0.02"
              type="range"
              value={settings.cardScale}
            />
          </label>
        </div>
      </ArenaModal>

      <ArenaModal onClose={() => setActivePanel(null)} open={activePanel === "feedback"} title="反馈">
        <div className="space-y-4 text-[#12395a]">
          <textarea
            className="min-h-[180px] w-full resize-none rounded-2xl border border-[#cbe7f8] bg-[#f8fcff] p-5 text-base font-bold leading-7 outline-none placeholder:text-[#6d91aa]"
            onChange={(event) => {
              setFeedbackSaved(false);
              setFeedbackText(event.target.value);
            }}
            placeholder="描述你遇到的问题或希望增加的训练能力..."
            value={feedbackText}
          />
          <button
            className="h-14 w-full rounded-2xl bg-[#0f64ff] text-lg font-black text-white shadow-[0_14px_30px_rgba(15,100,255,0.28)] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!feedbackText.trim()}
            onClick={saveFeedback}
            type="button"
          >
            提交反馈
          </button>
          {feedbackSaved ? <p className="text-sm font-black text-[#0f8d55]">已保存到本地反馈记录。</p> : null}
        </div>
      </ArenaModal>
    </main>
  );
}

function ArenaBackground() {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      aria-hidden
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Image
        alt=""
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src="/assets/arena/sky-training-arena.png"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(59,170,244,0.10)_55%,rgba(44,139,214,0.22))]" />
    </motion.div>
  );
}

function ArenaTopBar({
  onBackToLobby,
  onOpenCoach,
  onOpenFeedback,
  onOpenPoints,
  onOpenRules,
  onOpenSettings,
  phase,
  points
}: {
  onBackToLobby: () => void;
  onOpenCoach: () => void;
  onOpenFeedback: () => void;
  onOpenPoints: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  phase: TrainingPhase;
  points: typeof trainingPoints;
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
              Training Arena
            </p>
          </div>
        </div>

        <button
          className="flex shrink-0 items-center gap-4 rounded-full bg-white/72 px-5 py-2 text-left font-black text-[#12395a] shadow-[0_10px_24px_rgba(52,142,207,0.16)] transition hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-white hover:shadow-[0_16px_30px_rgba(52,142,207,0.22)] active:scale-[0.98] max-lg:gap-2 max-lg:px-3"
          onClick={onOpenPoints}
          type="button"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0f64ff] text-white shadow-[0_10px_22px_rgba(15,100,255,0.24)] max-lg:h-9 max-lg:w-9">
            分
          </span>
          <span>
            <span className="block text-xs font-black text-[#34749c]">训练点数</span>
            <span className="block text-xl leading-5 max-lg:text-base">{points.total}</span>
          </span>
          <span className="rounded-full bg-[#e9f7ff] px-3 py-1 text-sm text-[#0f8d55] max-lg:hidden">今日 +{points.today}</span>
          <span className="rounded-full bg-[#12395a]/88 px-3 py-1 text-xs text-white max-lg:hidden">{phaseText[phase]}</span>
        </button>

        <nav className="flex min-w-0 items-center gap-3 max-lg:gap-2">
          <HudButton icon="◉" label="AI Coach" onClick={onOpenCoach} />
          <HudButton icon="ⓘ" label="规则" onClick={onOpenRules} />
          <HudButton icon="⚙" label="设置" onClick={onOpenSettings} />
          <HudButton icon="▣" label="反馈" onClick={onOpenFeedback} />
          <button
            className="h-12 rounded-full bg-[#0f64ff] px-7 text-base font-black text-white shadow-[0_14px_30px_rgba(15,100,255,0.28)] transition hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_18px_34px_rgba(15,100,255,0.34)] active:scale-[0.97] max-lg:w-12 max-lg:px-0"
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

const phaseText: Record<TrainingPhase, string> = {
  idle: "准备",
  playing: "训练中",
  analysis: "分析中",
  completed: "完成"
};

function HudButton({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <button
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/42 px-5 text-sm font-black text-[#12395a] shadow-[0_10px_24px_rgba(52,142,207,0.14)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-white/72 hover:shadow-[0_14px_28px_rgba(52,142,207,0.20)] active:scale-[0.97] max-lg:w-11 max-lg:px-0"
      onClick={onClick}
      type="button"
    >
      <span>{icon}</span>
      <span className="max-lg:sr-only">{label}</span>
    </button>
  );
}

function TrainingPointsPanel({ phase, points }: { phase: TrainingPhase; points: typeof trainingPoints }) {
  return (
    <section className="rounded-[12px] border border-white/62 bg-white/68 p-4 text-[#12395a] shadow-[0_20px_45px_rgba(42,132,196,0.20)] backdrop-blur-xl">
      <h2 className="text-base font-black">训练点数</h2>
      <p className="mt-1 text-sm font-bold text-[#346d92]">只记录能力成长，不做竞技排名。</p>
      <div className="mt-3 rounded-2xl bg-white/74 p-3">
        <p className="text-xs font-black text-[#34749c]">累计点数</p>
        <p className="mt-1 text-3xl font-black text-[#0f64ff]">{points.total}</p>
        <p className="text-sm font-black text-[#0f8d55]">今日获得 +{points.today}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm font-black">
        <span className="rounded-xl bg-[#e9f7ff] px-2 py-2 text-[#0f64a0]">{phaseText[phase]}</span>
        <span className="rounded-xl bg-[#fff8df] px-2 py-2 text-[#8a6500]">成长记录</span>
      </div>
      <div className="mt-3 space-y-2">
        {points.records.slice(0, 2).map((record) => (
          <div className="rounded-xl bg-[#f3f9ff] px-3 py-2" key={record.label}>
            <div className="flex items-center justify-between text-sm font-black">
              <span>{record.label}</span>
              <span className="text-[#0f8d55]">{record.value}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrainingPointsDetails({ points }: { points: typeof trainingPoints }) {
  return (
    <article className="space-y-5 text-[#12395a]">
      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[#f3f9ff] p-5">
          <p className="text-base font-black text-[#34749c]">今日获得</p>
          <p className="mt-2 text-4xl font-black text-[#0f8d55]">+{points.today}</p>
        </div>
        <div className="rounded-2xl bg-[#f3f9ff] p-5">
          <p className="text-base font-black text-[#34749c]">累计点数</p>
          <p className="mt-2 text-4xl font-black text-[#0f64ff]">{points.total}</p>
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-[#d8ecf8]">
        <h3 className="text-xl font-black">能力提升记录</h3>
        <div className="mt-4 space-y-3">
          {points.records.map((record) => (
            <div className="rounded-2xl bg-[#f8fcff] p-4" key={record.label}>
              <div className="flex items-center justify-between gap-4">
                <p className="text-lg font-black">{record.label}</p>
                <span className="rounded-full bg-[#e8fff4] px-3 py-1 text-base font-black text-[#0f8d55]">{record.value}</span>
              </div>
              <p className="mt-2 text-base font-bold leading-7 text-[#345f78]">{record.note}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
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

function ReferenceActionBar({
  canAct,
  onPlay,
  onTip,
  selectedCount
}: {
  canAct: boolean;
  onPlay: () => void;
  onTip: () => void;
  selectedCount: number;
}) {
  return (
    <div className="mb-2 flex items-center justify-center gap-5 max-lg:mb-1 max-lg:gap-3">
      <button
        className="h-12 min-w-[128px] rounded-full border border-white/65 bg-[linear-gradient(180deg,#62c6ff,#1f78f2)] px-8 text-lg font-black text-white shadow-[0_12px_28px_rgba(31,120,242,0.28)] transition hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(31,120,242,0.34)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100 max-lg:h-10 max-lg:min-w-[96px] max-lg:px-5 max-lg:text-base"
        disabled={!canAct}
        onClick={onTip}
        type="button"
      >
        提示
      </button>
      <span className="grid h-11 w-11 place-items-center rounded-full border-[3px] border-[#ffdd73] bg-white text-lg font-black text-[#d33131] shadow-[0_8px_18px_rgba(132,66,20,0.18)] max-lg:h-9 max-lg:w-9 max-lg:text-base">
        16
      </span>
      <button
        className="h-12 min-w-[128px] rounded-full border border-white/65 bg-[linear-gradient(180deg,#ffd764,#ff9d20)] px-8 text-lg font-black text-white shadow-[0_12px_28px_rgba(255,157,32,0.30)] transition hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(255,157,32,0.36)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100 max-lg:h-10 max-lg:min-w-[96px] max-lg:px-5 max-lg:text-base"
        disabled={!canAct || selectedCount === 0}
        onClick={onPlay}
        type="button"
      >
        出牌
      </button>
    </div>
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

function SpeedSelector({
  onChange,
  speed
}: {
  onChange: (speed: TrainingSpeed) => void;
  speed: TrainingSpeed;
}) {
  const options: Array<{ id: TrainingSpeed; label: string; note: string }> = [
    { id: "slow", label: "慢速", note: "5 秒" },
    { id: "standard", label: "标准", note: "3 秒" },
    { id: "fast", label: "快速", note: "1 秒" },
    { id: "skip", label: "跳过", note: "立即" }
  ];

  return (
    <section className="rounded-2xl bg-[#f3f9ff] p-5">
      <p className="text-lg font-black text-[#12395a]">AI 行动速度</p>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {options.map((option) => (
          <button
            className={cn(
              "rounded-2xl px-3 py-3 text-center font-black transition",
              speed === option.id ? "bg-[#0f64ff] text-white shadow-[0_10px_24px_rgba(15,100,255,0.22)]" : "bg-white text-[#24557a]"
            )}
            key={option.id}
            onClick={() => onChange(option.id)}
            type="button"
          >
            <span className="block text-base">{option.label}</span>
            <span className="mt-1 block text-sm opacity-75">{option.note}</span>
          </button>
        ))}
      </div>
    </section>
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
