import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [{ methodId: "foot-position" }];
}

export default function MemoryMethodDetailPage({
  searchParams,
}: {
  params: { methodId: string };
  searchParams?: { returnTo?: string };
}) {
  const returnTo = searchParams?.returnTo;
  redirect(returnTo ? `/training/memory-methods?returnTo=${encodeURIComponent(returnTo)}` : "/training/memory-methods");
}
