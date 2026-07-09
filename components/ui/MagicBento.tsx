"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject
} from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { AnimatedProgress } from "@/components/ui/AnimatedProgress";

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = "0, 180, 255";
const MOBILE_BREAKPOINT = 768;

export interface MagicBentoItem {
  id: string;
  title: string;
  score: number;
  description?: string;
  label?: string;
}

interface MagicBentoProps {
  items: MagicBentoItem[];
  className?: string;
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

interface ParticleCardProps {
  children: ReactNode;
  className?: string;
  disableAnimations: boolean;
  particleCount: number;
  glowColor: string;
  enableTilt: boolean;
  clickEffect: boolean;
  enableMagnetism: boolean;
  style?: CSSProperties;
}

const createParticleElement = (x: number, y: number, color: string) => {
  const particle = document.createElement("div");
  particle.className = "magic-bento-particle";
  particle.style.cssText = `
    left: ${x}px;
    top: ${y}px;
    background: rgba(${color}, 1);
    box-shadow: 0 0 10px rgba(${color}, 0.55);
  `;
  return particle;
};

function ParticleCard({
  children,
  className,
  disableAnimations,
  particleCount,
  glowColor,
  enableTilt,
  clickEffect,
  enableMagnetism,
  style
}: ParticleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLDivElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    const card = cardRef.current;
    if (particlesInitialized.current || !card) return;

    const { width, height } = card.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [glowColor, particleCount]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.25,
        ease: "back.in(1.7)",
        onComplete: () => particle.remove()
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    const card = cardRef.current;
    if (!card || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        const currentCard = cardRef.current;
        if (!isHoveredRef.current || !currentCard) return;

        const clone = particle.cloneNode(true) as HTMLDivElement;
        currentCard.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(1.7)" }
        );
        gsap.to(clone, {
          x: (Math.random() - 0.5) * 90,
          y: (Math.random() - 0.5) * 90,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true
        });
      }, index * 90);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    const card = cardRef.current;
    if (disableAnimations || !card) return;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      gsap.to(card, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.28,
        ease: "power2.out"
      });
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        gsap.to(card, {
          rotateX: ((y - centerY) / centerY) * -5,
          rotateY: ((x - centerX) / centerX) * 5,
          duration: 0.14,
          ease: "power2.out",
          transformPerspective: 1000
        });
      }

      if (enableMagnetism) {
        magnetismAnimationRef.current = gsap.to(card, {
          x: (x - centerX) * 0.025,
          y: (y - centerY) * 0.025,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (!clickEffect) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );
      const ripple = document.createElement("div");

      ripple.className = "magic-bento-ripple";
      ripple.style.cssText = `
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        background: radial-gradient(circle, rgba(${glowColor}, 0.34) 0%, rgba(${glowColor}, 0.16) 34%, transparent 70%);
      `;

      card.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          onComplete: () => ripple.remove()
        }
      );
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);
    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [
    animateParticles,
    clearAllParticles,
    clickEffect,
    disableAnimations,
    enableMagnetism,
    enableTilt,
    glowColor
  ]);

  return (
    <div className={cn("magic-bento-card", className)} ref={cardRef} style={style}>
      {children}
    </div>
  );
}

function GlobalSpotlight({
  gridRef,
  disableAnimations,
  enabled,
  spotlightRadius,
  glowColor
}: {
  gridRef: RefObject<HTMLDivElement>;
  disableAnimations: boolean;
  enabled: boolean;
  spotlightRadius: number;
  glowColor: string;
}) {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (disableAnimations || !grid || !enabled) return;

    const spotlight = document.createElement("div");
    spotlight.className = "magic-bento-global-spotlight";
    spotlight.style.background = `radial-gradient(circle, rgba(${glowColor}, 0.16) 0%, rgba(${glowColor}, 0.08) 22%, rgba(${glowColor}, 0.03) 45%, transparent 70%)`;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = grid.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      const cards = grid.querySelectorAll<HTMLElement>(".magic-bento-card");

      if (!inside) {
        gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: "power2.out" });
        cards.forEach((card) => card.style.setProperty("--glow-intensity", "0"));
        return;
      }

      gsap.to(spotlight, {
        left: event.clientX,
        top: event.clientY,
        opacity: 0.75,
        duration: 0.16,
        ease: "power2.out"
      });

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const relativeX = ((event.clientX - cardRect.left) / cardRect.width) * 100;
        const relativeY = ((event.clientY - cardRect.top) / cardRect.height) * 100;
        const centerDistance = Math.hypot(
          event.clientX - (cardRect.left + cardRect.width / 2),
          event.clientY - (cardRect.top + cardRect.height / 2)
        );
        const intensity = Math.max(0, 1 - centerDistance / spotlightRadius);

        card.style.setProperty("--glow-x", `${relativeX}%`);
        card.style.setProperty("--glow-y", `${relativeY}%`);
        card.style.setProperty("--glow-intensity", intensity.toString());
        card.style.setProperty("--glow-radius", `${spotlightRadius}px`);
      });
    };

    const handleMouseLeave = () => {
      gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: "power2.out" });
      grid
        .querySelectorAll<HTMLElement>(".magic-bento-card")
        .forEach((card) => card.style.setProperty("--glow-intensity", "0"));
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      spotlight.remove();
    };
  }, [disableAnimations, enabled, glowColor, gridRef, spotlightRadius]);

  return null;
}

function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export function MagicBento({
  items,
  className,
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true
}: MagicBentoProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  return (
    <div className={cn("magic-bento-section", className)} ref={gridRef}>
      {enableSpotlight ? (
        <GlobalSpotlight
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          glowColor={glowColor}
          gridRef={gridRef}
          spotlightRadius={spotlightRadius}
        />
      ) : null}

      {items.map((item) => (
        <ParticleCard
          className={cn(
            textAutoHide && "magic-bento-card-text-autohide",
            enableBorderGlow && "magic-bento-card-border-glow"
          )}
          clickEffect={clickEffect}
          disableAnimations={shouldDisableAnimations || !enableStars}
          enableMagnetism={enableMagnetism}
          enableTilt={enableTilt}
          glowColor={glowColor}
          key={item.id}
          particleCount={particleCount}
          style={{ "--glow-color": glowColor } as CSSProperties}
        >
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#008ed8]">
                {item.label ?? "AI Signal"}
              </p>
              <h3 className="mt-2 text-base font-black text-[#12395a]">{item.title}</h3>
            </div>
            <span className="rounded-full bg-[#eaf8ff] px-3 py-1 text-sm font-black text-[#0066ff]">
              {item.score}
            </span>
          </div>
          <p className="relative z-10 mt-3 text-sm font-semibold leading-6 text-[#52657a]">
            {item.description ?? "Ace 正在持续校准这一项能力。"}
          </p>
          <AnimatedProgress className="relative z-10 mt-4" value={item.score} showValue />
        </ParticleCard>
      ))}
    </div>
  );
}
