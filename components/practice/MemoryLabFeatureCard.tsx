"use client";

import Link from "next/link";
import { PokerCard } from "@/components/cards/PokerCard";
import type { PokerCardData } from "@/types/poker";
import "./MemoryLabFeatureCard.css";

const FEATURES = [
  { label: "自动推进牌局", accent: true },
  { label: "追踪关键牌", accent: true },
  { label: "即时记牌测试", accent: false }
] as const;

const FLOATING_CARDS: Array<{ card: PokerCardData; className: string }> = [
  { card: { id: "hero-a", rank: "A", suit: "spade" }, className: "memory-lab-card__floating-card--a" },
  { card: { id: "hero-b", rank: "4", suit: "heart" }, className: "memory-lab-card__floating-card--b" },
  { card: { id: "hero-c", rank: "2", suit: "spade" }, className: "memory-lab-card__floating-card--c" },
  { card: { id: "hero-d", rank: "K", suit: "spade" }, className: "memory-lab-card__floating-card--d" }
];

interface MemoryLabFeatureCardProps {
  href: string;
}

export function MemoryLabFeatureCard({ href }: MemoryLabFeatureCardProps) {
  return (
    <div className="memory-lab-card flex h-full flex-col p-5 sm:p-7">
      <div className="memory-lab-card__content flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="memory-lab-card__menu">
              <span>Menu</span>
              <span className="memory-lab-card__tag">关键牌追踪-记牌训练</span>
            </div>
            <h2 className="mt-4 text-[clamp(1.85rem,5vw,2.5rem)] font-black leading-tight text-white">关键牌追踪</h2>
          </div>
          <div aria-hidden="true" className="memory-lab-card__spade">
            ♠
          </div>
        </div>

        <ul className="mt-5 grid gap-2 sm:grid-cols-3 sm:gap-3">
          {FEATURES.map((feature) => (
            <li
              key={feature.label}
              className={`memory-lab-card__pill ${feature.accent ? "memory-lab-card__pill--accent" : ""}`}
            >
              {feature.label}
            </li>
          ))}
        </ul>

        <div aria-hidden="true" className="memory-lab-card__stage flex-1">
          <div className="memory-lab-card__table">
            <div className="memory-lab-card__table-glow" />
            <div className="memory-lab-card__table-surface" />
          </div>
          {FLOATING_CARDS.map(({ card, className }) => (
            <div key={card.id} className={`memory-lab-card__floating-card ${className}`}>
              <PokerCard card={card} compact size="sm" />
            </div>
          ))}
        </div>

        <Link className="memory-lab-card__cta mt-5" href={href}>
          开始训练
        </Link>
      </div>
    </div>
  );
}
