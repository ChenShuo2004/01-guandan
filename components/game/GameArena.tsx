"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ActionButtons } from "@/components/game/ActionButtons";
import { CoachBubble } from "@/components/game/CoachBubble";
import { GameTable } from "@/components/game/GameTable";
import { HandCards } from "@/components/game/HandCards";
import { useGameStore } from "@/store/gameStore";
import { cn } from "@/lib/utils";
import type { TrainingPhase } from "@/lib/guandan/gameState";
import type { ArenaPlayer } from "@/types/game";

type TrainingLevel = "beginner" | "intermediate" | "advanced";

interface ArenaSettings {
  sound: boolean;
  animations: boolean;
  aiTips: boolean;
  cardScale: number;
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
  animations: true,
  aiTips: true,
  cardScale: 0.62
};

export function GameArena() {
  const router = useRouter();
  const [activeLevel, setActiveLevel] = useState<TrainingLevel>("beginner");
  const [activePanel, setActivePanel] = useState<"coach" | "rules" | "settings" | "feedback" | null>(null);
  const [settings, setSettings] = useState<ArenaSettings>(defaultSettings);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [compactLayout, setCompactLayout] = useState(false);
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
    runAIAction,
    restart
  } = useGameStore();

  const activeTrainingLevel = useMemo(
    () => trainingLevels.find((level) => level.id === activeLevel) ?? trainingLevels[0],
    [activeLevel]
  );
  const effectiveCardScale = compactLayout ? 0.38 : settings.cardScale;

  useEffect(() => {
    if (state.trainingPhase !== "playing" || state.gameStatus !== "playing" || currentPlayer?.kind !== "ai") return;

    const timer = window.setTimeout(() => {
      runAIAction();
    }, 900);

    return () => window.clearTimeout(timer);
  }, [currentPlayer?.id, currentPlayer?.kind, runAIAction, state.gameStatus, state.trainingPhase, state.turnNumber]);

  useEffect(() => {
    function syncLayout() {
      setCompactLayout(window.innerWidth < 1024 || window.innerHeight < 620);
    }

    syncLayout();
    window.addEventListener("resize", syncLayout);
    return () => window.removeEventListener("resize", syncLayout);
  }, []);

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
            : currentPlayer?.id === player.id
              ? player.kind === "ai"
                ? "thinking"
                : "active"
              : player.passed
                ? "passed"
                : "waiting"
      })),
    [currentPlayer?.id, state.gameStatus, state.players]
  );

  const phase = state.trainingPhase;
  const tableCards = state.lastPlayedCards;
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

  function saveFeedback() {
    if (!feedbackText.trim()) return;

    const feedback = {
      id: `feedback-${Date.now()}`,
      text: feedbackText.trim(),
      level: activeLevel,
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
        activeLevel={activeLevel}
        onBackToLobby={goLobby}
        onOpenCoach={() => setActivePanel("coach")}
        onOpenFeedback={() => setActivePanel("feedback")}
        onOpenRules={() => setActivePanel("rules")}
        onOpenSettings={() => setActivePanel("settings")}
        onSelectLevel={changeLevel}
        phase={phase}
      />

      <section className="relative z-10 mx-auto h-full w-full max-w-[1680px] px-4 pb-3 pt-[84px] lg:px-5">
        <GameTable players={arenaPlayers} tableCards={tableCards} />

        {settings.aiTips ? (
          <motion.button
            animate={
              settings.animations
                ? { opacity: 1, y: [0, -4, 0] }
                : { opacity: 1, y: 0 }
            }
            className="absolute left-1/2 top-[92px] z-[62] flex w-[min(500px,42vw)] -translate-x-1/2 items-center gap-3 rounded-[22px] border border-white/65 bg-white/58 px-4 py-3 text-left shadow-[0_20px_48px_rgba(42,132,196,0.20)] backdrop-blur-xl max-lg:top-[90px] max-lg:w-[300px] max-lg:py-2"
            initial={{ opacity: 0, y: -14 }}
            onClick={() => setActivePanel("coach")}
            transition={settings.animations ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" } : undefined}
            type="button"
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
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#0f64a0]">Ace Coach</p>
              <p className="mt-1 truncate text-base font-black text-[#12395a] max-lg:text-sm">「{state.coachFeedback.suggestion}」</p>
            </div>
          </motion.button>
        ) : null}

        <div className="absolute right-7 top-[86px] z-50 hidden w-[238px] xl:block">
          <PerformancePanel level={activeTrainingLevel} phase={phase} />
        </div>

        <div className="pointer-events-none absolute left-1/2 top-[61%] z-40 w-[min(560px,42vw)] -translate-x-1/2 text-center text-white drop-shadow-[0_3px_8px_rgba(34,92,146,0.42)] max-lg:top-[54%] max-lg:w-[360px]">
          <AnalysisPanel reason={state.coachFeedback.reason} status={roundStatus} />
        </div>

        <section className="training-hand-dock absolute bottom-3 left-3 right-[158px] z-[60] min-w-0 lg:left-[220px] lg:right-[240px] 2xl:left-[300px] 2xl:right-[300px]">
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
        </section>

        <aside className="absolute bottom-3 right-3 z-[60] w-[142px] lg:right-7 lg:w-[188px]">
          <div className="mb-2 rounded-[24px] border border-white/42 bg-[#6db8e8]/36 px-3 py-2 text-sm font-black text-[#143d5d] shadow-[0_18px_45px_rgba(38,126,190,0.18)] backdrop-blur-xl lg:mb-3 lg:px-4 lg:py-3 lg:text-base">
            <span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#1ee271]" />
            本轮可出牌
          </div>
          <ActionButtons
            canAct={isUserTurn}
            compact
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
            phase={phase}
            selectedCount={state.selectedCards.length}
          />
        </aside>
      </section>

      <ArenaModal onClose={() => setActivePanel(null)} open={activePanel === "coach"} title="AI Coach">
        <CoachBubble feedback={state.coachFeedback} />
      </ArenaModal>

      <ArenaModal onClose={() => setActivePanel(null)} open={activePanel === "rules"} title="训练规则">
        <div className="space-y-4 text-sm font-bold leading-6 text-[#24557a]">
          <RuleBlock title="掼蛋基础规则" items={["四人两两组队，目标是尽快出完手牌。", "轮到你时必须出同牌型且更大的牌，炸弹可压普通牌型。", "一圈都不出时，牌权回到上一位出牌者。"]} />
          <RuleBlock title="牌型说明" items={["单牌、对子、三张、三带二、顺子是基础牌型。", "四张及以上同点数为炸弹，四王炸最大。", "顺子不包含 2 和大小王。"]} />
          <RuleBlock title="训练规则" items={["选择等级后会生成一局训练牌局。", "先操作，再看 Ace Coach 的分析和推荐思路。", "每轮完成 学习 → 判断 → 反馈 → 成长。"]} />
        </div>
      </ArenaModal>

      <ArenaModal onClose={() => setActivePanel(null)} open={activePanel === "settings"} title="设置">
        <div className="space-y-4 text-[#12395a]">
          <SettingToggle checked={settings.sound} label="音效" onChange={(sound) => updateSettings({ sound })} />
          <SettingToggle checked={settings.animations} label="动画" onChange={(animations) => updateSettings({ animations })} />
          <SettingToggle checked={settings.aiTips} label="AI 提示" onChange={(aiTips) => updateSettings({ aiTips })} />
          <label className="block rounded-2xl bg-white/48 p-4 font-black">
            <span className="flex items-center justify-between text-sm">
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
            className="min-h-[150px] w-full resize-none rounded-2xl border border-white/62 bg-white/70 p-4 text-sm font-bold outline-none placeholder:text-[#6d91aa]"
            onChange={(event) => {
              setFeedbackSaved(false);
              setFeedbackText(event.target.value);
            }}
            placeholder="描述你遇到的问题或希望增加的训练能力..."
            value={feedbackText}
          />
          <button
            className="h-12 w-full rounded-2xl bg-[#0f64ff] text-base font-black text-white shadow-[0_14px_30px_rgba(15,100,255,0.28)] disabled:cursor-not-allowed disabled:opacity-45"
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
  onBackToLobby,
  onOpenCoach,
  onOpenFeedback,
  onOpenRules,
  onOpenSettings,
  onSelectLevel,
  phase
}: {
  activeLevel: TrainingLevel;
  onBackToLobby: () => void;
  onOpenCoach: () => void;
  onOpenFeedback: () => void;
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
              Training Arena
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 rounded-full bg-white/34 px-3 py-2 text-base font-black text-[#12395a] shadow-[0_10px_24px_rgba(52,142,207,0.14)] backdrop-blur-xl md:flex max-lg:gap-1 max-lg:px-2">
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
          <HudButton icon="▣" label="反馈" onClick={onOpenFeedback} />
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
        <span>得分</span>
        <span>总计</span>
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
        className="h-12 min-w-[128px] rounded-full border border-white/65 bg-[linear-gradient(180deg,#62c6ff,#1f78f2)] px-8 text-lg font-black text-white shadow-[0_12px_28px_rgba(31,120,242,0.28)] transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 max-lg:h-10 max-lg:min-w-[96px] max-lg:px-5 max-lg:text-base"
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
        className="h-12 min-w-[128px] rounded-full border border-white/65 bg-[linear-gradient(180deg,#ffd764,#ff9d20)] px-8 text-lg font-black text-white shadow-[0_12px_28px_rgba(255,157,32,0.30)] transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 max-lg:h-10 max-lg:min-w-[96px] max-lg:px-5 max-lg:text-base"
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
      <section className="w-[min(560px,92vw)] rounded-[26px] border border-white/65 bg-[#eaf8ff]/88 p-5 shadow-[0_24px_70px_rgba(8,35,61,0.28)] backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-[#12395a]">{title}</h2>
          <button
            className="grid h-10 w-10 place-items-center rounded-full bg-white/62 text-lg font-black text-[#12395a]"
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
    <section className="rounded-2xl bg-white/48 p-4">
      <h3 className="font-black text-[#12395a]">{title}</h3>
      <ul className="mt-2 space-y-1">
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
    <label className="flex items-center justify-between rounded-2xl bg-white/48 p-4 text-sm font-black">
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

function roleLabel(position: string) {
  if (position === "left") return "上家";
  if (position === "right") return "下家";
  if (position === "top") return "对家";
  return "我";
}
