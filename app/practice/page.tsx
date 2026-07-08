import { AppShell } from "@/components/layout/AppShell";
import { PracticeExperience } from "@/features/practice/PracticeExperience";
import { whenToBombPractice } from "@/content/cases/sample-practice";

export default function PracticePage() {
  return (
    <AppShell title="残局练习" subtitle="先判断局势，再决定要不要炸。">
      <PracticeExperience practiceCase={whenToBombPractice} />
    </AppShell>
  );
}
