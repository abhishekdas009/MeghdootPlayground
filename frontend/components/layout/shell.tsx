"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ParticleBackground } from "@/components/shared/particle-background";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

function useGlobalTilt() {
  React.useEffect(() => {
    let ticking = false;
    let currentCard: HTMLElement | null = null;
    let mouseX = 0;
    let mouseY = 0;

    const updateTilt = () => {
      if (!currentCard) {
        ticking = false;
        return;
      }
      
      const rect = currentCard.getBoundingClientRect();
      const x = mouseX - rect.left;
      const y = mouseY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Keep tilt low intensity (max 2.5 degrees) for best UX
      const tiltX = ((y - centerY) / centerY) * -2.5;
      const tiltY = ((x - centerX) / centerX) * 2.5;

      const shineX = (x / rect.width) * 100;
      const shineY = (y / rect.height) * 100;

      currentCard.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.01, 1.01, 1.01)`;
      currentCard.style.setProperty('--shine-x', `${shineX}%`);
      currentCard.style.setProperty('--shine-y', `${shineY}%`);
      
      ticking = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      const target = e.target as HTMLElement;
      const card = target.closest('.page-hero') as HTMLElement;
      
      if (currentCard && currentCard !== card) {
        currentCard.classList.remove('tilt-active');
        currentCard.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      }

      currentCard = card;

      if (card) {
        if (!card.classList.contains('tilt-active')) {
          card.classList.add('tilt-active');
        }
        if (!ticking) {
          window.requestAnimationFrame(updateTilt);
          ticking = true;
        }
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (!currentCard) return;
      const related = e.relatedTarget as HTMLElement;
      if (!currentCard.contains(related)) {
         currentCard.classList.remove('tilt-active');
         currentCard.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
         currentCard = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseout', handleMouseLeave, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();
  useGlobalTilt();

  return (
    <div className="app-shell relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[url('/images/dark-bg.png')] dark:bg-cover dark:bg-center dark:bg-fixed dark:bg-no-repeat">
      
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Light mode blobs */}
        <div className="absolute -top-[20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-blue-400/20 mix-blend-multiply blur-[120px] dark:hidden sm:h-[60%] sm:w-[60%]" />
        <div className="absolute right-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-purple-400/20 mix-blend-multiply blur-[120px] dark:hidden sm:h-[60%] sm:w-[60%]" />
        <div className="absolute bottom-[-20%] left-[20%] h-[50%] w-[60%] rounded-full bg-sky-300/20 mix-blend-multiply blur-[120px] dark:hidden sm:h-[60%] sm:w-[60%]" />
      </div>
      <ParticleBackground />
      <Header />
      <Sidebar />
      <main
        className={cn(
          "relative z-10 min-w-0 pt-[var(--app-header-height)] transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
          sidebarCollapsed ? "md:pl-[104px]" : "md:pl-[288px]"
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mx-auto min-h-[calc(100dvh-var(--app-header-height))] w-full max-w-[1920px] px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-4 sm:py-5 lg:px-6 lg:py-6 2xl:px-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
