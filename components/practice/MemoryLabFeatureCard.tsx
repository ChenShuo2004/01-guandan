"use client";

import Link from "next/link";
import "./MemoryLabFeatureCard.css";

const FEATURES = [
  {
    icon: "play_arrow",
    label: "自动推进牌局",
    lines: ["AI 自动出完整局", "专注观察记牌"],
    titleTone: "play" as const
  },
  {
    icon: "my_location",
    label: "追踪关键牌",
    lines: ["关键牌实时标记", "随时查看剩余"],
    titleTone: "track" as const
  },
  {
    icon: "bolt",
    label: "即时记牌测试",
    lines: ["牌局中即时测试", "检验记忆成果"],
    titleTone: "test" as const
  }
] as const;

interface MemoryLabFeatureCardProps {
  href: string;
}

export function MemoryLabFeatureCard({ href }: MemoryLabFeatureCardProps) {
  return (
    <div className="memory-lab-card flex h-full flex-col p-5 sm:p-7">
      <div className="memory-lab-card__content flex h-full flex-col">
        <div className="flex items-start justify-end">
          <div aria-hidden="true" className="memory-lab-card__spade">
            ♠
          </div>
        </div>

        <ul className="memory-lab-card__features mt-2 grid flex-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {FEATURES.map((feature) => (
            <li key={feature.label} className="memory-lab-card__feature">
              <span aria-hidden="true" className="memory-lab-card__feature-icon">
                <span className="material-symbols-outlined">{feature.icon}</span>
              </span>
              <h3 className={`memory-lab-card__feature-title memory-lab-card__feature-title--${feature.titleTone}`}>
                {feature.label}
              </h3>
              <div className="memory-lab-card__feature-copy">
                {feature.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <Link className="memory-lab-card__cta mt-5" href={href}>
          开始记牌训练
          <span aria-hidden="true">→</span>
        </Link>

        <Link
          className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 bg-white/8 px-4 text-sm font-black text-white/82 transition hover:bg-white/14"
          href="/training/memory-methods?returnTo=/practice"
        >
          先看档位法手册
        </Link>
      </div>
    </div>
  );
}
