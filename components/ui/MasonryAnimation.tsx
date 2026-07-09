"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

type AnimateFrom = "top" | "bottom" | "left" | "right";

interface MasonryAnimationProps {
  children: ReactNode;
  className?: string;
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: AnimateFrom;
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
}

const offsetByDirection: Record<AnimateFrom, { x: number; y: number }> = {
  top: { x: 0, y: -40 },
  bottom: { x: 0, y: 40 },
  left: { x: -40, y: 0 },
  right: { x: 40, y: 0 }
};

export function MasonryAnimation({
  children,
  className,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.08,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.98,
  blurToFocus = true
}: MasonryAnimationProps) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const cards = Array.from(scope.querySelectorAll<HTMLElement>("[data-profile-card]"));
    const background = scope.querySelector<HTMLElement>("[data-profile-background]");
    const offset = offsetByDirection[animateFrom];

    if (background) {
      gsap.fromTo(
        background,
        { opacity: 0 },
        { opacity: 1, duration: duration * 0.9, ease: "power2.out" }
      );
    }

    gsap.fromTo(
      cards,
      {
        opacity: 0,
        x: offset.x,
        y: offset.y,
        filter: blurToFocus ? "blur(10px)" : "blur(0px)"
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
        duration,
        ease,
        stagger,
        clearProps: "filter"
      }
    );

    if (!scaleOnHover) return;

    const cleanups = cards.map((card) => {
      const handleEnter = () => {
        gsap.to(card, {
          scale: hoverScale,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto"
        });
      };
      const handleLeave = () => {
        gsap.to(card, {
          scale: 1,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto"
        });
      };

      card.addEventListener("mouseenter", handleEnter);
      card.addEventListener("mouseleave", handleLeave);

      return () => {
        card.removeEventListener("mouseenter", handleEnter);
        card.removeEventListener("mouseleave", handleLeave);
      };
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [animateFrom, blurToFocus, duration, ease, hoverScale, scaleOnHover, stagger]);

  return (
    <div className={cn("relative", className)} ref={scopeRef}>
      {children}
    </div>
  );
}
