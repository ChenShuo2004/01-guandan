import assets from "@/data/guandan/assets.json";
import courses from "@/data/guandan/courses.json";
import learningPath from "@/data/guandan/learning-path.json";
import questions from "@/data/guandan/questions.json";

export interface GuandanCategory {
  id: string;
  name: string;
  description: string;
  courses: string[];
}

export interface GuandanCourse {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  sourceChapter: string;
  sourcePages: number[];
  knowledgePoints: string[];
  exampleImages: string[];
  mistakes: string[];
  exerciseIds: string[];
  aiCoachPrompt: string;
  slogan: string;
  coreExplanation: string;
  wrongPlay: string;
  correctPlay: string;
  aiReview: string;
}

export interface GuandanQuestion {
  id: string;
  assessment: "simple" | "full" | "course-drill";
  type: string;
  difficulty: string;
  question: string;
  options: string[];
  answer: string;
  analysis: string;
  wrongReasons: string[];
  aiCoachComment: string;
  image: string;
  relatedCourse: string;
}

export interface GuandanAsset {
  id: string;
  source: "pdf";
  page: number;
  topic: string;
  path: string;
  courseId: string;
}

export const guandanLearningPath = learningPath as {
  categories: GuandanCategory[];
};

export const guandanCourses = courses as GuandanCourse[];
export const guandanQuestions = questions as GuandanQuestion[];
export const guandanAssets = assets as GuandanAsset[];

export function getGuandanCourse(courseId: string) {
  return guandanCourses.find((course) => course.id === courseId);
}

export function getGuandanQuestionsForCourse(courseId: string) {
  return guandanQuestions.filter((question) => question.relatedCourse === courseId);
}

export function getGuandanAssessmentQuestions(mode: "simple" | "full") {
  return guandanQuestions.filter((question) => question.assessment === mode);
}

export function getCategoryCourses(category: GuandanCategory) {
  return category.courses
    .map((courseId) => getGuandanCourse(courseId))
    .filter((course): course is GuandanCourse => Boolean(course));
}
