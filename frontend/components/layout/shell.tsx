"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MultiTaskingDock } from "@/components/layout/multitasking-dock";
import { KeyboardShortcutsModal } from "@/components/layout/keyboard-shortcuts-modal";
import { WallpaperModal } from "@/components/layout/wallpaper-modal";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { useUIStore } from "@/store/ui-store";
import { measureDisplayRefreshRate } from "@/lib/refresh-rate";
import { EASE_120HZ } from "@/lib/motion";
import { cn } from "@/lib/utils";

function useGlobalTilt() {
  React.useEffect(() => {
    let animId: number;
    let currentCard: HTMLElement | null = null;
    let mouseX = 0;
    let mouseY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentShineX = 50;
    let currentShineY = 50;
    let targetShineX = 50;
    let targetShineY = 50;

    const loop = () => {
      if (currentCard) {
        // High-refresh 120Hz smooth damping lerp
        currentTiltX += (targetTiltX - currentTiltX) * 0.16;
        currentTiltY += (targetTiltY - currentTiltY) * 0.16;
        currentShineX += (targetShineX - currentShineX) * 0.18;
        currentShineY += (targetShineY - currentShineY) * 0.18;

        currentCard.style.transform = `perspective(1200px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
        currentCard.style.setProperty("--shine-x", `${currentShineX.toFixed(1)}%`);
        currentCard.style.setProperty("--shine-y", `${currentShineY.toFixed(1)}%`);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as HTMLElement;
      const card = target.closest(".page-hero") as HTMLElement;

      if (currentCard && currentCard !== card) {
        currentCard.classList.remove("tilt-active");
        currentCard.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        currentTiltX = 0;
        currentTiltY = 0;
      }

      currentCard = card;

      if (card) {
        if (!card.classList.contains("tilt-active")) {
          card.classList.add("tilt-active");
        }
        const rect = card.getBoundingClientRect();
        const x = mouseX - rect.left;
        const y = mouseY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        targetTiltX = ((y - centerY) / centerY) * -2.4;
        targetTiltY = ((x - centerX) / centerX) * 2.4;
        targetShineX = (x / rect.width) * 100;
        targetShineY = (y / rect.height) * 100;
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (!currentCard) return;
      const related = e.relatedTarget as HTMLElement;
      if (!currentCard.contains(related)) {
        currentCard.classList.remove("tilt-active");
        currentCard.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        currentCard = null;
        currentTiltX = 0;
        currentTiltY = 0;
        targetTiltX = 0;
        targetTiltY = 0;
      }
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseout", handleMouseLeave, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseLeave);
    };
  }, []);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();
  useGlobalTilt();

  // Auto-measure and calibrate refresh rate on mount
  React.useEffect(() => {
    measureDisplayRefreshRate();
  }, []);

  return (
    <div className="app-shell relative min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Ambient subtle light mode radiance */}
        <div className="absolute -top-[15%] left-[-10%] h-[45%] w-[45%] rounded-full bg-blue-500/10 mix-blend-multiply blur-[130px] dark:hidden sm:h-[55%] sm:w-[55%]" />
        <div className="absolute right-[-10%] top-[-10%] h-[45%] w-[45%] rounded-full bg-indigo-500/10 mix-blend-multiply blur-[130px] dark:hidden sm:h-[55%] sm:w-[55%]" />
        <div className="absolute bottom-[-15%] left-[20%] h-[45%] w-[50%] rounded-full bg-sky-400/10 mix-blend-multiply blur-[130px] dark:hidden sm:h-[55%] sm:w-[55%]" />

        {/* Ambient subtle dark mode spotlight aura */}
        <div className="hidden dark:block absolute -top-[20%] left-[25%] h-[50%] w-[50%] rounded-full bg-sky-500/[0.04] blur-[140px]" />
        <div className="hidden dark:block absolute top-[40%] right-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-500/[0.025] blur-[140px]" />
      </div>
      <AnimatedBackground />
      <Header />
      <Sidebar />
      <main
        className={cn(
          "relative z-10 min-w-0 pt-[var(--app-header-height)] transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          sidebarCollapsed ? "md:pl-[104px]" : "md:pl-[288px]"
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: EASE_120HZ }}
          className="mx-auto min-h-[calc(100dvh-var(--app-header-height))] w-full max-w-[1920px] px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-4 sm:py-5 lg:px-6 lg:py-6 2xl:px-8"
        >
          {children}
        </motion.div>
      </main>
      <MultiTaskingDock />
      <KeyboardShortcutsModal />
      <WallpaperModal />
    </div>
  );
}
