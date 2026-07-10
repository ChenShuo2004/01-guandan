"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import "./TiltedCard.css";

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2
};

interface TiltedCardProps {
  altText?: string;
  captionText?: string;
  children?: ReactNode;
  className?: string;
  containerHeight?: string;
  containerWidth?: string;
  displayOverlayContent?: boolean;
  imageHeight?: string;
  imageSrc: string;
  imageWidth?: string;
  overlayContent?: ReactNode;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
}

export function TiltedCard({
  altText = "Tilted card",
  captionText = "",
  children,
  className = "",
  containerHeight = "420px",
  containerWidth = "100%",
  displayOverlayContent = false,
  imageHeight = "100%",
  imageSrc,
  imageWidth = "100%",
  overlayContent,
  rotateAmplitude = 8,
  scaleOnHover = 1.03,
  showMobileWarning = false,
  showTooltip = true
}: TiltedCardProps) {
  const ref = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(0, springValues);
  const rotateY = useSpring(0, springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, {
    damping: 30,
    mass: 1,
    stiffness: 350
  });
  const [lastY, setLastY] = useState(0);

  function handleMouse(event: React.MouseEvent<HTMLElement>) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;
    const nextRotateX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const nextRotateY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(nextRotateX);
    rotateY.set(nextRotateY);
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
    rotateFigcaption.set(-(offsetY - lastY) * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <figure
      className={"tilted-card-figure " + className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouse}
      ref={ref}
      style={{ height: containerHeight, width: containerWidth }}
    >
      {showMobileWarning ? <div className="tilted-card-mobile-alert">建议横屏查看</div> : null}
      <motion.div
        className="tilted-card-inner"
        style={{ height: imageHeight, rotateX, rotateY, scale, width: imageWidth }}
      >
        <Image alt={altText} className="tilted-card-img" fill sizes="(max-width: 768px) 92vw, 760px" src={imageSrc} />
        {displayOverlayContent && overlayContent ? (
          <motion.div className="tilted-card-overlay">{overlayContent}</motion.div>
        ) : null}
        {children}
      </motion.div>
      {showTooltip && captionText ? (
        <motion.figcaption
          className="tilted-card-caption"
          style={{ opacity, rotate: rotateFigcaption, x, y }}
        >
          {captionText}
        </motion.figcaption>
      ) : null}
    </figure>
  );
}
