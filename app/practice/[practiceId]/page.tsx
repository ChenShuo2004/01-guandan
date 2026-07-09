import { GameArena } from "@/components/game/GameArena";

export function generateStaticParams() {
  return [{ practiceId: "practice-when-to-bomb-001" }];
}

export default function PracticeSessionPage() {
  return <GameArena />;
}
