"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Command, Menu, Sun, Moon, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { GlobalSearchModal } from "@/components/layout/global-search-modal";

type ThemeMode = "light" | "dark";

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void | Promise<void>) => {
    finished: Promise<void>;
  };
};

const THEME_STORAGE_KEY = "meghdoot-theme-v2";

export function Header() {
  const router = useRouter();
  const { toggleSidebar, setMobileSidebarOpen } = useUIStore();

  const [searchFocused, setSearchFocused] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<ThemeMode>("dark");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme: ThemeMode = savedTheme === "light" ? "light" : "dark";

    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
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
    const transitionDocument = document as ViewTransitionDocument;

    if (!prefersReducedMotion && transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(() => applyTheme(nextTheme));
      return;
    }

    root.classList.add("theme-transition");
    applyTheme(nextTheme);
    window.setTimeout(() => root.classList.remove("theme-transition"), 480);
  };

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
        <div className="flex flex-1 md:flex-none items-center justify-end gap-2 shrink-0">
          {/* Mobile Search Trigger Button (Sleek pill so mobile has instant search too!) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex md:hidden items-center gap-2 px-3 py-1.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted/50 text-xs font-bold text-muted-foreground hover:text-foreground transition-all shadow-2xs"
          >
            <Search className="h-3.5 w-3.5 text-[#0176d3]" />
            <span>Search...</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/30 text-muted-foreground shadow-2xs transition-all hover:border-[#0176d3]/40 hover:bg-muted/60 hover:text-[#0176d3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0176d3]/50 overflow-hidden"
            aria-label={theme === "dark" ? "Enable light theme" : "Enable dark theme"}
            title={theme === "dark" ? "Enable light theme" : "Enable dark theme"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.div
                  key="dark"
                  initial={{ y: -20, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Sun className="h-4.5 w-4.5" />
                </motion.div>
              ) : (
                <motion.div
                  key="light"
                  initial={{ y: -20, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Moon className="h-4.5 w-4.5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <button
            type="button"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/30 text-muted-foreground shadow-2xs transition-all hover:border-[#58b7ff]/45 hover:bg-muted/60 hover:text-[#81c9ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58b7ff]/50"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#58b7ff] shadow-[0_0_8px_#58b7ff]" />
          </button>

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
