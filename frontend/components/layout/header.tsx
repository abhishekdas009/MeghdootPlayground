Your existing `Header` component is well-structured, but it has a few missed opportunities—specifically regarding the unused `useTheme` hook, the inactive `⌘K` keyboard shortcut, and an inconsistent raw SVG icon for the menu.

Here is an improved and refactored version.

### Key Improvements:

1. **Functional `⌘K` Shortcut:** Added a `useEffect` hook to listen for `Cmd+K` (Mac) or `Ctrl+K` (Windows) and automatically focus the search input.
2. **Theme Toggle Implementation:** You were importing `useTheme` but not utilizing it. I added a new icon button to toggle between Light and Dark mode using `Sun` and `Moon` icons.
3. **Consistent Icons:** Replaced the hardcoded raw SVG hamburger icon with the `Menu` icon from `lucide-react` to keep your icon library consistent.
4. **Mobile Search Fallback:** Added a mobile-only search icon button (`md:hidden`) to the right side, ensuring mobile users aren't left without a search trigger.
5. **Accessibility (A11y):** Added `title` and `aria-label` tags to the new buttons for screen-reader and hover-tooltip support.

### The Refactored Code

```tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Settings, 
  Command,
  Menu,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUIStore } from "@/store/ui-store";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function Header() {
  const router = useRouter();
  const { toggleSidebar } = useUIStore();
  const { theme, toggleTheme } = useTheme();
  
  const [searchFocused, setSearchFocused] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Enable the Cmd+K / Ctrl+K keyboard shortcut for global search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-14 w-full border-b border-border bg-card shadow-sm transition-colors duration-200">
      <div className="flex h-full items-center justify-between px-4">
        
        {/* Left Section: Menu & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div 
            className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80" 
            onClick={() => router.push("/")}
            role="button"
            tabIndex={0}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground shadow-sm">
              MP
            </div>
            <span className="hidden text-base font-semibold tracking-tight text-foreground md:block">
              {APP_NAME}
            </span>
          </div>
        </div>

        {/* Center Section: Global Search */}
        <div className="hidden flex-1 max-w-xl mx-6 md:flex">
          <div 
            className={cn(
              "relative flex w-full items-center rounded-md border bg-muted/50 transition-all duration-200",
              searchFocused ? "border-primary ring-2 ring-primary/20 bg-background" : "border-border hover:border-border/80"
            )}
          >
            <Search className={cn("absolute left-3 h-4 w-4 transition-colors", searchFocused ? "text-primary" : "text-muted-foreground")} />
            <Input
              ref={searchInputRef}
              placeholder="Search templates, queries, history..."
              className="h-9 border-0 bg-transparent pl-9 pr-14 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <div className="absolute right-2 flex items-center text-muted-foreground pointer-events-none">
              <kbd className="hidden h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-medium tracking-widest text-muted-foreground lg:inline-flex shadow-sm">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Mobile Search Trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
            aria-label="View notifications"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {/* Notification Badge Indicator */}
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/settings")}
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Help/Docs */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/help")}
            aria-label="Help and Documentation"
            title="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* User Profile */}
          <div className="ml-1 flex items-center pl-3 border-l border-border">
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary/50">
              <AvatarImage src="" alt="User Avatar" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                AD
              </AvatarFallback>
            </Avatar>
          </div>
          
        </div>
      </div>
    </header>
  );
}

```
