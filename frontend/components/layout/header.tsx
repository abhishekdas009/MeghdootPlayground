"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Command, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { GlobalSearchModal } from "@/components/layout/global-search-modal";

export function Header() {
  const router = useRouter();
  const { toggleSidebar, setMobileSidebarOpen } = useUIStore();

  const [searchFocused, setSearchFocused] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

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
    <header className="fixed top-0 left-0 right-0 z-50 h-14 w-full border-b border-border/40 bg-background/65 backdrop-blur-xl shadow-[0_1px_0_rgb(255_255_255_/_0.04)] transition-all duration-200" suppressHydrationWarning>
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
            className="flex items-center gap-2.5 cursor-pointer transition-opacity hover:opacity-80"
            onClick={() => router.push("/")}
            role="button"
            tabIndex={0}
          >
            <Image
              src="/logo1.png"
              alt="Meghdoot Logo"
              width={42}
              height={42}
              className="shrink-0 rounded-xl shadow-sm"
              priority
            />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-tight text-foreground">
                Meghdoot
              </span>
              <span className="hidden sm:inline text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground/90 uppercase">
                Playground
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right Section: ONLY Global Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto flex justify-end md:justify-center">
          {/* Desktop Search Bar */}
          <div
            onClick={() => setSearchOpen(true)}
            className={cn(
              "hidden md:flex relative w-full items-center rounded-xl border transition-all duration-200 cursor-pointer",
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

          {/* Mobile Search Trigger Button (Sleek pill so mobile has instant search too!) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex md:hidden items-center gap-2 px-3 py-1.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted/50 text-xs font-bold text-muted-foreground hover:text-foreground transition-all shadow-2xs"
          >
            <Search className="h-3.5 w-3.5 text-[#0176d3]" />
            <span>Search...</span>
          </button>
        </div>
      </div>

      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
