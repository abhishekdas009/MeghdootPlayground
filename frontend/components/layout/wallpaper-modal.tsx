"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  X,
  Sparkles,
  Check,
  Sliders,
  Play,
  Pause,
  Compass,
  Shuffle,
  Sun,
  Moon,
  Layers,
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { WALLPAPER_PRESETS, type WallpaperType } from "@/lib/wallpapers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function WallpaperModal() {
  const {
    wallpaperModalOpen,
    setWallpaperModalOpen,
    wallpaperId,
    setWallpaperId,
    wallpaperOpacity,
    setWallpaperOpacity,
    wallpaperSpeed,
    setWallpaperSpeed,
  } = useUIStore();

  const [activeTab, setActiveTab] = React.useState<"all" | WallpaperType>("all");
  const [isDark, setIsDark] = React.useState(true);

  React.useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();

    const obs = new MutationObserver(checkDark);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Close on Escape key
  React.useEffect(() => {
    if (!wallpaperModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setWallpaperModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wallpaperModalOpen, setWallpaperModalOpen]);

  const filteredPresets = React.useMemo(() => {
    if (activeTab === "all") return WALLPAPER_PRESETS;
    return WALLPAPER_PRESETS.filter((p) => p.type === activeTab);
  }, [activeTab]);

  const currentPreset = WALLPAPER_PRESETS.find((p) => p.id === wallpaperId) || WALLPAPER_PRESETS[0]!;

  const handleShuffle = () => {
    const others = WALLPAPER_PRESETS.filter((p) => p.id !== wallpaperId);
    const random = others[Math.floor(Math.random() * others.length)]!;
    setWallpaperId(random.id);
    toast.success(`Switched to "${random.name}" wallpaper!`);
  };

  if (!wallpaperModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setWallpaperModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200/80 dark:border-white/15 bg-white/95 dark:bg-[#080d19]/95 backdrop-blur-3xl shadow-2xl overflow-hidden"
          style={{
            boxShadow:
              "0 30px 80px -20px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* ── Modal Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                    Wallpaper &amp; Ambient Atmosphere
                  </h2>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Alt + B
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select GPU-accelerated animated canvases or designer static wallpapers complementing Light &amp; Dark modes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShuffle}
                className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Pick random wallpaper"
              >
                <Shuffle className="h-3.5 w-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Surprise Me</span>
              </button>

              <button
                type="button"
                onClick={() => setWallpaperModalOpen(false)}
                className="h-8 w-8 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Filter Tabs & Quick Mode State ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-50/30 dark:bg-black/20">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-white/[0.06] border border-slate-300/40 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                  activeTab === "all"
                    ? "bg-white dark:bg-[#131c2e] text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                All Wallpapers ({WALLPAPER_PRESETS.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("animated")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  activeTab === "animated"
                    ? "bg-white dark:bg-[#131c2e] text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                Animated Canvas (4)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("static")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  activeTab === "static"
                    ? "bg-white dark:bg-[#131c2e] text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                Static Designer (6)
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10">
                {isDark ? (
                  <>
                    <Moon className="h-3 w-3 text-cyan-400" /> Mode: Obsidian Dark
                  </>
                ) : (
                  <>
                    <Sun className="h-3 w-3 text-amber-500" /> Mode: Salesforce Light
                  </>
                )}
              </span>
            </div>
          </div>

          {/* ── Grid of Wallpaper Presets ── */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[58vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredPresets.map((preset) => {
                const isSelected = preset.id === wallpaperId;
                const gradientStyle = isDark ? preset.previewDark : preset.previewLight;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setWallpaperId(preset.id);
                      toast.success(`Wallpaper set to "${preset.name}"!`);
                    }}
                    className={cn(
                      "group text-left rounded-2xl p-3 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between h-[155px]",
                      isSelected
                        ? "border-[#0176D3] ring-2 ring-[#0176D3]/40 bg-blue-500/[0.04] dark:bg-blue-950/20 shadow-md shadow-blue-500/20 scale-[1.01]"
                        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/60 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] shadow-2xs hover:shadow-xs"
                    )}
                  >
                    {/* Background Preview Canvas Slice */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{ background: gradientStyle }}
                    />
                    {/* Soft dark vignette over the preview */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent rounded-2xl" />

                    {/* Card Top: Type badge & checkmark */}
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/15">
                        {preset.badge}
                      </span>

                      {isSelected && (
                        <div className="h-6 w-6 rounded-full bg-[#0176D3] text-white flex items-center justify-center shadow-md">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Card Bottom: Title & Description */}
                    <div className="relative z-10 text-white space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: preset.accentColor }}
                        />
                        <h3 className="font-black text-sm drop-shadow-sm leading-snug">
                          {preset.name}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-200/80 line-clamp-2 leading-relaxed drop-shadow-2xs">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Modal Footer Controls: Opacity & Motion ── */}
          <div className="border-t border-slate-200/80 dark:border-white/[0.08] px-6 py-4 bg-slate-50/80 dark:bg-[#060a14]/90 flex flex-wrap items-center justify-between gap-4">
            {/* Opacity slider */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Sliders className="h-3.5 w-3.5 text-blue-500" />
                <span>Atmosphere Opacity:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={wallpaperOpacity}
                  onChange={(e) => setWallpaperOpacity(parseFloat(e.target.value))}
                  className="w-28 sm:w-36 h-1.5 bg-slate-300 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#0176D3]"
                  title="Adjust wallpaper opacity"
                />
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 w-10">
                  {Math.round(wallpaperOpacity * 100)}%
                </span>
              </div>
            </div>

            {/* Motion / Speed control */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Motion Speed:
              </span>
              <div className="inline-flex p-0.5 rounded-lg bg-slate-200/80 dark:bg-white/[0.08] text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setWallpaperSpeed("normal")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all",
                    wallpaperSpeed === "normal"
                      ? "bg-white dark:bg-[#0c121e] text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Smooth 60fps
                </button>
                <button
                  type="button"
                  onClick={() => setWallpaperSpeed("slow")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all",
                    wallpaperSpeed === "slow"
                      ? "bg-white dark:bg-[#0c121e] text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Gentle
                </button>
                <button
                  type="button"
                  onClick={() => setWallpaperSpeed("paused")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all flex items-center gap-1",
                    wallpaperSpeed === "paused"
                      ? "bg-white dark:bg-[#0c121e] text-rose-600 dark:text-rose-400 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Pause className="h-3 w-3" /> Paused
                </button>
              </div>
            </div>

            {/* Done button */}
            <button
              type="button"
              onClick={() => setWallpaperModalOpen(false)}
              className="h-8.5 px-4 rounded-xl bg-[#0176D3] hover:bg-blue-600 text-white font-bold text-xs shadow-sm shadow-blue-500/25 active:scale-95 transition-all ml-auto"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
