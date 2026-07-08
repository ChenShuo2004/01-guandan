import { CoachBubble } from "@/components/coach/CoachBubble";
import { AppShell } from "@/components/layout/AppShell";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const colorTokens = [
  ["Background", "bg-guandan-background", "#0B1020"],
  ["Arena", "bg-guandan-arena", "#101827"],
  ["Panel", "bg-guandan-card", "#151D2E"],
  ["Elevated", "bg-guandan-elevated", "#1B2538"],
  ["Energy", "bg-guandan-gold", "#F6C65B"],
  ["Tech", "bg-guandan-blue", "#4DA3FF"],
  ["Success", "bg-guandan-success", "#45D483"],
  ["Danger", "bg-guandan-danger", "#FF6B6B"],
  ["Reward", "bg-guandan-reward", "#FFD36A"]
];

export default function DesignSystemPage() {
  return (
    <AppShell
      title="Design System"
      subtitle="AI 掼蛋成长训练 App 的基础视觉组件。"
      variant="wide"
    >
      <div className="space-y-5">
        <Card variant="training">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant="energy">Daily Mission</Badge>
              <h2 className="mt-3 text-2xl font-black leading-8">今日训练任务卡</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-guandan-subtext">
                用于首页首屏。强调今日目标、主行动和成长奖励。
              </p>
            </div>
            <Badge variant="reward">+20 XP</Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button>开始训练</Button>
            <Button variant="secondary">直接挑战</Button>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-bold text-guandan-gold">Color Tokens</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {colorTokens.map(([name, className, value]) => (
              <div
                className="flex items-center gap-3 rounded-2xl border border-guandan-border bg-guandan-muted p-3"
                key={name}
              >
                <div className={`h-10 w-10 rounded-xl ${className}`} />
                <div>
                  <p className="text-sm font-bold">{name}</p>
                  <p className="text-xs font-semibold text-guandan-subtext">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="text-sm font-bold text-guandan-gold">Cards</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-panel border border-guandan-border bg-guandan-elevated p-3 shadow-panel">
                <p className="text-sm font-bold">Elevated Panel</p>
                <p className="mt-1 text-sm text-guandan-subtext">用于普通训练信息区。</p>
              </div>
              <div className="rounded-panel border border-guandan-success/50 bg-guandan-success/10 p-3 shadow-panel">
                <p className="text-sm font-bold text-guandan-success">Success Panel</p>
                <p className="mt-1 text-sm text-guandan-subtext">用于答对和成长反馈。</p>
              </div>
              <div className="rounded-panel border border-guandan-danger/50 bg-guandan-danger/10 p-3 shadow-panel">
                <p className="text-sm font-bold text-guandan-danger">Warning Panel</p>
                <p className="mt-1 text-sm text-guandan-subtext">用于风险提醒和错题反馈。</p>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold text-guandan-gold">Buttons</p>
            <div className="mt-4 grid gap-3">
              <Button>主行动</Button>
              <Button variant="secondary">科技次行动</Button>
              <Button variant="success">答对反馈</Button>
              <Button variant="danger">风险提醒</Button>
              <Button variant="ghost">轻量操作</Button>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="text-sm font-bold text-guandan-gold">Badges</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>普通标签</Badge>
              <Badge variant="energy">Day 1 / 7</Badge>
              <Badge variant="tech">AI 分析</Badge>
              <Badge variant="success">已完成</Badge>
              <Badge variant="danger">错题</Badge>
              <Badge variant="reward">+20 XP</Badge>
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold text-guandan-gold">Progress</p>
            <div className="mt-4 space-y-5">
              <ProgressBar label="XP 能量槽" max={100} value={42} />
              <ProgressBar label="7 天训练" max={7} tone="success" value={3} />
              <ProgressBar label="AI 分析准备" max={100} tone="tech" value={68} />
              <ProgressBar label="风险掌控" max={100} tone="danger" value={24} />
            </div>
          </Card>
        </div>

        <Card>
          <p className="text-sm font-bold text-guandan-gold">Coach Bubble</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <CoachBubble
              action="wave"
              caption="重点看牌权。"
              text="今天先练炸弹时机。"
            />
            <CoachBubble
              action="thinking"
              caption="别只看自己手牌。"
              text="先想谁现在最急。"
            />
            <CoachBubble
              action="warning"
              caption="对手只剩 2 张。"
              text="这里不能随便过。"
            />
            <CoachBubble
              action="celebrate"
              caption="明天继续练配合。"
              text="很好，今天完成了。"
            />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
