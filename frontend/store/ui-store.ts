import { create } from "zustand";

export type DockTool = "soql-runner" | "ticket-cleaner" | "warranty-lookup" | "manual-search";
export type DockWidth = "compact" | "wide" | "split";

interface UIState {
  sidebarCollapsed: boolean;
  sidebarHovered: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  setSidebarHovered: (value: boolean) => void;
  onSidebarHoverStart: () => void;
  onSidebarHoverEnd: () => void;
  onMenuButtonMouseLeave: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (value: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (value: boolean) => void;

  // Multi-Tasking Split Dock
  dockOpen: boolean;
  dockTool: DockTool;
  dockWidth: DockWidth;
  toggleDock: (tool?: DockTool) => void;
  setDockOpen: (open: boolean) => void;
  setDockTool: (tool: DockTool) => void;
  setDockWidth: (width: DockWidth) => void;

  // Keyboard Shortcuts Modal
  shortcutsModalOpen: boolean;
  setShortcutsModalOpen: (open: boolean) => void;

  // Wallpaper & Background Atmosphere
  wallpaperId: string;
  wallpaperOpacity: number;
  wallpaperSpeed: "normal" | "slow" | "paused";
  wallpaperModalOpen: boolean;
  setWallpaperId: (id: string) => void;
  setWallpaperOpacity: (opacity: number) => void;
  setWallpaperSpeed: (speed: "normal" | "slow" | "paused") => void;
  setWallpaperModalOpen: (open: boolean) => void;
}

let hoverCloseTimer: ReturnType<typeof setTimeout> | null = null;
let hoverSuppressedUntilLeave = false;

export const useUIStore = create<UIState>((set) => ({
  // Auto-minimized by default as requested
  sidebarCollapsed: true,
  sidebarHovered: false,

  // Click 3 lines (or collapse toggle): lock/pin open ("extract name") or minimize again
  toggleSidebar: () => {
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = null;
    }
    set((state) => {
      const nextCollapsed = !state.sidebarCollapsed;
      if (nextCollapsed) {
        hoverSuppressedUntilLeave = true;
      } else {
        hoverSuppressedUntilLeave = false;
      }
      return {
        sidebarCollapsed: nextCollapsed,
        sidebarHovered: false,
      };
    });
  },

  setSidebarCollapsed: (value) => {
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = null;
    }
    hoverSuppressedUntilLeave = value;
    set({ sidebarCollapsed: value, sidebarHovered: false });
  },

  setSidebarHovered: (value) => {
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = null;
    }
    set({ sidebarHovered: value });
  },

  onSidebarHoverStart: () => {
    if (hoverSuppressedUntilLeave) return;
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = null;
    }
    set({ sidebarHovered: true });
  },

  onSidebarHoverEnd: () => {
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
    }
    hoverCloseTimer = setTimeout(() => {
      set({ sidebarHovered: false });
      hoverCloseTimer = null;
    }, 200);
  },

  onMenuButtonMouseLeave: () => {
    hoverSuppressedUntilLeave = false;
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
    }
    hoverCloseTimer = setTimeout(() => {
      set({ sidebarHovered: false });
      hoverCloseTimer = null;
    }, 200);
  },

  mobileSidebarOpen: false,
  setMobileSidebarOpen: (value) => set({ mobileSidebarOpen: value }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (value) => set({ commandPaletteOpen: value }),

  // Multi-Tasking Split Dock
  dockOpen: false,
  dockTool: "soql-runner",
  dockWidth: "compact",
  toggleDock: (tool) => {
    set((state) => {
      if (tool && tool !== state.dockTool) {
        return { dockOpen: true, dockTool: tool };
      }
      return { dockOpen: !state.dockOpen, dockTool: tool || state.dockTool };
    });
  },
  setDockOpen: (open) => set({ dockOpen: open }),
  setDockTool: (tool) => set({ dockTool: tool, dockOpen: true }),
  setDockWidth: (width) => set({ dockWidth: width }),

  // Keyboard Shortcuts Modal
  shortcutsModalOpen: false,
  setShortcutsModalOpen: (open) => set({ shortcutsModalOpen: open }),

  // Wallpaper & Background Atmosphere
  wallpaperId:
    typeof window !== "undefined"
      ? window.localStorage.getItem("meghdoot_wallpaper_id") || "aurora"
      : "aurora",
  wallpaperOpacity:
    typeof window !== "undefined"
      ? parseFloat(window.localStorage.getItem("meghdoot_wallpaper_opacity") || "0.85")
      : 0.85,
  wallpaperSpeed:
    typeof window !== "undefined"
      ? ((window.localStorage.getItem("meghdoot_wallpaper_speed") as any) || "normal")
      : "normal",
  wallpaperModalOpen: false,

  setWallpaperId: (id: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("meghdoot_wallpaper_id", id);
    }
    set({ wallpaperId: id });
  },

  setWallpaperOpacity: (opacity: number) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("meghdoot_wallpaper_opacity", String(opacity));
    }
    set({ wallpaperOpacity: opacity });
  },

  setWallpaperSpeed: (speed) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("meghdoot_wallpaper_speed", speed);
    }
    set({ wallpaperSpeed: speed });
  },

  setWallpaperModalOpen: (open: boolean) => set({ wallpaperModalOpen: open }),
}));
