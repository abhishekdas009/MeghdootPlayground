"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ParticleBackground } from "@/components/shared/particle-background";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="app-shell relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#010309]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-blue-400/20 mix-blend-multiply blur-[120px] dark:bg-blue-500/30 dark:blur-[150px] dark:mix-blend-normal sm:h-[60%] sm:w-[60%]" />
        <div className="absolute right-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-purple-400/20 mix-blend-multiply blur-[120px] dark:bg-orange-500/25 dark:blur-[150px] dark:mix-blend-normal sm:h-[60%] sm:w-[60%]" />
        <div className="absolute bottom-[-20%] left-[20%] h-[50%] w-[60%] rounded-full bg-sky-300/20 mix-blend-multiply blur-[120px] dark:bg-cyan-500/20 dark:blur-[150px] dark:mix-blend-normal sm:h-[60%] sm:w-[60%]" />
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
