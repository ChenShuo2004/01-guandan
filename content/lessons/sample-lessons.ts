import { whenToBombQuiz } from "@/content/quizzes/sample-quizzes";
import type { Lesson } from "@/types/lesson";

export const whenToBombLesson: Lesson = {
  id: "when-to-bomb",
  title: "什么时候该炸？",
  category: "bomb",
  level: "beginner",
  pathId: "bomb-basics",
  coverAssetId: "course-beginner-basics",
  slogan: "炸弹不是用来爽的，而是用来改变局势。",
  duration: 60,
  experience: 20,
  tags: ["炸弹", "牌权", "配合"],
  quiz: whenToBombQuiz,
  steps: [
    {
      type: "coach",
      text: "很多人这里都会炸错。",
      action: "thinking"
    },
    {
      type: "image",
      assetId: "course-card-patterns",
      caption: "先判断现在是谁掌握牌权。"
    },
    {
      type: "poker-case",
      title: "你的关键牌",
      note: "你有炸，但队友只剩 2 张。先别急着亮肌肉。",
      cards: [
        { id: "h-a-1", suit: "heart", rank: "A" },
        { id: "s-a-1", suit: "spade", rank: "A" },
        { id: "d-a-1", suit: "diamond", rank: "A" },
        { id: "c-a-1", suit: "club", rank: "A" },
        { id: "h-10-1", suit: "heart", rank: "10" },
        { id: "s-10-1", suit: "spade", rank: "10" }
      ]
    },
    {
      type: "comparison",
      wrongLabel: "错误",
      wrongText: "一看到能炸就出手，结果队友接不上。",
      correctLabel: "正确",
      correctText: "等对手抢关键牌权时再炸，帮队友创造出手机会。"
    },
    {
      type: "quiz",
      quizId: whenToBombQuiz.id
    }
  ]
};

export const sampleLessons = [whenToBombLesson];

export function getLessonById(lessonId: string) {
  return sampleLessons.find((lesson) => lesson.id === lessonId);
}
