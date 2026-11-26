"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_120HZ, GLASS_TAB_SPRING } from "@/lib/motion";

/* -------------------------------------------------------------------------- */
/* AnimatedNumber — Smooth 120Hz rAF number interpolation                     */
/* -------------------------------------------------------------------------- */

export function AnimatedNumber({
  value,
  duration = 550,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = React.useState(value);
  const prevRef = React.useRef(value);

  React.useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;

    const startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        prevRef.current = end;
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <span className={cn("tabular-nums", className)}>{display.toLocaleString()}</span>;
}

/* -------------------------------------------------------------------------- */
/* GlassSpotlightCard — Cursor-tracking sapphire liquid glass card            */
/* -------------------------------------------------------------------------- */

export interface GlassSpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  interactive?: boolean;
  delay?: number;
}

/**
 * Frosted glass container featuring a subtle cursor-tracking sapphire radial
 * highlight and top specular rim for high-craft UI depth.
 */
export function GlassSpotlightCard({
  children,
  className,
  spotlightColor = "rgba(56, 189, 248, 0.14)",
  interactive = false,
  delay = 0,
}: GlassSpotlightCardProps) {
  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = React.useCallback(() => {
    mouseX.set(-300);
    mouseY.set(-300);
  }, [mouseX, mouseY]);

  const spotlightBg = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 75%)`;

  return (
    <motion.div
      initial={{ opacity: 0.9, y: 8, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, delay: Math.min(delay, 0.12), ease: EASE_120HZ }}
      whileHover={interactive ? { y: -3 } : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "app-card group relative overflow-hidden rounded-3xl",
        interactive && "cursor-pointer",
        className
      )}
    >
      {/* Top specular inner highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px glass-shimmer-line opacity-80" />

      {/* Interactive pointer-tracking spotlight */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px z-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlightBg }}
      />

      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* GlassHero — Cohesive frosted glass header banner with subtle aura          */
/* -------------------------------------------------------------------------- */

export interface GlassHeroProps {
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  title: React.ReactNode;
  highlight?: string;
  description: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  watermark?: string;
  className?: string;
}

/**
 * Architectural frosted glass hero banner shared across application modules.
 * Preserves pure white & sapphire blue palette with ambient radial depth.
 */
export function GlassHero({
  icon: Icon,
  badge,
  title,
  highlight,
  description,
  actions,
  footer,
  watermark,
  className,
}: GlassHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0.9, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: EASE_120HZ }}
      className={cn(
        "page-hero relative flex flex-col gap-5 overflow-hidden rounded-3xl",
        className
      )}
    >
      {/* Top specular rim */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px glass-shimmer-line" />

      {/* Ambient monochrome sapphire glass orbs */}
      <div className="pointer-events-none absolute -top-32 -right-28 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-400/[0.12]" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl dark:bg-blue-500/[0.08]" />

      {/* Subtle watermark typography */}
      {watermark && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-3 z-0 select-none overflow-hidden opacity-40 dark:opacity-25 hidden sm:block"
        >
          <span className="whitespace-nowrap text-[46px] lg:text-[64px] font-black leading-none tracking-tighter bg-gradient-to-b from-blue-500/30 to-transparent dark:from-sky-300/25 dark:to-transparent bg-clip-text text-transparent">
            {watermark}
          </span>
        </div>
      )}

      <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <motion.div
            whileHover={{ scale: 1.06, rotate: -3 }}
            transition={GLASS_TAB_SPRING}
            className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-blue-700 text-white shadow-[0_8px_24px_rgba(2,132,199,0.38)] ring-1 ring-white/30"
          >
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
          </motion.div>
          <div className="min-w-0 flex-1 space-y-1.5">
            {badge && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-blue-700 dark:border-sky-400/30 dark:bg-sky-500/15 dark:text-sky-300 backdrop-blur-md whitespace-nowrap">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-sky-400 animate-pulse shrink-0" />
                <span>{badge}</span>
              </div>
            )}
            <h1 className="!text-2xl sm:!text-3xl font-black tracking-tight text-slate-950 dark:text-white leading-tight">
              {title}{" "}
              {highlight && (
                <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 dark:from-sky-300 dark:via-blue-400 dark:to-white bg-clip-text text-transparent">
                  {highlight}
                </span>
              )}
            </h1>
            <p className="max-w-2xl !text-xs sm:!text-sm font-medium text-slate-600 dark:text-slate-300/90 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 max-w-full shrink-0">{actions}</div>
        )}
      </div>

      {footer && (
        <div className="relative z-10 border-t border-slate-200/70 dark:border-white/[0.08] pt-4">
          {footer}
        </div>
      )}
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/* GlassTabRail — Spring-animated segmented switcher with layoutId indicator  */
/* -------------------------------------------------------------------------- */

export interface GlassTabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
}

export function GlassTabRail<T extends string>({
  items,
  value,
  onChange,
  layoutId,
  className,
  size = "md",
}: {
  items: GlassTabItem<T>[];
  value: T;
  onChange: (next: T) => void;
  layoutId: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "glass-mode-toggle inline-flex flex-wrap sm:flex-nowrap items-center gap-1 p-1.5 relative",
        size === "sm" ? "rounded-xl" : "rounded-2xl",
        className
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "relative z-10 flex items-center justify-center gap-2 font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap select-none",
              size === "sm"
                ? "px-3 py-1.5 text-xs rounded-lg"
                : "px-4 py-2 text-xs sm:text-sm rounded-xl",
              active
                ? "text-white font-extrabold"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
            )}
          >
            {active && (
              <motion.div
                layoutId={layoutId}
                transition={GLASS_TAB_SPRING}
                className={cn(
                  "absolute inset-0 -z-10 bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 border border-sky-300/40 shadow-[0_4px_16px_rgba(2,132,199,0.42),inset_0_1px_0_rgba(255,255,255,0.35)]",
                  size === "sm" ? "rounded-lg" : "rounded-xl"
                )}
              />
            )}
            {Icon && (
              <Icon
                className={cn(
                  "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors",
                  active ? "text-white" : "text-blue-600 dark:text-sky-400"
                )}
              />
            )}
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge !== null && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none transition-colors",
                  active
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-blue-500/10 text-blue-700 dark:bg-sky-500/15 dark:text-sky-300 border border-blue-500/20"
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
