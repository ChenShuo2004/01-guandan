import { AppShell } from "@/components/layout/AppShell";
import { AssessmentStart } from "@/features/assessment/AssessmentStart";

export default function AssessmentStartPage() {
  return (
    <AppShell title="能力测评" subtitle="先判断，再训练。" variant="wide">
      <AssessmentStart />
    </AppShell>
  );
}
