"use client";

import { useEffect, useState } from "react";

interface RankFrameProps {
  level: string;
  score: number;
  label?: string;
}

export function RankFrame({ level, score, label = "综合积分" }: RankFrameProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();
    const duration = 1000;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [score]);

  return (
    <div className="rank-frame mx-auto">
      <div className="rank-frame-orbit" />
      <div className="rank-frame-core">
        <span className="rank-frame-kicker">Current Rank</span>
        <strong className="rank-frame-level">{level}</strong>
        <span className="rank-frame-score">{displayScore.toLocaleString("zh-CN")}</span>
        <span className="rank-frame-label">{label}</span>
      </div>
    </div>
  );
}
