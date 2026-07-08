import { PokerHand } from "@/components/cards/PokerHand";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { whenToBombPractice } from "@/content/cases/sample-practice";

export default function PracticePage() {
  const practiceCase = whenToBombPractice;

  return (
    <AppShell title="残局挑战" subtitle="AI 实时洞察，训练关键轮次判断。" variant="wide">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-[#0058be]">残局 AI 对战中</p>
              <h2 className="mt-1 text-2xl font-black">{practiceCase.title}</h2>
            </div>
            <span className="rounded-full bg-[#d4e3ff] px-4 py-2 text-sm font-black text-[#0058be]">
              第 12 轮
            </span>
          </div>

          <div className="relative min-h-[520px] overflow-hidden rounded-[28px] bg-gradient-to-b from-[#e7eeff] to-[#f9f9ff] p-8">
            <div className="absolute inset-x-10 top-20 h-[320px] rounded-[50%] border border-[#adc6ff] bg-[#d4e3ff]/70 shadow-[inset_0_20px_70px_rgba(0,88,190,0.08)]" />
            <PlayerSeat className="left-1/2 top-8 -translate-x-1/2" label="对家" value="剩 2 张" />
            <PlayerSeat className="left-10 top-1/2 -translate-y-1/2" label="上家" value="剩 5 张" />
            <PlayerSeat className="right-10 top-1/2 -translate-y-1/2" label="下家" value="剩 2 张" />
            <PlayerSeat className="bottom-10 left-1/2 -translate-x-1/2" label="我" value="剩 6 张" active />

            <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-xs font-black uppercase tracking-wide text-[#727785]">AI 实时洞察</p>
              <p className="mt-2 text-xl font-black text-[#0058be]">下家刚出对子 K</p>
              <div className="mt-5 flex justify-center">
                <PokerHand cards={practiceCase.history[0].cards} compact />
              </div>
            </div>

            <div className="absolute bottom-8 left-1/2 w-[560px] max-w-[calc(100%-3rem)] -translate-x-1/2 rounded-[22px] border border-white/80 bg-white/75 p-4 shadow-[0_18px_50px_rgba(0,88,190,0.12)] backdrop-blur">
              <div className="flex gap-3">
                <span className="material-symbols-outlined rounded-full bg-[#0058be] p-2 text-white">
                  lightbulb
                </span>
                <div>
                  <p className="text-sm font-black text-[#0058be]">AI Strategy Insight</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#111c2d]">
                    建议观察对手出牌规律。对方只剩 2 张，当前你处于优势地位。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-5 rounded-[22px] bg-[#f9f9ff] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-[#0058be]">我的手牌</p>
                <p className="mt-1 text-sm font-semibold text-[#727785]">点击关键牌会在训练中高亮。</p>
              </div>
              <span className="rounded-full bg-[#d4e3ff] px-3 py-1 text-sm font-black text-[#0058be]">
                18 张
              </span>
            </div>
            <div className="mt-3">
              <PokerHand cards={practiceCase.myHand} selectedIds={["my-ha", "my-sa", "my-da", "my-ca"]} />
            </div>
          </section>
        </section>

        <aside className="space-y-5">
          <section className="rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
            <p className="text-sm font-black text-[#0058be]">胜率预测</p>
            <p className="mt-4 text-5xl font-black text-[#0058be]">72%</p>
            <p className="mt-1 text-sm font-black text-[#00a344]">+5% Since last turn</p>
            <div className="mt-5 h-2 rounded-full bg-[#d4e3ff]">
              <div className="h-full w-[72%] rounded-full bg-[#2170e4]" />
            </div>
          </section>

          <section className="rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
            <p className="text-sm font-black text-[#0058be]">出牌选择</p>
            <div className="mt-5 grid gap-3">
              {practiceCase.options.map((option, index) => (
                <button
                  className={[
                    "rounded-2xl border p-4 text-left text-sm font-black transition",
                    index === 0
                      ? "border-[#0058be] bg-[#0058be] text-white shadow-[0_12px_30px_rgba(0,88,190,0.2)]"
                      : "border-[#d8e3fb] bg-[#f9f9ff] text-[#111c2d]"
                  ].join(" ")}
                  key={option.id}
                  type="button"
                >
                  {option.label}. {option.text}
                </button>
              ))}
            </div>
            <Button className="mt-5 w-full" href="/complete">
              提交判断
            </Button>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

function PlayerSeat({
  active = false,
  className,
  label,
  value
}: {
  active?: boolean;
  className: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className={[
        "absolute z-[1] rounded-2xl border px-4 py-3 text-center shadow-[0_12px_30px_rgba(0,88,190,0.12)]",
        active
          ? "border-[#ffb786] bg-[#ffdcc6] text-[#723600]"
          : "border-white bg-white/85 text-[#424754]",
        className
      ].join(" ")}
    >
      <p className="text-sm font-black">{label}</p>
      <p className="mt-1 text-xs font-bold">{value}</p>
    </div>
  );
}
