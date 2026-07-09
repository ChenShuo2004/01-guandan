import { AppShell } from "@/components/layout/AppShell";
import { GuandanLearningPath } from "@/features/learning/GuandanLearningPath";

export default function LearningPathPage() {
  return (
    <AppShell title="学习路线" subtitle="PDF 知识资产驱动的 AI 掼蛋课程。" variant="wide">
      <GuandanLearningPath />
    </AppShell>
  );
}
