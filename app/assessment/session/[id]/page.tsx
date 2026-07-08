import { AppShell } from "@/components/layout/AppShell";
import { AssessmentSessionView } from "@/features/assessment/AssessmentSessionView";

interface AssessmentSessionPageProps {
  params: {
    id: string;
  };
}

export default function AssessmentSessionPage({ params }: AssessmentSessionPageProps) {
  return (
    <AppShell title="测评中" subtitle="每题只做一个判断。" variant="wide">
      <AssessmentSessionView sessionId={params.id} />
    </AppShell>
  );
}
