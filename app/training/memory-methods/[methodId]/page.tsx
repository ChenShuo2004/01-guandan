import { notFound } from "next/navigation";
import { MemoryMethodDetail } from "@/components/memory/MemoryMethodDetail";
import { getMemoryMethodBySlug, memoryMethods } from "@/content/memory-methods";

export function generateStaticParams() {
  return memoryMethods.map((method) => ({ methodId: method.slug }));
}

export default function MemoryMethodDetailPage({
  params,
  searchParams,
}: {
  params: { methodId: string };
  searchParams?: { returnTo?: string };
}) {
  const method = getMemoryMethodBySlug(params.methodId);
  if (!method) notFound();
  return <MemoryMethodDetail method={method} returnTo={searchParams?.returnTo ?? null} />;
}
