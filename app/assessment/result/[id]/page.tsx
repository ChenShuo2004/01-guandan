import { AppShell } from "@/components/layout/AppShell";
import { AssessmentResultView } from "@/features/assessment/AssessmentResultView";

interface AssessmentResultPageProps {
  params: {
    id: string;
  };
}

export default function AssessmentResultPage({ params }: AssessmentResultPageProps) {
  return (
    <AppShell title="测评结果" subtitle="把判断结果变成下一步训练。" variant="wide">
      <AssessmentResultView sessionId={params.id} />
    </AppShell>
  );
}
