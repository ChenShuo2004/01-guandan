import { Button } from "@/components/ui/Button";
import { getGuandanAssessmentQuestions } from "@/lib/guandan/catalog";

export function AssessmentStart() {
  const simpleQuestions = getGuandanAssessmentQuestions("simple").slice(0, 20);
  const fullQuestions = getGuandanAssessmentQuestions("full").slice(0, 50);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_20px_60px_rgba(0,88,190,0.06)] lg:p-8">
        <span className="inline-flex rounded-full bg-[#e7eeff] px-3 py-1.5 text-xs font-black text-[#0058be]">
          Assessment
        </span>
        <h1 className="mt-4 text-3xl font-black leading-10 text-[#12395a]">
          先测水平，再进训练。
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-[#52657a]">
          测评题来自 PDF 课程体系，每道题都绑定示例图、答案分析、错误原因和推荐课程。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <AssessmentCard
          count={`${simpleQuestions.length}题`}
          coverage={["规则", "牌型", "简单出牌", "主攻助攻"]}
          description="快速判断新手水平，适合第一次进入产品时使用。"
          href="/assessment/session/simple"
          title="简单能力测试"
        />
        <AssessmentCard
          count={`${fullQuestions.length}题`}
          coverage={["牌力", "炸弹", "主攻", "助攻", "记牌", "残局", "心理"]}
          description="生成能力画像，找出最应该补的课程和训练方向。"
          href="/assessment/session/full"
          title="全面能力测试"
        />
      </section>

      <div>
        <Button className="w-full" href="/learning-path">
          查看学习路线
        </Button>
      </div>
    </div>
  );
}

function AssessmentCard({
  count,
  coverage,
  description,
  href,
  title
}: {
  count: string;
  coverage: string[];
  description: string;
  href: string;
  title: string;
}) {
  return (
    <article className="rounded-[28px] border border-[#d8e3fb] bg-white p-5 shadow-[0_14px_42px_rgba(0,88,190,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#12395a]">{title}</h2>
          <p className="mt-2 text-sm font-semibold leading-7 text-[#52657a]">{description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#e7eeff] px-3 py-1.5 text-xs font-black text-[#0058be]">
          {count}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {coverage.map((item) => (
          <span
            className="rounded-full bg-[#f0f7ff] px-3 py-1.5 text-xs font-bold text-[#52657a]"
            key={item}
          >
            {item}
          </span>
        ))}
      </div>
      <Button className="mt-5 w-full" href={href}>
        开始测试
      </Button>
    </article>
  );
}
