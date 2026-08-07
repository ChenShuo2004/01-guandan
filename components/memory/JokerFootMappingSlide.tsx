"use client";

import { PokerCard } from "@/components/cards/PokerCard";
import { jokerFootMappings } from "@/content/memory-manual";

export function JokerFootMappingSlide() {
  return (
    <section
      aria-label="档位法左右脚映射"
      className="flex h-full w-full min-h-0 flex-col overflow-hidden rounded-[22px] bg-[#121212] px-3 py-4 text-white sm:px-6 sm:py-6"
    >
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ff8a18]">核心记法</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">左小右大</h2>
        <p className="mt-1 text-xs font-bold text-white/62 sm:text-base">左脚只记小王，右脚只记大王</p>
      </div>

      <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 gap-2.5 sm:mt-6 sm:gap-5">
        {jokerFootMappings.map((mapping) => (
          <section
            className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.045] p-2.5 sm:p-4"
            key={mapping.foot}
          >
            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0">
                <p className="text-[11px] font-black tracking-[0.12em] text-[#ff8a18] sm:text-sm">{mapping.foot}</p>
                <h3 className="text-lg font-black leading-tight sm:text-2xl">{mapping.joker}</h3>
              </div>
              <div className="origin-right scale-90 sm:scale-125">
                <PokerCard
                  card={{ id: `manual-${mapping.pokerRank}`, rank: mapping.pokerRank }}
                  dimensions={{ height: 58, width: 42 }}
                  size="sm"
                />
              </div>
            </div>

            <ol className="mt-3 divide-y divide-white/10 border-y border-white/10 sm:mt-5">
              {mapping.positions.map((position) => (
                <li className="grid grid-cols-[auto_1fr] gap-x-1.5 py-2 sm:gap-x-2 sm:py-3" key={position.gear}>
                  <span className="inline-flex h-5 min-w-8 items-center justify-center rounded-md bg-[#ff7900]/16 px-1 text-[10px] font-black text-[#ff9c42] sm:h-6 sm:min-w-10 sm:text-xs">
                    {position.gear}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-white/58 sm:text-xs">{position.label}</p>
                    <p className="truncate text-xs font-black text-white sm:text-sm">
                      {mapping.joker}已出 {position.appearedCount} 张
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-[#ff7900]/25 bg-[#ff7900]/10 px-3 py-2 text-center text-[11px] font-bold text-white/82 sm:mt-5 sm:text-sm">
        口诀：左小右大，脚位表示已出的数量
      </div>
    </section>
  );
}
