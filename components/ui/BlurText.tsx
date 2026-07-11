"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import { cn } from "@/lib/utils";

type Easing = (value: number) => number;

type BlurKeyframe = {
  filter: string;
  opacity: number;
  y: number;
};

type BlurSegment = {
  className?: string;
  text: string;
};

type BlurElement = {
  className?: string;
  key: string;
  text: string;
};

const buildKeyframes = (from: BlurKeyframe, steps: BlurKeyframe[]) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))]);
  const keyframes: Record<string, Array<string | number>> = {};

  keys.forEach((key) => {
    const typedKey = key as keyof BlurKeyframe;
    keyframes[key] = [from[typedKey], ...steps.map((step) => step[typedKey])];
  });

  return keyframes;
};

interface BlurTextProps {
  animateBy?: "letters" | "words";
  animationFrom?: BlurKeyframe;
  animationTo?: BlurKeyframe[];
  as?: ElementType;
  className?: string;
  delay?: number;
  direction?: "bottom" | "top";
  easing?: Easing;
  onAnimationComplete?: () => void;
  rootMargin?: string;
  segments?: BlurSegment[];
  startDelay?: number;
  stepDuration?: number;
  text?: string;
  threshold?: number;
}

export function BlurText({
  animateBy = "words",
  animationFrom,
  animationTo,
  as: Component = "span",
  className = "",
  delay = 200,
  direction = "top",
  easing = (value) => value,
  onAnimationComplete,
  rootMargin = "0px",
  segments,
  startDelay = 0,
  stepDuration = 0.35,
  text = "",
  threshold = 0.1
}: BlurTextProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  const elements = useMemo<BlurElement[]>(() => {
    if (segments?.length) {
      return segments.flatMap((segment, segmentIndex) => {
        const parts = animateBy === "letters" ? segment.text.split("") : [segment.text];

        return parts.map((part, partIndex) => ({
          className: segment.className,
          key: `${segmentIndex}-${partIndex}`,
          text: part
        }));
      });
    }

    const parts = animateBy === "letters" ? text.split("") : text.split(" ");

    return parts.map((part, index) => ({
      key: `${index}`,
      text: part
    }));
  }, [animateBy, segments, text]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const defaultFrom = useMemo(
    () =>
      direction === "top"
        ? { filter: "blur(10px)", opacity: 0, y: -50 }
        : { filter: "blur(10px)", opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: "blur(5px)",
        opacity: 0.5,
        y: direction === "top" ? 5 : -5
      },
      { filter: "blur(0px)", opacity: 1, y: 0 }
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;
  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, index) => (stepCount === 1 ? 0 : index / (stepCount - 1)));

  return (
    <Component ref={ref} className={cn("inline-flex flex-nowrap items-center", className)}>
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
        const spanTransition = {
          delay: startDelay / 1000 + (index * delay) / 1000,
          duration: totalDuration,
          ease: easing,
          times
        };

        return (
          <motion.span
            animate={inView ? animateKeyframes : fromSnapshot}
            className={cn("inline-block will-change-[transform,filter,opacity]", segment.className)}
            initial={fromSnapshot}
            key={segment.key}
            onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
            transition={spanTransition}
          >
            {segment.text === " " ? "\u00A0" : segment.text}
            {animateBy === "words" && index < elements.length - 1 ? "\u00A0" : null}
          </motion.span>
        );
      })}
    </Component>
  );
}

export default BlurText;
