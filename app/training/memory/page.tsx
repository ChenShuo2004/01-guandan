import { redirect } from "next/navigation";

export const metadata = {
  title: "记牌训练 | 掼蛋训练"
};

export default function MemoryTrainingRedirectPage() {
  redirect("/practice/practice-when-to-bomb-001");
}
