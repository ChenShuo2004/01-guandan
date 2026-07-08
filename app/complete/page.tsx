import { AppShell } from "@/components/layout/AppShell";
import { DailyTrainingResult } from "@/features/daily-training/DailyTrainingResult";

export default function CompletePage() {
  return (
    <AppShell title="今日完成" subtitle="一课一题已经完成，明天继续。">
      <DailyTrainingResult />
    </AppShell>
  );
}
