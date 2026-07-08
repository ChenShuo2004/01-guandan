import { AppShell } from "@/components/layout/AppShell";
import { DailyTrainingDashboard } from "@/features/daily-training/DailyTrainingDashboard";

export default function HomePage() {
  return (
    <AppShell variant="wide">
      <DailyTrainingDashboard />
    </AppShell>
  );
}
