import { redirect } from "next/navigation";

export const metadata = {
  title: "脚步定位记牌法 | 掼蛋方法学习",
  description: "直接学习脚步定位记牌法。",
};

export default function MemoryMethodsPage({ searchParams }: { searchParams?: { returnTo?: string } }) {
  const returnTo = searchParams?.returnTo;
  const target = returnTo
    ? `/training/memory-methods/foot-position?returnTo=${encodeURIComponent(returnTo)}`
    : "/training/memory-methods/foot-position";

  redirect(target);
}
