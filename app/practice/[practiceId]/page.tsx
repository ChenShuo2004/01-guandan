import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  getPracticeById,
  samplePracticeCases
} from "@/content/cases/sample-practice";
import { PracticeExperience } from "@/features/practice/PracticeExperience";

interface PracticeCasePageProps {
  params: {
    practiceId: string;
  };
}

export function generateStaticParams() {
  return samplePracticeCases.map((practiceCase) => ({
    practiceId: practiceCase.id
  }));
}

export default function PracticeCasePage({ params }: PracticeCasePageProps) {
  const practiceCase = getPracticeById(params.practiceId);

  if (!practiceCase) {
    notFound();
  }

  return (
    <AppShell
      subtitle="学完知识点后，马上用一道题验证。"
      title="今日残局"
      variant="wide"
    >
      <PracticeExperience practiceCase={practiceCase} />
    </AppShell>
  );
}
