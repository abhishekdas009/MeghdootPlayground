"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  magneticPull?: number; 
  glowColor?: string; 
}

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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || disabled) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    // Spotlight position relative to button
    setMousePos({ x: clientX - left, y: clientY - top });

    // Magnetic pull calculation
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Only pull if mouse is within a reasonable distance (already handled by hover, but smooth)
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    setPosition({ 
      x: (distanceX / width) * magneticPull, 
      y: (distanceY / height) * magneticPull 
    });
  };

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      className="relative inline-block"
    >
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "relative overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        onClick={onClick}
        {...props}
      >
        {/* Spotlight Effect */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `radial-gradient(circle 45px at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 100%)`,
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
