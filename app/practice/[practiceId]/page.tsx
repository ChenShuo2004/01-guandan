import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PracticeExperience } from "@/features/practice/PracticeExperience";
import { getPracticeById, samplePracticeCases } from "@/content/cases/sample-practice";

export function generateStaticParams() {
  return samplePracticeCases.map((practiceCase) => ({
    practiceId: practiceCase.id
  }));
}

interface PracticeSessionPageProps {
  params: {
    practiceId: string;
  };
}

export default function PracticeSessionPage({ params }: PracticeSessionPageProps) {
  const practiceCase = getPracticeById(params.practiceId);

  if (!practiceCase) {
    notFound();
  }

  return (
    <AppShell title={practiceCase.title} subtitle="先判断，再看 Ace 的反馈。">
      <PracticeExperience practiceCase={practiceCase} />
    </AppShell>
  );
}
