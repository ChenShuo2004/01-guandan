import { AppShell } from "@/components/layout/AppShell";
import { CoachBubble } from "@/components/coach/CoachBubble";

export default function CoachPage() {
  return (
    <AppShell title="AI 教练" subtitle="V1 使用本地结构化反馈，不接真实 AI。">
      <div className="space-y-4">
        <CoachBubble
          action="thinking"
          caption="我会在学习和练习里给短句反馈。"
          text="先看局势，再看炸弹。"
        />
        <section className="rounded-3xl border border-guandan-border bg-guandan-card p-4">
          <p className="text-sm font-bold text-guandan-gold">V1 边界</p>
          <h2 className="mt-2 text-xl font-black">不接真实 AI</h2>
          <p className="mt-2 text-sm leading-6 text-guandan-subtext">
            现在先用固定结构化文案验证训练闭环。后续再接入牌局分析和截图识别。
          </p>
        </section>
      </div>
    </AppShell>
  );
}
