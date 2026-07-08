import { AppShell } from "@/components/layout/AppShell";
import { LearningPathView } from "@/features/assessment/LearningPathView";

export default function LearningPathPage() {
  return (
    <AppShell title="学习路线" subtitle="按短板生成下一步训练。" variant="wide">
      <LearningPathView />
    </AppShell>
  );
}
