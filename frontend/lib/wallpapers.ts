export type WallpaperType = "animated" | "static";

export interface WallpaperPreset {
  id: string;
  name: string;
  type: WallpaperType;
  description: string;
  badge: string;
  accentColor: string;
  // Gradient preview for selector cards
  previewDark: string;
  previewLight: string;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  // ── Animated Options ──
  {
    id: "aurora",
    name: "Aurora Borealis",
    type: "animated",
    description: "Ionized northern lights ribbons with shimmering polar stars and interactive cursor ripples.",
    badge: "Interactive 60 FPS",
    accentColor: "#34d399",
    previewDark: "radial-gradient(ellipse at 50% 20%, #10b981 0%, #064e3b 40%, #030408 90%)",
    previewLight: "radial-gradient(ellipse at 50% 20%, #6ee7b7 0%, #a7f3d0 40%, #f0fdf4 90%)",
  },
  {
    id: "starfield",
    name: "Deep Space Cosmos",
    type: "animated",
    description: "Multi-depth twinkling star cluster with drifting cosmic dust and ethereal nebula glow.",
    badge: "Cosmic Particles",
    accentColor: "#818cf8",
    previewDark: "radial-gradient(ellipse at 50% 50%, #4338ca 0%, #1e1b4b 50%, #020307 90%)",
    previewLight: "radial-gradient(ellipse at 50% 50%, #c7d2fe 0%, #e0e7ff 50%, #f8fafc 90%)",
  },
  {
    id: "cyber-grid",
    name: "Cybernetic Blueprint",
    type: "animated",
    description: "Perspective tech grid with neon horizon pulses, floating data nodes, and scanline glow.",
    badge: "Enterprise Matrix",
    accentColor: "#0284c7",
    previewDark: "linear-gradient(180deg, #0284c7 0%, #082f49 40%, #030712 90%)",
    previewLight: "linear-gradient(180deg, #bae6fd 0%, #e0f2fe 40%, #f0f9ff 90%)",
  },
  {
    id: "fluid-plasma",
    name: "Ambient Plasma Flow",
    type: "animated",
    description: "Slow-shifting organic fluid color blobs blending lavender, cyan, and emerald radiance.",
    badge: "Organic Gradient",
    accentColor: "#ec4899",
    previewDark: "radial-gradient(circle at 30% 40%, #ec4899 0%, #8b5cf6 40%, #030712 85%)",
    previewLight: "radial-gradient(circle at 30% 40%, #fbcfe8 0%, #ddd6fe 40%, #faf5ff 85%)",
  },

  // ── Static Wallpaper Options (Complementing Light & Dark Mode) ──
  {
    id: "minimal",
    name: "Obsidian Slate (Default)",
    type: "static",
    description: "Ultra-clean minimalist studio background with subtle atmospheric vignetting.",
    badge: "Minimalist Focus",
    accentColor: "#64748b",
    previewDark: "radial-gradient(ellipse at 50% 30%, #1e293b 0%, #090d16 65%, #030408 100%)",
    previewLight: "radial-gradient(ellipse at 50% 30%, #f1f5f9 0%, #e2e8f0 70%, #cbd5e1 100%)",
  },
  {
    id: "bluestar-frost",
    name: "Blue Star Corporate Frost",
    type: "static",
    description: "Signature Blue Star cobalt & sapphire frosted architecture with micro-noise texture.",
    badge: "Blue Star Brand",
    accentColor: "#0176D3",
    previewDark: "linear-gradient(135deg, #0176D3 0%, #0c2340 50%, #040810 100%)",
    previewLight: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #eff6ff 100%)",
  },
  {
    id: "midnight-nebula",
    name: "Midnight Indigo Nebula",
    type: "static",
    description: "Deep cosmic midnight navy with royal indigo bloom and high-contrast star dust.",
    badge: "Deep Contrast",
    accentColor: "#6366f1",
    previewDark: "radial-gradient(circle at 80% 20%, #4f46e5 0%, #1e1b4b 45%, #05060b 85%)",
    previewLight: "radial-gradient(circle at 80% 20%, #c7d2fe 0%, #e0e7ff 50%, #f5f3ff 85%)",
  },
  {
    id: "sunset-twilight",
    name: "Sunset Horizon",
    type: "static",
    description: "Warm dusk slate with subtle amber twilight glow and soothing violet lowlights.",
    badge: "Warm Twilight",
    accentColor: "#f59e0b",
    previewDark: "linear-gradient(160deg, #d97706 0%, #7c2d12 35%, #0f172a 80%)",
    previewLight: "linear-gradient(160deg, #fef3c7 0%, #ffedd5 40%, #f8fafc 80%)",
  },
  {
    id: "salesforce-mesh",
    name: "Salesforce Lightning Mesh",
    type: "static",
    description: "Sophisticated enterprise polygon vector grid with crisp geometric light rays.",
    badge: "Lightning UI",
    accentColor: "#0284c7",
    previewDark: "linear-gradient(120deg, #0284c7 0%, #0369a1 30%, #082f49 70%, #020617 100%)",
    previewLight: "linear-gradient(120deg, #e0f2fe 0%, #bae6fd 40%, #f0fdfa 80%, #ffffff 100%)",
  },
  {
    id: "carbon-matrix",
    name: "Carbon Dot Matrix",
    type: "static",
    description: "Precision micro-stippled dot grid on deep slate for engineering and data focus.",
    badge: "Tech Texture",
    accentColor: "#10b981",
    previewDark: "radial-gradient(#10b981 1px, transparent 1px), #080c14",
    previewLight: "radial-gradient(#0284c7 1px, transparent 1px), #f8fafc",
  },
];
