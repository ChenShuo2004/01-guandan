"use client";

import { useEffect, useState } from "react";
import SplitText from "@/components/effects/SplitText";

interface IntroTitleProps {
  text: string;
  startDelay?: number;
}

export function IntroTitle({ text, startDelay = 500 }: IntroTitleProps) {
  const [canRenderTitle, setCanRenderTitle] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setCanRenderTitle(true), startDelay);

    return () => window.clearTimeout(timer);
  }, [startDelay]);

  return (
    <div className="mx-auto flex min-h-[7.5rem] w-full max-w-[min(32rem,calc(100vw-2rem))] items-center justify-center px-1 py-3 text-center sm:min-h-[10rem] sm:max-w-3xl md:min-h-[12rem] lg:max-w-5xl [@media(orientation:landscape)_and_(max-height:600px)]:min-h-0 [@media(orientation:landscape)_and_(max-height:600px)]:py-1">
      {canRenderTitle ? (
        <SplitText
          className="max-w-full text-[clamp(2.15rem,10vw,3.6rem)] font-black leading-[1.14] text-white drop-shadow-[0_0_32px_rgba(94,202,255,0.28)] sm:text-6xl md:text-7xl lg:text-8xl [@media(orientation:landscape)_and_(max-height:600px)]:text-[clamp(2rem,6vw,4.25rem)]"
          delay={95}
          duration={1.25}
          ease="power3.out"
          from={{
            opacity: 0,
            y: 20,
            filter: "blur(10px)"
          }}
          overflow="visible"
          rootMargin="0px"
          splitType="chars"
          tag="h1"
          text={text}
          threshold={0}
          to={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)"
          }}
        />
      ) : null}
    </div>
  );
}
