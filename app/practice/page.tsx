import { AppShell } from "@/components/layout/AppShell";
import { PracticeExperience } from "@/features/practice/PracticeExperience";
import { whenToBombPractice } from "@/content/cases/sample-practice";

export default function PracticePage() {
  return (
    <AppShell
      subtitle="先判断局势，再决定要不要炸。"
      title="残局练习"
      variant="wide"
    >
      <PracticeExperience practiceCase={whenToBombPractice} />
    </AppShell>
  );
}
