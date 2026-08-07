"use client";

import Link from "next/link";
import { practiceOnboarding } from "@/content/practice-onboarding";
import "./MemoryLabFeatureCard.css";

interface MemoryLabFeatureCardProps {
  href: string;
}

export function MemoryLabFeatureCard({ href }: MemoryLabFeatureCardProps) {
  return (
    <div className="memory-lab-card flex h-full flex-col p-5 sm:p-7">
      <div className="memory-lab-card__content flex h-full flex-col">
        <div className="memory-lab-card__intro">
          <div>
            <p className="memory-lab-card__eyebrow">{practiceOnboarding.eyebrow}</p>
            <h2>{practiceOnboarding.title}</h2>
            <p>{practiceOnboarding.description}</p>
          </div>
          <span aria-hidden="true" className="memory-lab-card__intro-icon material-symbols-outlined">
            playing_cards
          </span>
        </div>

        <ol className="memory-lab-card__features mt-4 grid flex-1 grid-cols-3 gap-2.5 sm:gap-3">
          {practiceOnboarding.steps.map((step) => (
            <li key={step.label} className="memory-lab-card__feature">
              <span aria-hidden="true" className="memory-lab-card__feature-icon">
                <span className="material-symbols-outlined">{step.icon}</span>
              </span>
              <div>
                <p className="memory-lab-card__feature-label">{step.label}</p>
                <h3 className="memory-lab-card__feature-title">{step.title}</h3>
                <p className="memory-lab-card__feature-copy">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <Link className="memory-lab-card__cta mt-3" href={href}>
          <span>{practiceOnboarding.startLabel}</span>
          <span className="memory-lab-card__cta-hint">{practiceOnboarding.startHint}</span>
        </Link>

        <Link className="memory-lab-card__manual-cta mt-2" href={practiceOnboarding.manualHref}>
          {practiceOnboarding.manualLabel}
          <span aria-hidden="true" className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
