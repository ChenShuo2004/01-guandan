import { notFound } from "next/navigation";
import { PracticeExperience } from "@/features/practice/PracticeExperience";
import { getPracticeById, samplePracticeCases } from "@/content/cases/sample-practice";

export function generateStaticParams() {
  return samplePracticeCases.map((practiceCase) => ({
    practiceId: practiceCase.id
  }));
}

interface PracticeSessionPageProps {
  params: {
    practiceId: string;
  };
}

export default function PracticeSessionPage({ params }: PracticeSessionPageProps) {
  const practiceCase = getPracticeById(params.practiceId);

  if (!practiceCase) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-guandan-background px-4 py-5 text-guandan-text sm:px-6 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-guandan-gold">
              AI Review Drill
            </p>
            <h1 className="mt-2 text-2xl font-black leading-8 sm:text-3xl">
              {practiceCase.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-guandan-subtext">
              先判断，再看 Ace 的反馈。每次只练一个关键选择。
            </p>
          </div>
          <a
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-guandan-border bg-guandan-muted px-4 text-sm font-black text-guandan-text transition hover:border-guandan-cyan/60"
            href="/practice"
          >
            返回训练营
          </a>
        </div>
        <PracticeExperience practiceCase={practiceCase} />
      </section>
    </main>
  );
}
