"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import BlurText from "@/components/ui/BlurText";
import { gameAudioAssets } from "@/lib/assets/audio-assets";
import "./OpeningHeroTagline.css";

const TITLE_DURATION_MS = 820;
const SUBTITLE_DELAY_MS = TITLE_DURATION_MS + 250;
const TYPING_LETTER_DELAY_MS = 55;
const TYPING_TICK_VOLUME = 0.16;

const TAGLINE_SEGMENTS = [
  { text: "一小时，" },
  { text: "记住10张牌", className: "opening-hero-tagline__gold" },
  { text: "。让你的大脑像牌桌上的" },
  { text: "「雷达」", className: "opening-hero-tagline__radar" },
  { text: "，看穿对手每一次出牌。" }
] as const;

const TAGLINE_TEXT = TAGLINE_SEGMENTS.map((segment) => segment.text).join("");

export function OpeningHeroTagline() {
  const shouldReduceMotion = useReducedMotion();
  const [highlightPhase, setHighlightPhase] = useState(0);
  const typingAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedTypingAudioRef = useRef(false);

  useEffect(() => {
    if (highlightPhase !== 1) return;
    const timer = window.setTimeout(() => setHighlightPhase(2), 900);
    return () => window.clearTimeout(timer);
  }, [highlightPhase]);

  useEffect(() => {
    if (shouldReduceMotion || hasStartedTypingAudioRef.current) return;
    hasStartedTypingAudioRef.current = true;

    const audio = new Audio(gameAudioAssets.uiClick.src);
    audio.preload = "auto";
    audio.volume = TYPING_TICK_VOLUME;
    audio.playbackRate = 1.35;
    typingAudioRef.current = audio;

    const timers = TAGLINE_TEXT.split("").flatMap((character, index) => {
      if (character.trim().length === 0) return [];

      return [
        window.setTimeout(() => {
          const typingAudio = typingAudioRef.current;
          if (!typingAudio) return;

          typingAudio.currentTime = 0;
          void typingAudio.play().catch(() => undefined);
        }, SUBTITLE_DELAY_MS + index * TYPING_LETTER_DELAY_MS)
      ];
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      typingAudioRef.current?.pause();
      typingAudioRef.current = null;
    };
  }, [shouldReduceMotion]);

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
          delay={TYPING_LETTER_DELAY_MS}
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
