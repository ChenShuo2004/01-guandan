"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import BlurText from "@/components/ui/BlurText";
import "./OpeningHeroTagline.css";

const TITLE_DURATION_MS = 820;
const SUBTITLE_DELAY_MS = TITLE_DURATION_MS + 250;

const TAGLINE_SEGMENTS = [
  { text: "一小时，" },
  { text: "记住10张牌", className: "opening-hero-tagline__gold" },
  { text: "。让你的大脑像牌桌上的" },
  { text: "「雷达」", className: "opening-hero-tagline__radar" },
  { text: "，看穿对手每一次出牌。" }
] as const;

export function OpeningHeroTagline() {
  const shouldReduceMotion = useReducedMotion();
  const [highlightPhase, setHighlightPhase] = useState(0);

  useEffect(() => {
    if (highlightPhase !== 1) return;
    const timer = window.setTimeout(() => setHighlightPhase(2), 900);
    return () => window.clearTimeout(timer);
  }, [highlightPhase]);

  if (shouldReduceMotion) {
    return (
      <div className="opening-hero-tagline">
        <div aria-hidden="true" className="opening-hero-tagline__halo" />
        <p className="opening-hero-tagline__text">
          一小时，
          <span className="opening-hero-tagline__gold">记住10张牌</span>
          。让你的大脑像牌桌上的
          <span className="opening-hero-tagline__radar">「雷达」</span>
          ，看穿对手每一次出牌。
        </p>
      </div>
    );
  }

  return (
    <div className="opening-hero-tagline">
      <div aria-hidden="true" className="opening-hero-tagline__halo" />
      <div className="opening-hero-tagline__text" data-highlight-phase={highlightPhase}>
        <BlurText
          animateBy="letters"
          as="span"
          className="opening-hero-tagline__blur"
          delay={55}
          direction="top"
          onAnimationComplete={() => setHighlightPhase(1)}
          segments={[...TAGLINE_SEGMENTS]}
          startDelay={SUBTITLE_DELAY_MS}
          stepDuration={0.32}
          threshold={0}
        />
      </div>
    </div>
  );
}
