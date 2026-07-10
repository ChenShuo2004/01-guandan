"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { getImageAsset } from "@/lib/assets/image-assets";

export type SceneBackgroundVariant = "opening" | "entry";

interface SceneBackgroundProps {
  variant?: SceneBackgroundVariant;
}

const ambientParticles = [
  { id: 1, left: "7%", top: "12%", size: 2, driftX: 14, driftY: -20, delay: 0.2, duration: 6.8 },
  { id: 2, left: "15%", top: "31%", size: 3, driftX: -12, driftY: -28, delay: 1.1, duration: 8.2 },
  { id: 3, left: "23%", top: "18%", size: 2, driftX: 18, driftY: -24, delay: 0.7, duration: 7.4 },
  { id: 4, left: "31%", top: "43%", size: 2, driftX: -16, driftY: -18, delay: 1.7, duration: 9.1 },
  { id: 5, left: "39%", top: "9%", size: 3, driftX: 10, driftY: -26, delay: 2.2, duration: 8.7 },
  { id: 6, left: "47%", top: "29%", size: 2, driftX: -11, driftY: -22, delay: 0.4, duration: 7.8 },
  { id: 7, left: "55%", top: "14%", size: 2, driftX: 16, driftY: -30, delay: 1.4, duration: 9.4 },
  { id: 8, left: "63%", top: "38%", size: 3, driftX: -18, driftY: -20, delay: 2.6, duration: 8.4 },
  { id: 9, left: "71%", top: "20%", size: 2, driftX: 12, driftY: -27, delay: 0.9, duration: 7.1 },
  { id: 10, left: "80%", top: "34%", size: 2, driftX: -14, driftY: -23, delay: 1.9, duration: 8.9 },
  { id: 11, left: "89%", top: "11%", size: 3, driftX: 10, driftY: -18, delay: 0.5, duration: 7.6 },
  { id: 12, left: "94%", top: "47%", size: 2, driftX: -17, driftY: -26, delay: 2.4, duration: 9.3 },
  { id: 13, left: "12%", top: "61%", size: 2, driftX: 15, driftY: -16, delay: 1.3, duration: 8.6 },
  { id: 14, left: "28%", top: "68%", size: 2, driftX: -13, driftY: -19, delay: 2.1, duration: 7.9 },
  { id: 15, left: "68%", top: "65%", size: 2, driftX: 13, driftY: -17, delay: 0.8, duration: 8.1 },
  { id: 16, left: "86%", top: "72%", size: 2, driftX: -10, driftY: -21, delay: 1.6, duration: 9 }
] as const;

export function SceneBackground({ variant = "opening" }: SceneBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();
  const backgroundAsset = getImageAsset("training-world-background");
  const isOpening = variant === "opening";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 isolate overflow-hidden bg-[#020a18]"
    >
      <motion.div
        animate={
          shouldReduceMotion
            ? { scale: 1, x: "0%" }
            : isOpening
              ? { scale: 1, x: "0%" }
              : { scale: [1.018, 1, 1.012], x: ["0%", "-0.3%", "0%"] }
        }
        className="absolute inset-0 will-change-transform"
        initial={
          shouldReduceMotion
            ? false
            : isOpening
              ? { scale: 1.08, x: "0.8%" }
              : { scale: 1.018, x: "0%" }
        }
        transition={
          isOpening
            ? { duration: shouldReduceMotion ? 0 : 9, ease: [0.16, 1, 0.3, 1] }
            : {
                duration: shouldReduceMotion ? 0 : 18,
                ease: "easeInOut",
                repeat: shouldReduceMotion ? 0 : Infinity
              }
        }
      >
        {backgroundAsset?.src ? (
          <>
            <div className="absolute left-1/2 top-1/2 h-[100vw] w-[100dvh] -translate-x-1/2 -translate-y-1/2 -rotate-90 overflow-hidden">
              <Image
                alt=""
                className="scale-[1.06] object-cover brightness-75 saturate-125 blur-2xl"
                fill
                priority
                quality={95}
                sizes="100vw"
                src={backgroundAsset.src}
              />
            </div>
            <div className="absolute left-1/2 top-1/2 h-[100vw] w-[100dvh] -translate-x-1/2 -translate-y-1/2 -rotate-90">
              <Image
                alt=""
                className="object-contain"
                fill
                priority
                quality={95}
                sizes="100vw"
                src={backgroundAsset.src}
              />
            </div>
          </>
        ) : null}
      </motion.div>

      <div className="absolute inset-x-0 top-0 h-[20%] bg-[linear-gradient(180deg,rgba(2,10,24,0.62)_0%,rgba(5,19,42,0.18)_58%,transparent_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[20%] bg-[linear-gradient(0deg,rgba(1,7,20,0.7)_0%,rgba(4,17,38,0.2)_58%,transparent_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(71,175,255,0.16),transparent_32%),radial-gradient(circle_at_72%_14%,rgba(78,111,255,0.18),transparent_34%),linear-gradient(180deg,rgba(2,8,24,0.08)_0%,rgba(2,8,24,0.02)_46%,rgba(1,6,18,0.48)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(1,5,16,0.18)_70%,rgba(1,5,16,0.72)_100%)]" />

      <motion.div
        animate={shouldReduceMotion ? undefined : { x: ["-18%", "18%", "-18%"], opacity: [0.08, 0.2, 0.08] }}
        className="absolute left-[-28%] top-[45%] h-[30%] w-[156%] bg-[linear-gradient(100deg,transparent_22%,rgba(123,220,255,0.52)_47%,rgba(197,239,255,0.2)_53%,transparent_78%)] blur-2xl mix-blend-screen [mask-image:linear-gradient(to_bottom,transparent,black_28%,black_66%,transparent)]"
        transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
      />

      {ambientParticles.map((particle) => (
        <motion.span
          key={particle.id}
          animate={
            shouldReduceMotion
              ? { opacity: 0.26 }
              : {
                  opacity: [0.08, 0.58, 0.12],
                  x: [0, particle.driftX, 0],
                  y: [0, particle.driftY, 0]
                }
          }
          className="absolute rounded-full bg-[#d8f4ff] shadow-[0_0_12px_rgba(137,218,255,0.75)]"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          style={{
            height: particle.size,
            left: particle.left,
            top: particle.top,
            width: particle.size
          }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  delay: particle.delay,
                  duration: particle.duration,
                  ease: "easeInOut",
                  repeat: Infinity
                }
          }
        />
      ))}
    </div>
  );
}
