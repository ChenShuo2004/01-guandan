import { AppShell } from "@/components/layout/AppShell";
import { GrowthReportView } from "@/features/assessment/GrowthReportView";

interface GrowthReportPageProps {
  params: {
    id: string;
  };
}

export default function GrowthReportPage({ params }: GrowthReportPageProps) {
  return (
    <AppShell title="成长报告" subtitle="七维画像、强项短板和下一步。" variant="wide">
      <GrowthReportView reportId={params.id} />
    </AppShell>
  );
}
