import { notFound } from "next/navigation";
import { MemoryTrainingExperience } from "@/features/practice/MemoryTrainingExperience";
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
  if (!getPracticeById(params.practiceId)) {
    notFound();
  }

  return <MemoryTrainingExperience />;
}
