import Image from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import type { GuandanCourse, GuandanQuestion } from "@/lib/guandan/catalog";

interface GuandanCourseDetailProps {
  course: GuandanCourse;
  questions: GuandanQuestion[];
}

export function GuandanCourseDetail({ course, questions }: GuandanCourseDetailProps) {
  const primaryQuestion = questions[0];

  return (
    <div className="space-y-5">
      <section className="grid gap-5 rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_20px_60px_rgba(0,88,190,0.06)] lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center lg:p-8">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#e7eeff] px-3 py-1.5 text-xs font-black text-[#0058be]">
              {course.category}
            </span>
            <span className="rounded-full bg-[#f0f7ff] px-3 py-1.5 text-xs font-black text-[#52657a]">
              {course.difficulty}
            </span>
            <span className="rounded-full bg-[#f0f7ff] px-3 py-1.5 text-xs font-black text-[#52657a]">
              {course.sourceChapter}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-black leading-10 text-[#12395a]">
            {course.title}
          </h1>
          <p className="mt-3 text-sm font-semibold leading-7 text-[#52657a]">
            {course.description}
          </p>
          <p className="mt-4 rounded-[22px] bg-[#f0f7ff] p-4 text-sm font-bold leading-7 text-[#334155]">
            AI教练：这节课不背长文，只练一个判断。先看 PDF 牌例，再回答“这手打完后谁更舒服”。
          </p>
        </div>
        <PdfImage alt={`${course.title} PDF 示例图`} src={course.exampleImages[0]} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <Block title="一句口诀">
            <p className="text-xl font-black leading-8 text-[#12395a]">{course.slogan}</p>
          </Block>

          <Block title="知识讲解">
            <p className="text-sm font-semibold leading-7 text-[#52657a]">
              {course.coreExplanation}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {course.knowledgePoints.map((point) => (
                <span
                  className="rounded-full bg-[#f0f7ff] px-3 py-1.5 text-xs font-black text-[#52657a]"
                  key={point}
                >
                  {point}
                </span>
              ))}
            </div>
          </Block>

          <Block title="示例牌局">
            <PdfImage alt={`${course.title} PDF 案例牌局`} src={course.exampleImages[0]} />
            <p className="mt-3 text-sm font-semibold leading-7 text-[#52657a]">
              来源：{course.sourceChapter}，PDF 页码 {course.sourcePages.join("、")}。本页使用 PDF 原始案例图片，不使用无来源牌局图。
            </p>
          </Block>

          <section className="grid gap-3 md:grid-cols-2">
            <Block title="错误打法">
              <p className="text-sm font-bold leading-7 text-[#b4232f]">{course.wrongPlay}</p>
            </Block>
            <Block title="正确打法">
              <p className="text-sm font-bold leading-7 text-[#17814d]">{course.correctPlay}</p>
            </Block>
          </section>

          <Block title="训练题">
            {primaryQuestion ? (
              <div className="space-y-3">
                <p className="text-base font-black leading-7 text-[#12395a]">
                  {primaryQuestion.question}
                </p>
                <div className="grid gap-2">
                  {primaryQuestion.options.map((option, index) => (
                    <div
                      className="rounded-[18px] border border-[#d8e3fb] bg-[#fbfdff] px-4 py-3 text-sm font-bold text-[#52657a]"
                      key={option}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </div>
                  ))}
                </div>
                <div className="rounded-[18px] bg-[#e7eeff] p-4">
                  <p className="text-xs font-black text-[#0058be]">标准答案</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#334155]">
                    {primaryQuestion.answer}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm font-semibold text-[#52657a]">这门课暂无练习题。</p>
            )}
          </Block>

          <Block title="AI复盘">
            <p className="text-sm font-semibold leading-7 text-[#52657a]">
              {primaryQuestion?.aiCoachComment ?? course.aiReview}
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-[#334155]">
              {primaryQuestion?.analysis ?? course.aiReview}
            </p>
          </Block>
        </div>

        <aside className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 lg:sticky lg:top-8 lg:self-start">
          <p className="text-sm font-black text-[#0058be]">课程来源</p>
          <div className="mt-4 space-y-3 text-sm font-bold leading-6 text-[#52657a]">
            <p>章节：{course.sourceChapter}</p>
            <p>PDF 页码：{course.sourcePages.join("、")}</p>
            <p>练习题：{questions.length} 道</p>
          </div>
          <Button className="mt-5 w-full" href="/learning-path" variant="secondary">
            返回学习路线
          </Button>
          <Button className="mt-3 w-full" href="/assessment/session/simple">
            去做能力测试
          </Button>
        </aside>
      </section>
    </div>
  );
}

function Block({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-[26px] border border-[#d8e3fb] bg-white p-5">
      <p className="mb-3 text-sm font-black text-[#0058be]">{title}</p>
      {children}
    </section>
  );
}

function PdfImage({ alt, src }: { alt: string; src: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-[#d8e3fb] bg-[#f8fbff]">
      <Image
        alt={alt}
        className="object-contain p-2"
        fill
        sizes="(min-width: 1024px) 420px, 100vw"
        src={src}
      />
    </div>
  );
}
