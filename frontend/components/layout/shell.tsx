"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { VerticalUserRail } from "@/components/layout/vertical-user-rail";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { useUIStore } from "@/store/ui-store";
import { measureDisplayRefreshRate } from "@/lib/refresh-rate";
import { EASE_120HZ } from "@/lib/motion";
import { cn } from "@/lib/utils";

const MultiTaskingDock = dynamic(
  () => import("@/components/layout/multitasking-dock").then((m) => m.MultiTaskingDock),
  { ssr: false }
);
const KeyboardShortcutsModal = dynamic(
  () => import("@/components/layout/keyboard-shortcuts-modal").then((m) => m.KeyboardShortcutsModal),
  { ssr: false }
);
const WallpaperModal = dynamic(
  () => import("@/components/layout/wallpaper-modal").then((m) => m.WallpaperModal),
  { ssr: false }
);
const UserIdentityModal = dynamic(
  () => import("@/components/layout/user-identity-modal").then((m) => m.UserIdentityModal),
  { ssr: false }
);

function useGlobalTilt() {
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let animId: number | null = null;
    let currentCard: HTMLElement | null = null;
    let cachedRect: DOMRect | null = null;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentShineX = 50;
    let currentShineY = 50;
    let targetShineX = 50;
    let targetShineY = 50;

    const stopLoop = () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    const loop = () => {
      if (!currentCard) {
        animId = null;
        return;
      }

      currentTiltX += (targetTiltX - currentTiltX) * 0.2;
      currentTiltY += (targetTiltY - currentTiltY) * 0.2;
      currentShineX += (targetShineX - currentShineX) * 0.22;
      currentShineY += (targetShineY - currentShineY) * 0.22;

      currentCard.style.transform = `perspective(1200px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) scale3d(1.008, 1.008, 1.008)`;
      currentCard.style.setProperty("--shine-x", `${currentShineX.toFixed(1)}%`);
      currentCard.style.setProperty("--shine-y", `${currentShineY.toFixed(1)}%`);

      const settled =
        Math.abs(targetTiltX - currentTiltX) < 0.01 &&
        Math.abs(targetTiltY - currentTiltY) < 0.01 &&
        Math.abs(targetShineX - currentShineX) < 0.15 &&
        Math.abs(targetShineY - currentShineY) < 0.15;

      if (settled) {
        animId = null;
        return;
      }
      animId = requestAnimationFrame(loop);
    };

    const ensureLoop = () => {
      if (animId === null && currentCard) {
        animId = requestAnimationFrame(loop);
      }
    };

    const resetCard = (card: HTMLElement) => {
      card.classList.remove("tilt-active");
      card.style.transform = "";
      cachedRect = null;
      currentTiltX = 0;
      currentTiltY = 0;
      targetTiltX = 0;
      targetTiltY = 0;
      stopLoop();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const card = target?.closest(".page-hero") as HTMLElement | null;

      if (currentCard && currentCard !== card) {
        resetCard(currentCard);
      }

      if (!card) {
        currentCard = null;
        return;
      }

      if (currentCard !== card) {
        currentCard = card;
        card.classList.add("tilt-active");
        cachedRect = card.getBoundingClientRect();
      } else if (!cachedRect) {
        cachedRect = card.getBoundingClientRect();
      }

      const rect = cachedRect;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2 || 1;
      const centerY = rect.height / 2 || 1;

      targetTiltX = ((y - centerY) / centerY) * -2.2;
      targetTiltY = ((x - centerX) / centerX) * 2.2;
      targetShineX = (x / (rect.width || 1)) * 100;
      targetShineY = (y / (rect.height || 1)) * 100;

      ensureLoop();
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (!currentCard) return;
      const related = e.relatedTarget as Node | null;
      if (!related || !currentCard.contains(related)) {
        const card = currentCard;
        currentCard = null;
        resetCard(card);
      }
    };

    const invalidateRect = () => {
      cachedRect = null;
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseout", handleMouseLeave, { passive: true });
    window.addEventListener("scroll", invalidateRect, { passive: true });
    window.addEventListener("resize", invalidateRect, { passive: true });

    return () => {
      stopLoop();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseLeave);
      window.removeEventListener("scroll", invalidateRect);
      window.removeEventListener("resize", invalidateRect);
    };
  }, []);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const dockOpen = useUIStore((s) => s.dockOpen);
  const shortcutsModalOpen = useUIStore((s) => s.shortcutsModalOpen);
  const wallpaperModalOpen = useUIStore((s) => s.wallpaperModalOpen);
  const userModalOpen = useUIStore((s) => s.userModalOpen);
  const hydrateUserIdentity = useUIStore((s) => s.hydrateUserIdentity);

  const [mountDock, setMountDock] = React.useState(false);
  const [mountShortcuts, setMountShortcuts] = React.useState(false);
  const [mountWallpaper, setMountWallpaper] = React.useState(false);
  const [mountUserModal, setMountUserModal] = React.useState(false);

  React.useEffect(() => {
    if (dockOpen) setMountDock(true);
  }, [dockOpen]);

  React.useEffect(() => {
    if (shortcutsModalOpen) setMountShortcuts(true);
  }, [shortcutsModalOpen]);

  React.useEffect(() => {
    if (wallpaperModalOpen) setMountWallpaper(true);
  }, [wallpaperModalOpen]);

  React.useEffect(() => {
    if (userModalOpen) setMountUserModal(true);
  }, [userModalOpen]);

  useGlobalTilt();

  // Auto-measure and calibrate refresh rate once on mount
  React.useEffect(() => {
    measureDisplayRefreshRate();
    hydrateUserIdentity();
  }, [hydrateUserIdentity]);

  return (
    <div className="app-shell relative min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-200">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Subtle micro-dot grid for frosted glass refraction */}
        <div className="glass-backdrop-grid absolute inset-0 opacity-45 dark:opacity-55" />

        {/* Ambient radial light mode radiance (no expensive runtime CSS blur filter) */}
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 55% 45% at 10% 5%, rgba(59, 130, 246, 0.08) 0%, transparent 70%), radial-gradient(ellipse 50% 45% at 92% 8%, rgba(56, 189, 248, 0.08) 0%, transparent 70%), radial-gradient(ellipse 55% 45% at 45% 95%, rgba(96, 165, 250, 0.07) 0%, transparent 70%)",
          }}
        />

        {/* Ambient radial dark mode sapphire spotlight aura */}
        <div
          className="hidden dark:block absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 55% 45% at 45% 0%, rgba(14, 165, 233, 0.07) 0%, transparent 70%), radial-gradient(ellipse 45% 45% at 92% 65%, rgba(37, 99, 235, 0.05) 0%, transparent 70%)",
          }}
        />
      </div>
      <AnimatedBackground />
      <Header />
      <Sidebar />
      <VerticalUserRail />
      <main
        className={cn(
          "relative z-10 min-w-0 pt-[var(--app-header-height)] transition-[padding] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] md:pr-[78px] lg:pr-[100px] xl:pr-[116px] 2xl:pr-[126px]",
          sidebarCollapsed ? "md:pl-[104px]" : "md:pl-[288px]"
        )}
      >
        <motion.div
          key={pathname}
          initial={{ opacity: 0.92, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.14, ease: EASE_120HZ }}
          className="mx-auto min-h-[calc(100dvh-var(--app-header-height))] w-full max-w-[1920px] px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-4 sm:py-5 lg:px-6 lg:py-6 2xl:px-8"
        >
          {children}
        </motion.div>
      </main>
      {mountDock && <MultiTaskingDock />}
      {mountShortcuts && <KeyboardShortcutsModal />}
      {mountWallpaper && <WallpaperModal />}
      {mountUserModal && <UserIdentityModal />}
    </div>
  );
}
