"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { getIcon } from "@/components/shared/icons";
import { useUIStore } from "@/store/ui-store";

export function Sidebar() {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useUIStore();

  const navItems = (onNavigate?: () => void) =>
    NAV_ITEMS.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
      const Icon = getIcon(item.icon);

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "group flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
            isActive
              ? "bg-hover text-accent"
              : "text-muted-foreground hover:bg-hover hover:text-foreground",
            sidebarCollapsed ? "md:justify-center md:px-2" : ""
          )}
          title={sidebarCollapsed ? item.label : undefined}
        >
          <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground")} />
          <motion.span
            initial={false}
            animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
            className={cn("truncate md:block", sidebarCollapsed ? "md:hidden" : "")}
          >
            {item.label}
          </motion.span>
          {isActive && !sidebarCollapsed && (
            <motion.div
              layoutId="sidebar-active"
              className="ml-auto h-1.5 w-1.5 rounded-full bg-accent"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </Link>
      );
    });

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed left-0 top-[var(--app-header-height)] z-30 hidden h-[calc(100dvh-var(--app-header-height))] flex-col overflow-hidden border-r border-border bg-card md:flex"
        )}
      >
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems()}
        </nav>

        {/* Collapse toggle at bottom */}
        <div className="border-t border-border p-2">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex min-h-11 w-full items-center justify-center rounded-md py-2 text-muted-foreground transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("transition-transform duration-250", sidebarCollapsed ? "rotate-180" : "")}
            >
              <path d="m11 17-5-5 5-5" />
              <path d="m18 17-5-5 5-5" />
            </svg>
          </button>
        </div>
      </motion.aside>

      <AnimatePresence initial={false}>
        {mobileSidebarOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="fixed inset-0 z-50 bg-primary/45 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Primary navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-1.5rem))] flex-col overflow-hidden border-r border-border bg-card pt-[env(safe-area-inset-top)] shadow-card-hover md:hidden"
            >
              <div className="flex min-h-16 items-center justify-between border-b border-border px-3">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                    MP
                  </div>
                  <span className="truncate text-sm font-semibold text-foreground">
                    MeghdootPlayground
                  </span>
                </div>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                {navItems(() => setMobileSidebarOpen(false))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
