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
    <div className="mx-auto flex min-h-[12rem] w-full max-w-[17.5rem] items-center justify-center px-1 text-center sm:max-w-3xl md:min-h-[14rem] lg:max-w-5xl">
      {canRenderTitle ? (
        <SplitText
          className="text-[2.65rem] font-black leading-[1.06] text-white drop-shadow-[0_0_32px_rgba(94,202,255,0.28)] sm:text-6xl md:text-7xl lg:text-8xl"
          delay={95}
          duration={1.25}
          ease="power3.out"
          from={{
            opacity: 0,
            y: 40,
            filter: "blur(10px)"
          }}
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
