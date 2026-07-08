"use client";

import { useRouter } from "next/navigation";
import { AssetImage } from "@/components/assets/AssetImage";
import { Button } from "@/components/ui/Button";
import { abilityLabels } from "@/content/assessment/cases";
import { useAssessmentStore } from "@/features/assessment/useAssessmentStore";
import type { LearningPathNode } from "@/types/assessment";

export function LearningPathView() {
  const router = useRouter();
  const { isReady, startPathNode, store } = useAssessmentStore();
  const path =
    store.paths.find((item) => item.id === store.latestPathId) ??
    store.paths[0];

  if (!isReady) {
    return <PathEmpty text="正在读取学习路线。" />;
  }

  if (!path) {
    return <PathEmpty href="/assessment/start" text="还没有学习路线。先做一次测评生成报告。" />;
  }

  function openNode(node: LearningPathNode) {
    startPathNode(path.id, node.id);

    if (node.type === "lesson") {
      router.push(`/lessons/${node.linkedResourceId}`);
      return;
    }

    if (node.type === "case_drill" || node.type === "mini_quiz") {
      router.push(`/practice/${node.linkedResourceId}`);
      return;
    }

    if (node.type === "retest") {
      router.push("/assessment/start");
      return;
    }

    router.push("/practice");
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-5 rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_20px_60px_rgba(0,88,190,0.06)] lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
        <div>
          <p className="text-sm font-black text-[#0058be]">Learning Path</p>
          <h1 className="mt-3 text-3xl font-black leading-10 text-[#12395a]">
            {path.title}
          </h1>
          <p className="mt-3 text-sm font-semibold leading-7 text-[#52657a]">
            主线能力：{abilityLabels[path.primaryDimension]}。先完成可用节点，再进入训练牌桌。
          </p>
        </div>
        <AssetImage
          assetId="course-advanced-strategy"
          className="aspect-video"
          priority
          sizes="(min-width: 1024px) 360px, 100vw"
        />
      </section>

      <section className="grid gap-3">
        {path.nodes.map((node, index) => (
          <article
            className={[
              "rounded-[26px] border bg-white p-5 shadow-[0_14px_42px_rgba(0,88,190,0.05)]",
              node.status === "available" || node.status === "in_progress"
                ? "border-[#0058be]"
                : "border-[#d8e3fb] opacity-70"
            ].join(" ")}
            key={node.id}
          >
            <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
              <AssetImage
                assetId={node.visualAssetId ?? visualAssetForNode(node)}
                className="aspect-video"
                sizes="(min-width: 768px) 180px, 100vw"
              />
              <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e7eeff] text-sm font-black text-[#0058be]">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black text-[#12395a]">{node.title}</h2>
                  <span className="rounded-full bg-[#f0f7ff] px-3 py-1 text-xs font-black text-[#52657a]">
                    {node.type}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#52657a]">
                  {node.description}
                </p>
                <p className="mt-2 text-xs font-black text-[#6f7b91]">
                  完成标准：{node.completionRule}
                </p>
              </div>
              </div>
            </div>
            <Button
              className="mt-4 w-full"
              disabled={node.status === "locked"}
              onClick={() => openNode(node)}
              variant={node.status === "locked" ? "secondary" : "primary"}
            >
              {node.status === "locked" ? "待解锁" : "开始节点"}
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
}

function visualAssetForNode(node: LearningPathNode) {
  if (node.type === "case_drill") return "course-ai-sparring";
  if (node.type === "retest" || node.type === "review") return "course-endgame-analysis";
  if (node.type === "mini_quiz") return "course-card-patterns";
  return "course-beginner-basics";
}

function PathEmpty({ href, text }: { href?: string; text: string }) {
  return (
    <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-6">
      <p className="text-sm font-bold text-[#52657a]">{text}</p>
      {href ? <Button className="mt-4" href={href}>开始测评</Button> : null}
    </section>
  );
}
