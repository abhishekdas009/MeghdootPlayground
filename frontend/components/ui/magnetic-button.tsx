"use client";

import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  magneticPull?: number;
  glowColor?: string;
}

const MAGNET_SPRING = { stiffness: 320, damping: 22, mass: 0.45 };

export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(({
  children,
  className,
  magneticPull = 12,
  glowColor = "rgba(255, 255, 255, 0.2)",
  onClick,
  disabled,
  ...props
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, MAGNET_SPRING);
  const y = useSpring(rawY, MAGNET_SPRING);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowOpacity = useMotionValue(0);
  const rectRef = useRef<DOMRect | null>(null);

  const spotlightBg = useMotionTemplate`radial-gradient(circle 45px at ${glowX}px ${glowY}px, ${glowColor}, transparent 100%)`;

  const handleMouseEnter = () => {
    if (disabled || !containerRef.current) return;
    rectRef.current = containerRef.current.getBoundingClientRect();
    glowOpacity.set(1);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || disabled) return;
    const rect = rectRef.current ?? containerRef.current.getBoundingClientRect();
    rectRef.current = rect;

    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    glowX.set(relX);
    glowY.set(relY);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    rawX.set(((relX - centerX) / Math.max(rect.width, 1)) * magneticPull);
    rawY.set(((relY - centerY) / Math.max(rect.height, 1)) * magneticPull);
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    glowOpacity.set(0);
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className="relative inline-block"
    >
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "relative overflow-hidden transition-[opacity,transform,box-shadow,background-color] duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-200"
          style={{
            opacity: glowOpacity,
            background: spotlightBg,
          }}
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    </motion.div>
  );
});
MagneticButton.displayName = "MagneticButton";
