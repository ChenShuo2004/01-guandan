import { AppShell } from "@/components/layout/AppShell";
import { CoachBubble } from "@/components/coach/CoachBubble";
import { LessonCard } from "@/components/lessons/LessonCard";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { Button } from "@/components/ui/Button";
import { whenToBombLesson } from "@/content/lessons/sample-lessons";

export default function HomePage() {
  return (
    <AppShell title="今天继续学习" subtitle="1 分钟学一个判断，下一局马上能用。">
      <div className="space-y-4">
        <CoachBubble
          action="wave"
          caption="今天先学会一个判断。"
          text="别急。先学会什么时候该炸。"
        />

        <LessonCard lesson={whenToBombLesson} />

        <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-guandan-gold">学习路径</p>
              <h2 className="mt-1 text-lg font-black">Lv4 炸弹使用</h2>
            </div>
            <Button href="/paths" variant="secondary">
              查看
            </Button>
          </div>
          <div className="mt-4">
            <ProgressBar label="路径进度" max={5} value={3} />
          </div>
        </section>

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
      </div>
    </AppShell>
  );
}
