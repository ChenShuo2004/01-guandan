import { AppShell } from "@/components/layout/AppShell";
import { DailyTrainingDashboard } from "@/features/daily-training/DailyTrainingDashboard";

export default function HomePage() {
  return (
    <AppShell
      subtitle="每天一课一题，3 分钟完成一次实战判断。"
      title="今日训练台"
      variant="wide"
    >
      <DailyTrainingDashboard />
    </AppShell>
  );
}
