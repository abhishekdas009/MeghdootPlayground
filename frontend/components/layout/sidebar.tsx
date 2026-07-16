"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronsLeft } from "lucide-react";
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

  // Automatically close the mobile sidebar when the route changes
  React.useEffect(() => {
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  }, [pathname, mobileSidebarOpen, setMobileSidebarOpen]);

  // Extracted render logic to handle both mobile and desktop states cleanly
  const renderNavItems = (isMobile = false) => {
    return NAV_ITEMS.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
      const Icon = getIcon(item.icon);
      const isCollapsed = !isMobile && sidebarCollapsed;

      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group relative flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            isCollapsed ? "md:justify-center md:px-2" : ""
          )}
          title={isCollapsed ? item.label : undefined}
        >
          <Icon 
            className={cn(
              "h-5 w-5 shrink-0 transition-colors", 
              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )} 
            aria-hidden="true" 
          />
          
          <motion.span
            initial={false}
            animate={{ 
              opacity: isCollapsed ? 0 : 1,
              width: isCollapsed ? 0 : "auto" 
            }}
            className={cn("truncate md:block", isCollapsed ? "md:hidden" : "")}
          >
            {item.label}
          </motion.span>

          {isActive && !isCollapsed && (
            <motion.div
              layoutId={isMobile ? "mobile-sidebar-active" : "desktop-sidebar-active"}
              className="absolute right-3 h-1.5 w-1.5 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              aria-hidden="true"
            />
          )}
        </Link>
      );
    });
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-[var(--app-header-height)] z-30 hidden h-[calc(100dvh-var(--app-header-height))] flex-col overflow-hidden border-r border-border bg-card md:flex"
      >
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {renderNavItems()}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-border p-2">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex min-h-11 w-full items-center justify-center rounded-md py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronsLeft 
              className={cn(
                "h-5 w-5 transition-transform duration-300", 
                sidebarCollapsed ? "rotate-180" : ""
              )} 
            />
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence initial={false}>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              role="presentation"
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            
            {/* Drawer */}
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Primary navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[calc(100vw-2rem)] flex-col overflow-hidden border-r border-border bg-card pt-[env(safe-area-inset-top)] shadow-xl md:hidden"
            >
              <div className="flex min-h-16 items-center justify-between border-b border-border px-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                    MP
                  </div>
                  <span className="truncate text-sm font-semibold text-foreground">
                    MeghdootPlayground
                  </span>
                </div>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                {renderNavItems(true)}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
