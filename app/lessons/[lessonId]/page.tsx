import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GuandanCourseDetail } from "@/features/learning/GuandanCourseDetail";
import { LessonExperience } from "@/features/learning/LessonExperience";
import { getLessonById, sampleLessons } from "@/content/lessons/sample-lessons";
import {
  getGuandanCourse,
  getGuandanQuestionsForCourse,
  guandanCourses
} from "@/lib/guandan/catalog";

interface LessonPageProps {
  params: {
    lessonId: string;
  };
}

export function generateStaticParams() {
  return [
    ...guandanCourses.map((course) => ({
      lessonId: course.id
    })),
    ...sampleLessons.map((lesson) => ({
      lessonId: lesson.id
    }))
  ];
}

export default function LessonPage({ params }: LessonPageProps) {
  const guandanCourse = getGuandanCourse(params.lessonId);

  if (guandanCourse) {
    return (
      <AppShell title={guandanCourse.title} subtitle="PDF 案例驱动的一页一知识点。">
        <GuandanCourseDetail
          course={guandanCourse}
          questions={getGuandanQuestionsForCourse(guandanCourse.id)}
        />
      </AppShell>
    );
  }

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
