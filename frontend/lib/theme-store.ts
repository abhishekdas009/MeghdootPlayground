import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccentColor = "blue" | "emerald" | "violet" | "amber" | "rose";

export type DarkBackgroundStyle = "aurora_curtains";
export type WallpaperStyle = DarkBackgroundStyle;

export interface DarkBackgroundOption {
  id: DarkBackgroundStyle;
  label: string;
  tagline: string;
  description: string;
  badge: string;
  colors: string[];
  lightColors: string[];
}

export type WallpaperOption = DarkBackgroundOption;

export const DARK_BACKGROUND_STYLES: DarkBackgroundOption[] = [
  {
    id: "aurora_curtains",
    label: "Aurora Borealis Curtains",
    tagline: "Polar atmospheric curtains & vertical ray folds",
    description: "Multi-layered harmonic ribbons and vertical folding plasma rays undulating across the polar sky",
    badge: "🌌 Aurora",
    colors: ["#38bdf8", "#818cf8", "#34d399"],
    lightColors: ["#0284c7", "#6366f1", "#059669"],
  },
];

export const BACKGROUND_STYLES = DARK_BACKGROUND_STYLES;

interface ThemeState {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  darkBgStyle: DarkBackgroundStyle;
  setDarkBgStyle: (style: DarkBackgroundStyle) => void;
  autoCycleEnabled: boolean;
  setAutoCycleEnabled: (enabled: boolean) => void;
  toggleAutoCycle: () => void;
  nextDarkBgStyle: () => void;
  prevDarkBgStyle: () => void;
}

export const ACCENT_COLORS: Record<AccentColor, { label: string; light: string; dark: string; hex: string }> = {
  blue: { label: "Blue", light: "1 118 211", dark: "74 137 255", hex: "#0176d3" },
  emerald: { label: "Emerald", light: "16 185 129", dark: "52 211 153", hex: "#10b981" },
  violet: { label: "Violet", light: "139 92 246", dark: "167 139 250", hex: "#8b5cf6" },
  amber: { label: "Amber", light: "245 158 11", dark: "251 191 36", hex: "#f59e0b" },
  rose: { label: "Rose", light: "244 63 94", dark: "251 113 133", hex: "#f43f5e" },
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      accentColor: "blue",
      setAccentColor: (color) => set({ accentColor: color }),
      darkBgStyle: "aurora_curtains",
      setDarkBgStyle: (style) => set({ darkBgStyle: style }),
      autoCycleEnabled: false,
      setAutoCycleEnabled: (enabled) => set({ autoCycleEnabled: enabled }),
      toggleAutoCycle: () => set((state) => ({ autoCycleEnabled: !state.autoCycleEnabled })),
      nextDarkBgStyle: () => {
        set({ darkBgStyle: "aurora_curtains" });
      },
      prevDarkBgStyle: () => {
        set({ darkBgStyle: "aurora_curtains" });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
