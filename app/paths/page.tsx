import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { learningPath } from "@/content/paths/learning-paths";
import { cn } from "@/lib/utils";

export default function PathsPage() {
  return (
    <AppShell title="学习路径" subtitle="用成长地图代替文章目录。">
      <div className="space-y-3">
        {learningPath.nodes.map((node) => {
          const isCurrent = node.status === "current";
          const isCompleted = node.status === "completed";

          return (
            <section
              className={cn(
                "rounded-3xl border p-4",
                isCurrent
                  ? "border-guandan-gold bg-guandan-gold/10"
                  : "border-guandan-border bg-guandan-card"
              )}
              key={node.id}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-guandan-gold">{node.level}</p>
                  <h2 className="mt-1 text-lg font-black">{node.title}</h2>
                  <p className="mt-1 text-sm text-guandan-subtext">
                    {isCompleted ? "已完成" : isCurrent ? "当前推荐" : "未解锁"}
                  </p>
                </div>
                {node.lessonId ? (
                  <Button href={`/lessons/${node.lessonId}`}>开始</Button>
                ) : (
                  <span className="rounded-full bg-guandan-muted px-3 py-2 text-xs font-bold text-guandan-subtext">
                    {isCompleted ? "完成" : "锁定"}
                  </span>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
