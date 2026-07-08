import type { Lesson } from "@/types/lesson";
import { AssetImage } from "@/components/assets/AssetImage";
import { Button } from "@/components/ui/Button";

interface LessonCardProps {
  lesson: Lesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
  return (
    <article className="rounded-3xl border border-guandan-border bg-guandan-card p-4 shadow-soft">
      <AssetImage
        assetId={lesson.coverAssetId}
        className="mb-4 aspect-video"
        sizes="(min-width: 1024px) 360px, 100vw"
      />
      <div className="flex flex-wrap gap-2">
        {lesson.tags.map((tag) => (
          <span
            className="rounded-full bg-guandan-muted px-3 py-1 text-xs font-bold text-guandan-gold"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
      <h2 className="mt-3 text-xl font-bold">{lesson.title}</h2>
      <p className="mt-2 text-sm leading-6 text-guandan-subtext">{lesson.slogan}</p>
      <div className="mt-4 flex items-center justify-between text-xs font-bold text-guandan-subtext">
        <span>{lesson.duration} 秒</span>
        <span>+{lesson.experience} XP</span>
      </div>
      <Button className="mt-4 w-full" href={`/lessons/${lesson.id}`}>
        开始学习
      </Button>
    </article>
  );
}
