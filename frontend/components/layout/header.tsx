"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  Menu,
  BellRing,
  Clock,
  Check,
  CheckCircle2,
  ChevronRight,
  Terminal,
  FileSearch,
  Star,
  Ticket,
  XCircle,
  ArrowRightLeft,
  Users,
  FilePlus,
  Layers3,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDashboardStore, type ActivityEntry } from "@/lib/dashboard-store";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { GlobalSearchModal } from "@/components/layout/global-search-modal";
import { ThemeCustomizer } from "@/components/layout/theme-customizer";
import { EmptyActivityIllustration } from "@/components/ui/illustrations";

type ThemeMode = "light" | "dark";

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void | Promise<void>) => {
    finished: Promise<void>;
  };
};

const THEME_STORAGE_KEY = "meghdoot-theme-v2";
const NOTIFICATION_LAST_SEEN_STORAGE_KEY = "meghdoot-last-seen-activity-at";

function notificationMeta(type: ActivityEntry["type"]) {
  switch (type) {
    case "soql-generated":
      return { icon: Terminal, surface: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-300" };
    case "excel-operation":
      return { icon: FileSearch, surface: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-300" };
    case "favourite-added":
    case "favourite-removed":
      return { icon: Star, surface: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-300" };
    case "ticket-formatted":
      return { icon: Ticket, surface: "bg-orange-500/10 dark:bg-orange-500/20", text: "text-orange-600 dark:text-orange-300" };
    case "ticket-cancellation":
      return { icon: XCircle, surface: "bg-rose-500/10 dark:bg-rose-500/20", text: "text-rose-600 dark:text-rose-300" };
    case "asset-transfer":
      return { icon: ArrowRightLeft, surface: "bg-violet-500/10 dark:bg-violet-500/20", text: "text-violet-600 dark:text-violet-300" };
    case "case-assignment":
      return { icon: Users, surface: "bg-teal-500/10 dark:bg-teal-500/20", text: "text-teal-600 dark:text-teal-300" };
    case "template-created":
    case "template-updated":
    case "template-deleted":
      return { icon: FilePlus, surface: "bg-indigo-500/10 dark:bg-indigo-500/20", text: "text-indigo-600 dark:text-indigo-300" };
    default:
      return { icon: Layers3, surface: "bg-slate-500/10 dark:bg-slate-500/20", text: "text-slate-600 dark:text-slate-300" };
  }
}

export function Header() {
  const router = useRouter();
  const { toggleSidebar, setMobileSidebarOpen } = useUIStore();
  const activity = useDashboardStore((s) => s.activity);

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const [searchFocused, setSearchFocused] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<ThemeMode>("dark");
  const [lastSeenActivityAt, setLastSeenActivityAt] = React.useState<string | null>(null);
  const [notificationReadStateLoaded, setNotificationReadStateLoaded] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme: ThemeMode = savedTheme === "light" ? "light" : "dark";

    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  React.useEffect(() => {
    const storedMarker = window.localStorage.getItem(NOTIFICATION_LAST_SEEN_STORAGE_KEY);
    const hasValidMarker = storedMarker && Number.isFinite(Date.parse(storedMarker));
    const marker = hasValidMarker ? storedMarker : new Date().toISOString();

    if (!hasValidMarker) {
      window.localStorage.setItem(NOTIFICATION_LAST_SEEN_STORAGE_KEY, marker);
    }

    setLastSeenActivityAt(marker);
    setNotificationReadStateLoaded(true);
  }, []);

  const applyTheme = React.useCallback((nextTheme: ThemeMode) => {
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion) {
      root.classList.add("theme-transition");
    }
    applyTheme(nextTheme);
    if (!prefersReducedMotion) {
      window.setTimeout(() => root.classList.remove("theme-transition"), 480);
    }
  };

  const unreadActivityIds = React.useMemo(() => {
    if (!notificationReadStateLoaded || !lastSeenActivityAt) return new Set<string>();

    const lastSeenTimestamp = Date.parse(lastSeenActivityAt);
    return new Set(
      activity
        .filter((item) => Date.parse(item.timestamp) > lastSeenTimestamp)
        .map((item) => item.id)
    );
  }, [activity, lastSeenActivityAt, notificationReadStateLoaded]);

  const unreadActivityCount = unreadActivityIds.size;
  const notificationBadge = unreadActivityCount > 9 ? "9+" : unreadActivityCount;

  const markNotificationsAsRead = React.useCallback(() => {
    const marker = new Date().toISOString();
    window.localStorage.setItem(NOTIFICATION_LAST_SEEN_STORAGE_KEY, marker);
    setLastSeenActivityAt(marker);
  }, []);

  // Enable the Cmd+K / Ctrl+K keyboard shortcut for global search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="desktop-command-bar fixed top-0 left-0 right-0 z-50 h-14 w-full border-b border-border/40 bg-background/65 backdrop-blur-xl shadow-[0_1px_0_rgb(255_255_255_/_0.04)] transition-all duration-200" suppressHydrationWarning>
      <div className="flex h-full items-center justify-between px-4 sm:px-5 gap-3" suppressHydrationWarning>
        {/* Left Section: Menu & Brand */}
        <div className="flex items-center gap-2.5 shrink-0" suppressHydrationWarning>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 md:flex"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo + Brand */}
          <div
            className="group relative flex items-center h-12 cursor-pointer"
            onClick={() => router.push("/")}
            role="button"
            tabIndex={0}
          >
            {/* Default State */}
            <div className="flex items-center gap-2.5 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2 group-hover:pointer-events-none">
              <Image
                src="/logo%20white.png"
                alt="Meghdoot Logo"
                width={42}
                height={42}
                className="shrink-0 rounded-xl shadow-sm dark:hidden"
                priority
              />
              <Image
                src="/logo1.png"
                alt="Meghdoot Logo"
                width={42}
                height={42}
                className="hidden shrink-0 rounded-xl shadow-sm dark:block"
                priority
              />
              <div className="flex flex-col leading-none pr-4">
                <span className="text-lg font-extrabold tracking-tight text-foreground">
                  Meghdoot
                </span>
                <span className="hidden sm:inline text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground/90 uppercase">
                  Playground
                </span>
              </div>
            </div>

            {/* Hover State */}
            <div className="absolute inset-y-0 left-0 flex items-center gap-2.5 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none">
              <span className="text-sm font-extrabold tracking-tight text-muted-foreground italic whitespace-nowrap">
                Made by
              </span>
              <div className="h-10 w-28 lg:w-36">
                <Image
                  src="/signature-black-cropped.png"
                  alt="Abhishek signature"
                  width={144}
                  height={60}
                  className="h-full w-full object-contain object-left opacity-90 dark:hidden"
                  priority
                />
                <Image
                  src="/signature-white-cropped.png"
                  alt="Abhishek signature"
                  width={144}
                  height={60}
                  className="hidden h-full w-full object-contain object-left opacity-100 dark:block"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center Section: Global Search Bar */}
        <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl px-4">
          <div
            onClick={() => setSearchOpen(true)}
            className={cn(
              "relative w-full items-center rounded-xl border transition-all duration-200 cursor-pointer flex",
              searchFocused || searchOpen
                ? "border-[#0176d3] ring-2 ring-[#0176d3]/15 bg-card shadow-sm"
                : "border-border/80 bg-muted/30 hover:border-border hover:bg-muted/50"
            )}
          >
            <Search
              className={cn(
                "absolute left-3.5 h-4 w-4 transition-colors",
                searchFocused || searchOpen ? "text-[#0176d3]" : "text-muted-foreground"
              )}
            />
            <Input
              ref={searchInputRef}
              readOnly
              placeholder="Search 37+ templates, queries, modules, history... (Press ⌘K or Ctrl+K)"
              className="h-9.5 border-0 bg-transparent pl-10 pr-16 text-xs font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground cursor-pointer"
              onClick={() => setSearchOpen(true)}
              onFocus={() => {
                setSearchFocused(true);
                setSearchOpen(true);
                searchInputRef.current?.blur();
              }}
              onBlur={() => setSearchFocused(false)}
            />
            <div className="absolute right-2.5 flex items-center text-muted-foreground pointer-events-none">
              <kbd className="hidden h-5.5 items-center gap-0.5 rounded-md border border-border/60 bg-card px-2 text-[10px] font-extrabold tracking-widest text-muted-foreground lg:inline-flex shadow-2xs">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Section: Mobile Search, Theme Toggle, Blue Star Logo */}
        <div className="flex flex-1 md:flex-none items-center justify-end gap-3 shrink-0">
          {/* Mobile Search Trigger Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex md:hidden items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-muted/30 hover:bg-muted/50 text-xs font-bold text-muted-foreground hover:text-foreground transition-all shadow-2xs"
          >
            <Search className="h-3.5 w-3.5 text-[#0176d3]" />
            <span>Search...</span>
          </button>

          {/* Theme rail + activity updates */}
          <div className="hidden md:flex items-center gap-2">
              <ThemeCustomizer />
              <button
                type="button"
                role="switch"
                aria-checked={theme === "dark"}
                onClick={toggleTheme}
                className={cn(
                  "relative flex h-[34px] w-[70px] shrink-0 items-center overflow-hidden rounded-full transition-colors duration-500 ease-in-out shadow-inner",
                  theme === "dark" ? "bg-[#5a56c6]" : "bg-[#48b5f2]"
                )}
                aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              >
                {/* Dark Mode Decor: Stars */}
                <div
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    theme === "dark" ? "opacity-100" : "opacity-0"
                  )}
                >
                  <svg width="100%" height="100%" viewBox="0 0 70 34" className="absolute inset-0 pointer-events-none">
                    <g transform="translate(45, 8) scale(0.6)">
                      <path d="M 5 0 L 6.5 3.5 L 10 3.5 L 7 5.5 L 8.5 9 L 5 7 L 1.5 9 L 3 5.5 L 0 3.5 L 3.5 3.5 Z" fill="white" opacity="0.9" />
                    </g>
                    <g transform="translate(56, 17) scale(0.4)">
                      <path d="M 5 0 L 6.5 3.5 L 10 3.5 L 7 5.5 L 8.5 9 L 5 7 L 1.5 9 L 3 5.5 L 0 3.5 L 3.5 3.5 Z" fill="white" opacity="0.6" />
                    </g>
                    <g transform="translate(41, 21) scale(0.5)">
                      <path d="M 5 0 L 6.5 3.5 L 10 3.5 L 7 5.5 L 8.5 9 L 5 7 L 1.5 9 L 3 5.5 L 0 3.5 L 3.5 3.5 Z" fill="white" opacity="0.4" />
                    </g>
                  </svg>
                </div>

                {/* Light Mode Decor: Clouds */}
                <div
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    theme === "light" ? "opacity-100" : "opacity-0"
                  )}
                >
                  <svg width="100%" height="100%" viewBox="0 0 70 34" className="absolute inset-0 pointer-events-none">
                    <rect x="10" y="10" width="12" height="4" rx="2" fill="white" opacity="0.95" />
                    <rect x="14" y="8" width="6" height="4" rx="2" fill="white" opacity="0.95" />

                    <rect x="18" y="22" width="14" height="4" rx="2" fill="white" opacity="0.8" />
                    <rect x="22" y="20" width="8" height="4" rx="2" fill="white" opacity="0.8" />
                    
                    <rect x="6" y="20" width="8" height="3" rx="1.5" fill="white" opacity="0.6" />
                  </svg>
                </div>

                {/* Thumb */}
                <motion.span
                  aria-hidden="true"
                  animate={{ x: theme === "dark" ? 3 : 39 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute flex h-[28px] w-[28px] items-center justify-center rounded-full shadow-sm"
                >
                    {/* Moon */}
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: theme === "dark" ? 1 : 0,
                        rotate: theme === "dark" ? 0 : -90,
                        scale: theme === "dark" ? 1 : 0.5
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-[#dcdcdc] overflow-hidden"
                    >
                        {/* Craters */}
                        <div className="absolute left-[4px] top-[6px] h-[6px] w-[6px] rounded-full bg-[#bebebe]" />
                        <div className="absolute left-[6px] bottom-[5px] h-[8px] w-[8px] rounded-full bg-[#bebebe]" />
                        <div className="absolute right-[8px] top-[12px] h-[5px] w-[5px] rounded-full bg-[#bebebe]" />
                    </motion.div>

                    {/* Sun */}
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: theme === "light" ? 1 : 0,
                        rotate: theme === "light" ? 0 : 90,
                        scale: theme === "light" ? 1 : 0.5
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-[#f8c844] border-[3px] border-[#d8a127]"
                    />
                </motion.span>
              </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group relative flex h-10 w-10 shrink-0 items-center justify-center text-muted-foreground transition-[transform,color] duration-200 hover:-translate-y-px hover:text-[#0176d3] focus-visible:outline-none data-[state=open]:text-[#0176d3] dark:hover:text-blue-400"
                  aria-label={unreadActivityCount > 0 ? `Activity updates, ${unreadActivityCount} unread` : "Activity updates"}
                >
                  <motion.span
                    whileHover={{ rotate: [0, -8, 7, -3, 0] }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="relative flex"
                  >
                    <BellRing className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </motion.span>
                  {unreadActivityCount > 0 && (
                    <motion.span
                      initial={{ scale: 0.65, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -right-1 -top-1 z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-background bg-[#0176d3] px-1 text-[9px] font-extrabold leading-none text-white shadow-[0_2px_8px_rgba(1,118,211,0.55)]"
                    >
                      {notificationBadge}
                    </motion.span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-[360px] overflow-hidden rounded-2xl border-border/50 bg-card/[0.92] p-0 shadow-[0_24px_70px_-24px_rgba(2,8,23,0.55)] backdrop-blur-2xl dark:bg-slate-950/[0.9]"
              >
                <div className="relative overflow-hidden border-b border-border/50 px-4 py-3.5">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_52%)]" />
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-[#0176d3] shadow-inner dark:bg-blue-400/10 dark:text-blue-300">
                        <BellRing className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold tracking-tight text-foreground">Activity updates</h3>
                        <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                          {unreadActivityCount > 0 ? `${unreadActivityCount} unread update${unreadActivityCount === 1 ? "" : "s"}` : "Everything is up to date"}
                        </p>
                      </div>
                    </div>
                    {unreadActivityCount > 0 ? (
                      <button
                        type="button"
                        onClick={markNotificationsAsRead}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-extrabold text-[#0176d3] transition-colors hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0176d3]/40 dark:text-blue-300"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Mark read
                      </button>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                        All caught up
                      </span>
                    )}
                  </div>
                </div>

                {activity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-9 text-center">
                    <EmptyActivityIllustration className="mb-3 text-emerald-500 dark:text-emerald-400 drop-shadow-sm" />
                    <p className="text-sm font-extrabold text-foreground">You&apos;re all caught up</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">New workspace activity will appear here.</p>
                  </div>
                ) : (
                  <div className="max-h-[342px] space-y-0.5 overflow-y-auto px-2 py-2 no-scrollbar">
                    {activity.slice(0, 6).map((item) => {
                      const meta = notificationMeta(item.type);
                      const Icon = meta.icon;
                      const isUnread = unreadActivityIds.has(item.id);
                      const detail = item.meta || item.module;

                      return (
                        <div
                          key={item.id}
                          className="group flex gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/70"
                        >
                          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-black/[0.03] dark:ring-white/[0.06]", meta.surface, meta.text)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex items-start gap-2">
                              <p className="min-w-0 flex-1 truncate text-[12px] font-bold leading-4 text-foreground">{item.label}</p>
                              {isUnread && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0176d3] shadow-[0_0_8px_rgba(1,118,211,0.7)]" />}
                            </div>
                            <div className="mt-1 flex min-w-0 items-center gap-2 text-[10px] font-medium text-muted-foreground">
                              {detail && <span className="truncate">{detail}</span>}
                              <span className="ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-muted-foreground/80">
                                <Clock className="h-3 w-3" />
                                {formatTime(item.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="border-t border-border/50 bg-muted/[0.28] p-2">
                  <button
                    type="button"
                    onClick={() => router.push("/analytics")}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold text-[#0176d3] transition-colors hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0176d3]/40 dark:text-blue-300"
                  >
                    View all activity
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Blue Star Logo */}
          <a 
            href="https://www.bluestarindia.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="h-8 md:h-10 w-24 md:w-32 border-l border-border/60 pl-2 md:pl-3 ml-1 md:ml-2 flex items-center shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Image
              src="/Blue%20Star%20Logo%20PNG.png"
              alt="Blue Star Logo"
              width={128}
              height={40}
              className="h-full w-full object-contain object-right"
              priority
            />
          </a>
        </div>
      </div>

      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
