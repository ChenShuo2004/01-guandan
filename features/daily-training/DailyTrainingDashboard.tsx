"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SideRays from "@/components/effects/SideRays";
import SplitText from "@/components/effects/SplitText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getTodayTraining } from "@/features/daily-training";
import { useProgress } from "@/features/progress/useProgress";
import { cn } from "@/lib/utils";

const INTRO_STORAGE_KEY = "guandan-ace-intro-seen";

function AceAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] border border-guandan-gold/45 bg-guandan-gold/10 shadow-energy",
        className
      )}
      aria-label="Ace AI 教练"
    >
      <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full border border-guandan-background bg-guandan-cyan shadow-tech" />
      <div className="absolute inset-3 rounded-[1.25rem] border border-guandan-blue/30 bg-guandan-background/70" />
      <span className="relative text-lg font-black text-guandan-gold">Ace</span>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <p className="text-xs font-bold text-guandan-blue">{children}</p>;
}

function InsightRow({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "focus";
}) {
  return (
    <div className="rounded-2xl border border-guandan-border bg-guandan-muted/70 p-3">
      <p
        className={cn(
          "text-xs font-bold",
          tone === "good" && "text-guandan-success",
          tone === "focus" && "text-guandan-gold",
          tone === "default" && "text-guandan-subtext"
        )}
      >
        {label}
      </p>
      <p className="mt-1 text-sm font-bold leading-6 text-guandan-text">{value}</p>
    </div>
  );
}

function IntroBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center opacity-70 lg:bg-[center_44%]"
        style={{ backgroundImage: "url('/assets/home-ace-cards.png')" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(77,163,255,0.24),transparent_26rem),radial-gradient(circle_at_22%_74%,rgba(246,198,91,0.16),transparent_24rem),linear-gradient(90deg,rgba(3,7,18,0.96)_0%,rgba(3,7,18,0.78)_48%,rgba(3,7,18,0.54)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,16,32,0.24)_0%,rgba(11,16,32,0.86)_100%)]" />
      <SideRays
        className="absolute inset-0"
        blend={0.72}
        falloff={1.48}
        intensity={2.2}
        opacity={0.9}
        origin="top-right"
        rayColor1="#F6C65B"
        rayColor2="#54D7FF"
        saturation={1.55}
        speed={1.8}
        spread={2.35}
        tilt={-8}
      />
      <SideRays
        className="absolute inset-0 opacity-60"
        blend={0.62}
        falloff={1.72}
        intensity={1.45}
        opacity={0.55}
        origin="bottom-left"
        rayColor1="#FF3B4F"
        rayColor2="#4DA3FF"
        saturation={1.35}
        speed={1.15}
        spread={1.7}
        tilt={14}
      />
    </div>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="fixed inset-0 z-50 flex min-h-screen items-center overflow-y-auto overflow-x-hidden px-4 py-12 md:px-8 lg:px-12">
      <IntroBackdrop />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.45fr)] lg:items-end">
        <div className="max-w-3xl">
          <div className="mb-7 flex items-center gap-4">
            <AceAvatar className="h-16 w-16 rounded-[1.35rem]" />
            <div>
              <p className="text-sm font-bold text-guandan-gold">Ace AI Coach</p>
              <p className="mt-1 text-sm font-semibold text-guandan-subtext">
                你的 AI 掼蛋教练
              </p>
            </div>
          </div>

          <SplitText
            className="text-left text-3xl font-black leading-[1.18] text-guandan-text drop-shadow-[0_18px_44px_rgba(0,0,0,0.55)] sm:text-5xl sm:leading-[1.12] lg:text-6xl lg:leading-[1.08]"
            delay={28}
            duration={0.72}
            ease="power4.out"
            from={{ opacity: 0, y: 54, rotateX: -72, filter: "blur(10px)" }}
            rootMargin="0px"
            splitType="words, chars"
            tag="h1"
            text="懂规则，不等于会实战。"
            textAlign="left"
            threshold={0.01}
            to={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
          />

          <div className="mt-7 max-w-2xl space-y-3 text-sm font-semibold leading-7 text-guandan-subtext sm:text-base sm:leading-8">
            <SplitText
              className="block text-left"
              delay={14}
              duration={0.58}
              ease="power3.out"
              from={{ opacity: 0, y: 22, filter: "blur(6px)" }}
              rootMargin="0px"
              splitType="words"
              text="很多刚开始学习掼蛋的人，都会经历这样的阶段。"
              textAlign="left"
              threshold={0.01}
              to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            />
            <p>
              知道规则，却不知道什么时候应该出什么牌。输掉比赛后，也不知道自己的问题在哪里。
            </p>
            <p className="text-guandan-text">
              其实掼蛋是一项可以训练的能力。我会帮你分析牌局，找到问题，一步一步提升判断能力。
            </p>
          </div>

          <Button className="mt-8 w-full sm:w-auto" onClick={onStart}>
            开始训练
          </Button>
        </div>

        <div className="rounded-[1.75rem] border border-guandan-blue/25 bg-guandan-background/45 p-4 shadow-tech backdrop-blur-xl lg:p-5">
          <p className="text-xs font-bold text-guandan-blue">第一次训练</p>
          <h2 className="mt-2 text-xl font-black leading-7">先学会看局势</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-guandan-subtext">
            今天不用记很多技巧。先完成一次残局判断，理解什么时候进攻，什么时候防守。
          </p>
          <div className="mt-5 grid gap-2">
            <div className="rounded-2xl border border-guandan-border bg-guandan-muted/60 px-3 py-2 text-sm font-bold">
              1. 看当前牌局
            </div>
            <div className="rounded-2xl border border-guandan-border bg-guandan-muted/60 px-3 py-2 text-sm font-bold">
              2. 做出攻守判断
            </div>
            <div className="rounded-2xl border border-guandan-border bg-guandan-muted/60 px-3 py-2 text-sm font-bold">
              3. 获得 Ace 反馈
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CoachPanel() {
  return (
    <Card className="relative overflow-hidden bg-guandan-card/88 lg:min-h-[calc(100vh-7rem)]">
      <div className="absolute -right-20 top-0 h-48 w-48 rounded-full bg-guandan-blue/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-4">
          <AceAvatar className="h-16 w-16 rounded-[1.35rem]" />
          <div>
            <SectionLabel>AI 教练区域</SectionLabel>
            <h2 className="mt-1 text-xl font-black">Ace AI 教练</h2>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-guandan-blue/25 bg-guandan-blue/10 p-4">
          <p className="text-base font-bold leading-7">
            你好，今天我们继续提升你的掼蛋判断能力。
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-guandan-subtext">
            我会关注你的出牌选择，记录容易出错的判断，并给你下一次训练建议。
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-guandan-border bg-guandan-muted/70 p-3">
            <p className="text-xs font-bold text-guandan-mutedText">今日关注</p>
            <p className="mt-1 text-sm font-bold leading-6">先判断局势，再决定进攻还是防守。</p>
          </div>
          <div className="rounded-2xl border border-guandan-border bg-guandan-muted/70 p-3">
            <p className="text-xs font-bold text-guandan-mutedText">训练方式</p>
            <p className="mt-1 text-sm font-bold leading-6">学习一个判断，完成一道牌局训练，得到反馈。</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TodayTrainingCard({ trainingHref }: { trainingHref: string }) {
  return (
    <Card className="relative overflow-hidden border-guandan-gold/55 bg-guandan-gold/10 shadow-energy">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-guandan-gold to-transparent" />
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-guandan-blue/14 blur-3xl" />

      <div className="relative">
        <SectionLabel>今日训练</SectionLabel>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-black leading-10">残局判断</h2>
            <p className="mt-3 max-w-2xl text-base font-bold leading-7 text-guandan-text">
              学会判断什么时候进攻，什么时候防守。
            </p>
          </div>
          <div className="rounded-2xl border border-guandan-border bg-guandan-background/50 px-4 py-3">
            <p className="text-xs font-bold text-guandan-mutedText">预计时间</p>
            <p className="mt-1 text-lg font-black text-guandan-gold">5 分钟</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <InsightRow label="步骤 1" value="看懂当前牌局" />
          <InsightRow label="步骤 2" value="判断攻守选择" />
          <InsightRow label="步骤 3" value="获得 Ace 反馈" />
        </div>

        <Button className="mt-6 w-full sm:w-auto" href={trainingHref}>
          开始训练
        </Button>
      </div>
    </Card>
  );
}

function TrainingRecordCard() {
  return (
    <Card>
      <SectionLabel>训练记录</SectionLabel>
      <h2 className="mt-2 text-xl font-black">最近训练</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InsightRow label="完成" value="牌型判断训练" tone="good" />
        <InsightRow label="发现问题" value="炸弹使用时机需要加强" tone="focus" />
      </div>
      <p className="mt-4 text-sm font-semibold leading-6 text-guandan-subtext">
        Ace 会把每次训练暴露的问题沉淀下来，下一次训练优先帮你补短板。
      </p>
    </Card>
  );
}

function AbilityCard() {
  return (
    <Card>
      <SectionLabel>能力分析</SectionLabel>
      <h2 className="mt-2 text-xl font-black">你的判断画像</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InsightRow label="你的优势" value="牌型识别较好" tone="good" />
        <InsightRow label="需要提升" value="出牌策略" tone="focus" />
      </div>
      <p className="mt-4 text-sm font-semibold leading-6 text-guandan-subtext">
        首页只保留下一步行动和关键反馈，不做功能堆叠。
      </p>
    </Card>
  );
}

export function DailyTrainingDashboard() {
  const router = useRouter();
  const { progress, isReady } = useProgress();
  const [showIntro, setShowIntro] = useState(false);

  const trainingHref = useMemo(() => {
    if (!isReady) {
      return "/practice";
    }

    const todayTraining = getTodayTraining(progress);

    return todayTraining?.lessonId ? `/lessons/${todayTraining.lessonId}` : "/practice";
  }, [isReady, progress]);

  useEffect(() => {
    setShowIntro(window.localStorage.getItem(INTRO_STORAGE_KEY) !== "true");
  }, []);

  function startTraining() {
    window.localStorage.setItem(INTRO_STORAGE_KEY, "true");
    setShowIntro(false);
    router.push(trainingHref);
  }

  if (showIntro) {
    return <IntroScreen onStart={startTraining} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-bold text-guandan-gold">AI 掼蛋训练助手</p>
            <h1 className="text-2xl font-black leading-9 lg:text-3xl lg:leading-10">
              今天只练一个判断，把输牌原因变成下一步训练。
            </h1>
          </div>

          <div className="lg:hidden">
            <CoachPanel />
          </div>

          <TodayTrainingCard trainingHref={trainingHref} />
          <TrainingRecordCard />
          <AbilityCard />
        </div>

        <aside className="hidden lg:sticky lg:top-8 lg:block">
          <CoachPanel />
        </aside>
      </div>
    </div>
  );
}
