"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface LanyardCardProps {
  accent: "cyan" | "gold";
  description: string;
  features: string[];
  href: string;
  icon: string;
  label: string;
  title: string;
}

export function LanyardCard({ accent, description, features, href, icon, label, title }: LanyardCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const hasDraggedRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const isGold = accent === "gold";
  const accentColor = isGold ? "#ffd36d" : "#7edfff";

  useEffect(() => {
    if (!dragging) return;
    const handlePointerMove = (event: PointerEvent) => {
      const card = cardRef.current;
      if (!card) return;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - (bounds.left + bounds.width / 2)) / bounds.width;
      const y = (event.clientY - (bounds.top + bounds.height / 2)) / bounds.height;
      hasDraggedRef.current = true;
      setRotation({ x: Math.max(-12, Math.min(12, -y * 22)), y: Math.max(-14, Math.min(14, x * 26)) });
    };
    const handlePointerUp = () => {
      setDragging(false);
      setRotation({ x: 0, y: 0 });
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging]);

  return (
    <Link
      ref={cardRef}
      href={href}
      aria-label={`进入${title}`}
      className={`lanyard-card group ${isGold ? "lanyard-card-gold" : "lanyard-card-cyan"}`}
      onClick={(event) => {
        if (!hasDraggedRef.current) return;
        event.preventDefault();
        hasDraggedRef.current = false;
      }}
      onPointerDown={() => {
        hasDraggedRef.current = false;
        setDragging(true);
      }}
      style={{ ["--card-accent" as string]: accentColor, transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
    >
      <span className="lanyard-band" aria-hidden="true"><span className="lanyard-band-mark">AI TRAINING</span></span>
      <span className="lanyard-clip" aria-hidden="true" />
      <span className="lanyard-card-shell">
        <span className="lanyard-card-noise" aria-hidden="true" />
        <span className="lanyard-card-topline"><span className="lanyard-card-chip" aria-hidden="true" /><span className="lanyard-card-lock">▼ LOCK</span></span>
        <span className="lanyard-card-icon" aria-hidden="true">{icon}</span>
        <span className="lanyard-card-copy"><span className="lanyard-card-label">{label}</span><strong>{title}</strong><span>{description}</span></span>
        <span className="lanyard-card-footer">{features.slice(0, 2).map((feature) => <span key={feature}>{feature}</span>)}<span className="lanyard-card-arrow" aria-hidden="true">↗</span></span>
      </span>
    </Link>
  );
}
