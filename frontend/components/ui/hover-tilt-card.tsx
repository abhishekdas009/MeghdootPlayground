"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  HTMLMotionProps
} from "framer-motion";
import { cn } from "@/lib/utils";

const ROTATION_RANGE = 5; // Low intensity
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

interface HoverTiltCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function HoverTiltCard({ children, className, ...props }: HoverTiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 400, damping: 30 });
  const ySpring = useSpring(y, { stiffness: 400, damping: 30 });

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg) scale3d(1.01, 1.01, 1.01)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);

    const shineX = ((e.clientX - rect.left) / width) * 100;
    const shineY = ((e.clientY - rect.top) / height) * 100;
    ref.current.style.setProperty('--shine-x', `${shineX}%`);
    ref.current.style.setProperty('--shine-y', `${shineY}%`);
    
    if (!ref.current.classList.contains('tilt-active')) {
      ref.current.classList.add('tilt-active');
    }
    
    if (props.onMouseMove) props.onMouseMove(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    x.set(0);
    y.set(0);
    if (ref.current) {
      ref.current.classList.remove('tilt-active');
    }
    if (props.onMouseLeave) props.onMouseLeave(e);
  };

  return (
    <motion.div
      ref={ref}
      {...props}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
        ...props.style,
      }}
      className={cn("page-hero relative transition-shadow duration-300", className)}
    >
      <div
        style={{
          transform: "translateZ(30px)",
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full flex flex-col gap-[inherit]"
      >
        {children}
      </div>
    </motion.div>
  );
}