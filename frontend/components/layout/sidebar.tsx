"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  HelpCircle,
  ShieldCheck,
  LayoutDashboard,
  TerminalSquare,
  FileSpreadsheet,
  Ticket,
  Bookmark,
  History,
  BarChart2,
  Binary,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { useTheme } from "@/components/providers/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "SOQL Generator", href: "/soql-generator", icon: TerminalSquare },
  { label: "Excel Automation", href: "/excel-automation", icon: FileSpreadsheet },
  { label: "Formula Generator", href: "/formula-generator", icon: Binary },
  { label: "Ticket Formatter", href: "/ticket-formatter", icon: Ticket },
  { label: "Query Library", href: "/template-manager", icon: Bookmark },
  { label: "History", href: "/history", icon: History },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Help & Docs", href: "/help", icon: HelpCircle },
];

// ─── Salesforce Lightning v2.4 color mapping ─────────────────────────
const NAV_COLORS: Record<string, string> = {
  "/dashboard": "from-blue-500 to-blue-600",
  "/soql-generator": "from-[#0176d3] to-sky-600",
  "/excel-automation": "from-emerald-500 to-emerald-600",
  "/formula-generator": "from-purple-500 to-purple-600",
  "/ticket-formatter": "from-amber-500 to-orange-500",
  "/template-manager": "from-cyan-500 to-cyan-600",
  "/history": "from-indigo-500 to-indigo-600",
  "/analytics": "from-rose-500 to-pink-500",
  "/help": "from-teal-500 to-teal-600",
};

const NAV_ICON_BG: Record<string, string> = {
  "/dashboard": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "/soql-generator": "bg-[#0176d3]/15 text-[#0176d3] dark:text-sky-400 font-extrabold",
  "/excel-automation": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "/formula-generator": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "/ticket-formatter": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "/template-manager": "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  "/history": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  "/analytics": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "/help": "bg-teal-500/10 text-teal-600 dark:text-teal-400",
};

const DIVIDERS_AFTER = new Set(["/ticket-formatter", "/analytics"]);

export function Sidebar() {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useUIStore();

  const { theme, toggleTheme } = useTheme();

  const renderNavItems = (onNavigate?: () => void) =>
    NAV_ITEMS.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
      const Icon = item.icon;
      const gradient = NAV_COLORS[item.href] ?? "from-gray-500 to-gray-600";
      const iconBg = NAV_ICON_BG[item.href] ?? "bg-gray-500/10 text-gray-600 dark:text-gray-400";
      const showDivider = DIVIDERS_AFTER.has(item.href);

      return (
        <React.Fragment key={item.href}>
          <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0176d3]/50",
              isActive
                ? "bg-[#0176d3]/10 text-[#0176d3] shadow-2xs font-extrabold"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              sidebarCollapsed ? "md:justify-center md:px-2" : ""
            )}
            title={sidebarCollapsed ? item.label : undefined}
          >
            {/* Active indicator bar */}
            {isActive && (
              <motion.div
                layoutId="sidebar-active-bar"
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full bg-gradient-to-b",
                  gradient
                )}
                style={{ width: 3.5, height: 26 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
              />
            )}

            {/* Icon box */}
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-110",
                isActive
                  ? iconBg
                  : "text-muted-foreground group-hover:text-foreground bg-transparent group-hover:bg-muted/40"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>

            {/* Label */}
            <motion.span
              initial={false}
              animate={{
                opacity: sidebarCollapsed ? 0 : 1,
                width: sidebarCollapsed ? 0 : "auto",
              }}
              className={cn(
                "truncate tracking-tight md:block",
                sidebarCollapsed ? "md:hidden" : ""
              )}
            >
              {item.label}
            </motion.span>
          </Link>

          {/* Section divider */}
          {showDivider && !sidebarCollapsed && (
            <div className="mx-3 my-2.5 h-px bg-border/60" />
          )}
          {showDivider && sidebarCollapsed && (
            <div className="mx-2 my-2 h-px bg-border/60" />
          )}
        </React.Fragment>
      );
    });

  // Footer section that houses Theme Toggle, User Avatar, and System Status
  const renderSidebarFooter = (isMobile = false) => (
    <div className="border-t border-border/20 p-3 bg-transparent space-y-2">
      {/* User Profile & Theme Switcher Box */}
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-xl p-2 bg-background/40 backdrop-blur-sm border border-border/30 shadow-none transition-all",
          sidebarCollapsed && !isMobile ? "flex-col justify-center p-1.5 gap-1.5" : ""
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-8 w-8 shrink-0 ring-2 ring-[#0176d3]/30">
            <AvatarImage src="" alt="Salesforce Team" />
            <AvatarFallback className="bg-gradient-to-br from-[#0176d3] to-blue-600 text-white text-[11px] font-extrabold border-0">
              ST
            </AvatarFallback>
          </Avatar>
          {(!sidebarCollapsed || isMobile) && (
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-extrabold text-foreground truncate">Salesforce Team</div>
              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>PostgreSQL DB</span>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          type="button"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/40",
            sidebarCollapsed && !isMobile ? "w-full" : ""
          )}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-[#0176d3]" />
          )}
        </button>
      </div>

      {/* Desktop Collapse Toggle */}
      {!isMobile && (
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "flex min-h-[36px] w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition-all duration-200 hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0176d3]/50",
            sidebarCollapsed ? "justify-center px-0" : ""
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-[#0176d3]" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 text-[#0176d3]" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ─── Desktop & Tablet Sidebar ────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-[var(--app-header-height)] z-30 hidden h-[calc(100dvh-var(--app-header-height))] flex-col overflow-hidden border-r border-border/20 bg-transparent backdrop-blur-lg md:flex shadow-none"
      >
        {/* Nav items container */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1 no-scrollbar">
          {renderNavItems()}
        </nav>

        {/* Footer with Theme toggle, User avatar, and Collapse button */}
        {renderSidebarFooter(false)}
      </motion.aside>

      {/* ─── Mobile Phone & Touch Screen Slide-Over Drawer ───────────── */}
      <AnimatePresence initial={false}>
        {mobileSidebarOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation overlay"
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Primary mobile navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(19rem,calc(100vw-2rem))] flex-col overflow-hidden border-r border-border/20 bg-background/80 dark:bg-black/80 backdrop-blur-xl pt-[env(safe-area-inset-top)] shadow-2xl md:hidden"
            >
              {/* Mobile Header with Logo and Close X */}
              <div className="flex min-h-16 items-center justify-between border-b border-border/20 px-4 bg-transparent">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Image
                    src="/logo1.png"
                    alt="Meghdoot Logo"
                    width={42}
                    height={42}
                    className="shrink-0 rounded-xl shadow-sm"
                  />
                  <div className="flex flex-col leading-none">
                    <span className="truncate text-lg font-extrabold text-foreground tracking-tight">
                      Meghdoot
                    </span>
                    <span className="text-[11px] font-extrabold text-[#0176d3] uppercase tracking-wider">
                      Lightning v2.4
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground border border-border/60 bg-card shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0176d3]/50"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Scrollable Nav List */}
              <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] no-scrollbar">
                {renderNavItems(() => setMobileSidebarOpen(false))}
              </nav>

              {/* Mobile Footer with Theme Toggle and User Profile */}
              {renderSidebarFooter(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
