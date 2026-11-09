"use client";

import * as React from "react";
import { useUIStore } from "@/store/ui-store";
import {
  Keyboard,
  Command,
  X,
  Sparkles,
  Terminal,
  Zap,
  ArrowRight,
  Printer,
  Layers,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_120HZ } from "@/lib/motion";

interface ShortcutCategory {
  title: string;
  items: {
    keys: string[];
    description: string;
    actionLabel?: string;
  }[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: "Global Shell & Navigation",
    items: [
      {
        keys: ["Ctrl", "K"],
        description: "Open Raycast Spotlight Command Center",
        actionLabel: "Search & Route",
      },
      {
        keys: ["Alt", "D"],
        description: "Toggle Multi-Tasking Split-Screen Dock",
        actionLabel: "Side Dock",
      },
      {
        keys: ["Ctrl", "\\"],
        description: "Alternative shortcut to toggle Split Dock",
        actionLabel: "Side Dock",
      },
      {
        keys: ["Alt", "T"],
        description: "Cycle Salesforce Lightning vs Dark Mode",
        actionLabel: "Theme Sync",
      },
      {
        keys: ["Alt", "B"],
        description: "Open Wallpaper & Ambient Atmosphere Selector",
        actionLabel: "Wallpapers",
      },
      {
        keys: ["?"],
        description: "Open this Keyboard Shortcuts Cheat Sheet",
        actionLabel: "Help",
      },
      {
        keys: ["Esc"],
        description: "Close active modal, search palette, or dock",
        actionLabel: "Dismiss",
      },
    ],
  },
  {
    title: "Module Execution & Production Hotkeys",
    items: [
      {
        keys: ["Ctrl", "Enter"],
        description: "Execute / Generate primary action in active module",
        actionLabel: "Run / Process",
      },
      {
        keys: ["Ctrl", "S"],
        description: "Export / Download current Excel or SOQL file",
        actionLabel: "Save File",
      },
      {
        keys: ["Ctrl", "P"],
        description: "Print Executive PDF Summary Report",
        actionLabel: "Print / PDF",
      },
      {
        keys: ["Ctrl", "C"],
        description: "Copy selected table cells / high-res WhatsApp image",
        actionLabel: "Copy",
      },
    ],
  },
  {
    title: "Raycast Command Palette Quick Jumps",
    items: [
      {
        keys: ["/report"],
        description: "Jump directly to Daily Report Generator",
        actionLabel: "Open Report",
      },
      {
        keys: ["/soql"],
        description: "Jump to SOQL Query Generator",
        actionLabel: "Open SOQL",
      },
      {
        keys: ["/templates"],
        description: "Browse 37+ Salesforce SOQL Library templates",
        actionLabel: "Library",
      },
      {
        keys: ["/warranty"],
        description: "Search appliance models & compressor warranty",
        actionLabel: "Warranty",
      },
      {
        keys: ["/validate"],
        description: "Compare ticket subsets against master list",
        actionLabel: "Validate",
      },
      {
        keys: ["/manuals"],
        description: "Open User Manuals & Fault Code Jump Reader",
        actionLabel: "Manuals",
      },
    ],
  },
];

export function KeyboardShortcutsModal() {
  const { shortcutsModalOpen, setShortcutsModalOpen } = useUIStore();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShortcutsModalOpen(!shortcutsModalOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcutsModalOpen, setShortcutsModalOpen]);

  if (!shortcutsModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: EASE_120HZ }}
          className="w-full max-w-2xl bg-white dark:bg-[#080b12] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-xs">
                <Keyboard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Universal Hotkeys &amp; Ergonomics
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Power-user shortcuts designed for high-volume Salesforce operations.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShortcutsModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {SHORTCUT_CATEGORIES.map((category, idx) => (
              <div key={idx} className="space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                  {category.title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {category.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="p-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between gap-3 hover:border-blue-500/30 transition-all group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {item.description}
                        </p>
                        {item.actionLabel && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                            {item.actionLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-2 py-1 rounded-lg bg-white dark:bg-white/10 text-slate-800 dark:text-slate-200 font-mono text-[11px] font-black border border-slate-200 dark:border-white/15 shadow-2xs group-hover:border-blue-500/40"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px] font-bold">Esc</kbd> to dismiss this cheat sheet.
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShortcutsModalOpen(false)}
              className="h-8 px-4 text-xs font-bold rounded-xl"
            >
              Got it
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
