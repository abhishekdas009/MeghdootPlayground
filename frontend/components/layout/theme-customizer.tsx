"use client";

import * as React from "react";
import { Palette, Check } from "lucide-react";
import { useThemeStore, ACCENT_COLORS } from "@/lib/theme-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeCustomizer() {
  const { accentColor, setAccentColor } = useThemeStore();

  React.useEffect(() => {
    const color = ACCENT_COLORS[accentColor];
    if (color) {
      document.documentElement.style.setProperty("--color-primary", color.light);
      document.documentElement.style.setProperty("--color-primary-foreground", "255 255 255");
      // To properly handle dark mode if they exist independently:
      // Note: globals.css redefines --color-primary in .dark block, so inline styles on :root will override both.
      // We need to inject dynamic CSS or let the inline style be the source of truth.
      // Wait, if globals.css uses .dark { --color-primary: 74 137 255; }
      // Setting style on documentElement (HTML) sets it as inline: <html style="--color-primary: ...">
      // Inline styles have highest specificity. So it will override BOTH light and dark mode rules!
      // This is actually what we want if we want the same accent color in both, OR we can set variables like:
      // document.documentElement.style.setProperty("--color-primary-light", color.light);
      // document.documentElement.style.setProperty("--color-primary-dark", color.dark);
      // Let's just set --color-primary directly depending on dark mode state? 
      // No, we can just use the hex or single variable, but since tailwind uses `rgb(var(--color-primary))`,
      // we must provide RGB values.
    }
  }, [accentColor]);

  // We actually need a better way to handle light/dark for the customizer so it looks right in both.
  // Instead of inline style, we can append a <style> tag to <head>.
  
  React.useEffect(() => {
    const color = ACCENT_COLORS[accentColor];
    if (!color) return;
    
    let styleEl = document.getElementById("theme-customizer-style");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "theme-customizer-style";
      document.head.appendChild(styleEl);
    }
    
    styleEl.innerHTML = `
      :root {
        --color-primary: ${color.light} !important;
        --color-primary-foreground: 255 255 255 !important;
      }
      .dark {
        --color-primary: ${color.dark} !important;
        --color-primary-foreground: 255 255 255 !important;
      }
      .sidebar-nav-link--active {
        color: ${color.hex} !important;
      }
    `;
  }, [accentColor]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="group relative flex h-10 w-10 shrink-0 items-center justify-center text-muted-foreground transition-[transform,color] duration-200 hover:-translate-y-px hover:text-primary focus-visible:outline-none data-[state=open]:text-primary dark:hover:text-primary"
          aria-label="Customize Theme"
          title="Customize Theme"
        >
          <Palette className="h-[18px] w-[18px]" strokeWidth={1.9} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-2xl border-border/50 bg-card/[0.92] backdrop-blur-2xl">
        <div className="px-3 py-2 text-xs font-bold text-muted-foreground">Accent Color</div>
        <DropdownMenuSeparator className="bg-border/50" />
        <div className="p-2 space-y-1">
          {Object.entries(ACCENT_COLORS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setAccentColor(key as any)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm font-semibold hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10" 
                  style={{ backgroundColor: value.hex }} 
                />
                <span className={accentColor === key ? "text-foreground" : "text-muted-foreground"}>
                  {value.label}
                </span>
              </div>
              {accentColor === key && <Check className="w-4 h-4 text-foreground" />}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
