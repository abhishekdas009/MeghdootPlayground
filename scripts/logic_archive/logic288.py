code = """import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AccentColor = "blue" | "emerald" | "violet" | "amber" | "rose";

interface ThemeState {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

export const ACCENT_COLORS: Record<AccentColor, { label: string, light: string, dark: string, hex: string }> = {
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
    }),
    {
      name: 'theme-storage',
    }
  )
);
"""
with open("frontend/lib/theme-store.ts", "w", encoding="utf-8") as f:
    f.write(code)
print("Created theme-store.ts")
