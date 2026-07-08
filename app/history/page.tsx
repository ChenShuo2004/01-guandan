import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";

const rows = [
  ["残局分析", "胜利", "+50", "7 天前"],
  ["炸弹判断", "胜利", "+30", "6 天前"],
  ["队友配合", "待复盘", "+20", "5 天前"],
  ["控牌训练", "胜利", "+40", "3 天前"],
  ["高级策略", "失败", "+10", "昨天"]
];

export default function HistoryPage() {
  return (
    <AppShell title="战绩历史" subtitle="把每次训练沉淀为复盘记录。" variant="wide">
      <div className="space-y-6">
        <section className="grid gap-6 rounded-[24px] bg-white p-8 shadow-[0_20px_60px_rgba(0,88,190,0.06)] lg:grid-cols-[1fr_280px]">
          <div>
            <p className="text-sm font-black text-[#0058be]">战绩总结</p>
            <h2 className="mt-3 text-4xl font-black">太棒了！继续加油！</h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-[#424754]">
              最近训练表现稳定。Ace 建议继续保持残局专项，复盘每一次关键判断。
            </p>
            <div className="mt-8 flex gap-3">
              <Button href="/practice">继续训练</Button>
              <Button href="/profile" variant="secondary">查看能力</Button>
            </div>
          </div>
          <div className="rounded-[22px] bg-[#e7eeff] p-5">
            <Image
              alt="Ace 胜利庆祝"
              className="mx-auto h-44 w-44 object-contain"
              height={176}
              src="/assets/coach/coach-victory-celebration.png"
              width={176}
            />
          </div>
        </section>

        <section className="rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,88,190,0.06)]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#0058be]">训练记录</h3>
            <div className="flex gap-2">
              {["全部", "胜利", "复盘"].map((tab, index) => (
                <button
                  className={[
                    "rounded-full px-4 py-2 text-sm font-black",
                    index === 0 ? "bg-[#0058be] text-white" : "bg-[#e7eeff] text-[#0058be]"
                  ].join(" ")}
                  key={tab}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 overflow-hidden rounded-[18px] border border-[#d8e3fb]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#f0f3ff] text-[#727785]">
                <tr>
                  <th className="px-5 py-4 font-black">训练</th>
                  <th className="px-5 py-4 font-black">结果</th>
                  <th className="px-5 py-4 font-black">XP</th>
                  <th className="px-5 py-4 font-black">时间</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr className="border-t border-[#e7eeff]" key={row.join("-")}>
                    <td className="px-5 py-4 font-black">{row[0]}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[#d4e3ff] px-3 py-1 font-black text-[#0058be]">
                        {row[1]}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-black text-[#0058be]">{row[2]}</td>
                    <td className="px-5 py-4 font-semibold text-[#727785]">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
