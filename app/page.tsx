import { AppShell } from "@/components/layout/AppShell";
import { OpeningHero } from "@/components/intro/OpeningHero";
import { DailyTrainingDashboard } from "@/features/daily-training/DailyTrainingDashboard";

export default function HomePage() {
  return (
    <OpeningHero>
      <AppShell variant="wide">
        <DailyTrainingDashboard />
      </AppShell>
    </OpeningHero>
  );
}
