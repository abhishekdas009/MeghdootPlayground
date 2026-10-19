import { create } from "zustand";

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
        // When clicking to minimize, prevent immediate hover re-open while mouse rests on the button
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

  // Hover over the 3-lines menu button or the sidebar opens the full names peek
  onSidebarHoverStart: () => {
    if (hoverSuppressedUntilLeave) return;
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = null;
    }
    set({ sidebarHovered: true });
  },

  // Mouse leaving sidebar: grace period before auto-minimizing
  onSidebarHoverEnd: () => {
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
    }
    hoverCloseTimer = setTimeout(() => {
      set({ sidebarHovered: false });
      hoverCloseTimer = null;
    }, 200);
  },

  // Mouse leaving the 3 lines button: resets suppression flag and initiates grace period
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
}));
