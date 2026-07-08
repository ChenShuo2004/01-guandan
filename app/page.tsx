import { AppShell } from "@/components/layout/AppShell";
import { CoachBubble } from "@/components/coach/CoachBubble";
import { LessonCard } from "@/components/lessons/LessonCard";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { Button } from "@/components/ui/Button";
import { whenToBombLesson } from "@/content/lessons/sample-lessons";
import { ProfileSummary } from "@/features/progress/ProfileSummary";

export default function HomePage() {
  return (
    <AppShell
      subtitle="1 分钟学一个判断，下一局马上能用。"
      title="今天继续学习"
      variant="wide"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)] lg:items-start lg:gap-6">
        <div className="space-y-4">
          <div className="lg:hidden">
            <CoachBubble
              action="wave"
              caption="今天先学会一个判断。"
              text="别急。先学会什么时候该炸。"
            />
          </div>

          <LessonCard lesson={whenToBombLesson} />

          <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-guandan-gold">学习路径</p>
                <h2 className="mt-1 text-lg font-black lg:text-2xl">
                  Lv4 炸弹使用
                </h2>
              </div>
              <Button href="/paths" variant="secondary">
                查看
              </Button>
            </div>
            <div className="mt-4">
              <ProgressBar label="路径进度" max={5} value={3} />
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-guandan-gold">专题策展</p>
                <h2 className="mt-1 text-lg font-black">横向滑动专题区</h2>
              </div>
            </div>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
              {["炸弹技巧", "残局 100 题", "助攻配合"].map((topic) => (
                <div
                  className="min-w-48 rounded-3xl border border-guandan-border bg-guandan-card p-4 lg:min-w-56"
                  key={topic}
                >
                  <p className="text-sm font-bold text-guandan-gold">专题</p>
                  <h3 className="mt-8 text-lg font-black">{topic}</h3>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8">
          <div className="hidden lg:block">
            <CoachBubble
              action="wave"
              caption="今天先学会一个判断。"
              text="别急。先学会什么时候该炸。"
            />
          </div>

          <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4">
            <p className="text-sm font-bold text-guandan-gold">今日残局</p>
            <h2 className="mt-2 text-lg font-black">对手剩 2 张，你有炸。</h2>
            <p className="mt-2 text-sm leading-6 text-guandan-subtext">
              学完知识点后，马上用一道题验证。
            </p>
            <Button className="mt-4 w-full" href="/practice" variant="secondary">
              去练习
            </Button>
          </section>

          <ProfileSummary />
        </aside>
      </div>
    </AppShell>
  );
}
