import { AppShell } from "@/components/layout/AppShell";
import { CoachBubble } from "@/components/coach/CoachBubble";
import { Button } from "@/components/ui/Button";
import { ProfileSummary } from "@/features/progress/ProfileSummary";

export default function CompletePage() {
  return (
    <AppShell title="今日完成" subtitle="知识点和残局训练已经形成闭环。">
      <div className="space-y-4">
        <CoachBubble
          action="celebrate"
          caption="你已经完成了今天的小 Demo 训练。"
          text="很好。下一局先看牌权。"
        />
        <ProfileSummary />
        <div className="grid grid-cols-2 gap-3">
          <Button href="/paths" variant="secondary">
            回路径
          </Button>
          <Button href="/">回首页</Button>
        </div>
      </div>
    </AppShell>
  );
}
