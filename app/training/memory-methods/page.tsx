import { MemoryManualCarousel } from "@/components/memory/MemoryManualCarousel";
import { memoryManual } from "@/content/memory-manual";

export const metadata = {
  title: "陈硕档位法手册 | 掼蛋记牌训练",
  description: "横向翻页学习陈硕档位法，快速理解大小王记牌方式。"
};

export default function MemoryMethodsPage({ searchParams }: { searchParams?: { returnTo?: string } }) {
  return <MemoryManualCarousel manual={memoryManual} returnTo={searchParams?.returnTo ?? null} />;
}
