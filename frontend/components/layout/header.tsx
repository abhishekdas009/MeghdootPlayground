"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, HelpCircle, Settings, User, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUIStore } from "@/store/ui-store";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function Header() {
  const router = useRouter();
  const { toggleSidebar, sidebarCollapsed } = useUIStore();
  const { theme, toggleTheme } = useTheme();
  const [searchFocused, setSearchFocused] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 h-14 w-full border-b border-border bg-card shadow-header">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-hover hover:text-foreground transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
              MP
            </div>
            <span className="text-base font-semibold text-foreground tracking-tight hidden md:block">
              {APP_NAME}
            </span>
          </div>
        </div>

        {/* Center - Global Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className={cn(
            "relative flex w-full items-center rounded-md border bg-muted transition-all",
            searchFocused ? "border-primary ring-2 ring-primary/20" : "border-border"
          )}>
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates, queries, history..."
              className="h-9 border-0 bg-transparent pl-9 pr-20 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <div className="absolute right-2 flex items-center gap-1 text-muted-foreground">
              <kbd className="hidden lg:inline-flex h-5 items-center rounded border border-border bg-card px-1.5 text-[10px] font-medium">
                <Command className="h-3 w-3 mr-0.5" />K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-card" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/settings")}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/help")}
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          <div className="ml-2 flex items-center gap-2 pl-2 border-l border-border">
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-border hover:ring-primary/30 transition-all">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                AD
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
