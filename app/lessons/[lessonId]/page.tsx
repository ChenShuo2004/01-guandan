import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LessonExperience } from "@/features/learning/LessonExperience";
import { getLessonById, sampleLessons } from "@/content/lessons/sample-lessons";

interface LessonPageProps {
  params: {
    lessonId: string;
  };
}

export function generateStaticParams() {
  return sampleLessons.map((lesson) => ({
    lessonId: lesson.id
  }));
}

export default function LessonPage({ params }: LessonPageProps) {
  const lesson = getLessonById(params.lessonId);

  if (!lesson) {
    notFound();
  }

  return (
    <AppShell title={lesson.title} subtitle="一个页面只讲一个知识点。">
      <LessonExperience lesson={lesson} />
    </AppShell>
  );
}
