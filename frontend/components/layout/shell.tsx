"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main
        className={cn(
          "pt-14 transition-all duration-250 ease-in-out",
          sidebarCollapsed ? "pl-16" : "pl-60"
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="min-h-[calc(100vh-3.5rem)] p-6"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
