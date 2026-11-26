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
  // ── Animated Options (Live GPU Canvases) ──
  {
    id: "aurora",
    name: "Aurora Borealis",
    type: "animated",
    description: "Ionized northern lights ribbons with shimmering polar stars and interactive cursor ripples.",
    badge: "Adaptive 120 FPS",
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
  {
    id: "matrix-rain",
    name: "Matrix Digital Cascade",
    type: "animated",
    description: "Cascading digital phosphor glyph rain with glowing streamers, quantum flicker, and cursor disruption.",
    badge: "Digital Cascade",
    accentColor: "#22c55e",
    previewDark: "linear-gradient(180deg, #15803d 0%, #052e16 45%, #020408 95%)",
    previewLight: "linear-gradient(180deg, #86efac 0%, #bbf7d0 45%, #f0fdf4 95%)",
  },
  {
    id: "neural-network",
    name: "Synaptic Neural Mesh",
    type: "animated",
    description: "Self-assembling cognitive particle nodes with glowing synaptic connections and cursor attraction.",
    badge: "Synaptic AI",
    accentColor: "#06b6d4",
    previewDark: "radial-gradient(circle at 50% 50%, #0e7490 0%, #164e63 45%, #020617 90%)",
    previewLight: "radial-gradient(circle at 50% 50%, #a5f3fc 0%, #cffafe 45%, #f0fdfa 90%)",
  },
  {
    id: "quantum-waves",
    name: "Quantum Harmonic Waves",
    type: "animated",
    description: "Harmonic undulating spectral wave ribbons with chromatic interference and translucent light crests.",
    badge: "Harmonic Waves",
    accentColor: "#a855f7",
    previewDark: "linear-gradient(135deg, #7e22ce 0%, #3b0764 45%, #030014 95%)",
    previewLight: "linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 45%, #faf5ff 95%)",
  },
  {
    id: "firefly-forest",
    name: "Bioluminescent Grove",
    type: "animated",
    description: "Enchanted twilight atmosphere with floating bioluminescent firefly orbs, breathing halos, and gentle drift.",
    badge: "Bioluminescent",
    accentColor: "#eab308",
    previewDark: "radial-gradient(ellipse at 50% 80%, #713f12 0%, #1e1b4b 40%, #03040b 90%)",
    previewLight: "radial-gradient(ellipse at 50% 80%, #fef08a 0%, #e0e7ff 45%, #f8fafc 90%)",
  },
  {
    id: "cosmic-vortex",
    name: "Gravitational Vortex",
    type: "animated",
    description: "Cosmic swirling photon vortex orbiting a gravitational singularity with starlight spiral arms.",
    badge: "Cosmic Vortex",
    accentColor: "#8b5cf6",
    previewDark: "radial-gradient(circle at 50% 50%, #6d28d9 0%, #2e1065 45%, #020308 90%)",
    previewLight: "radial-gradient(circle at 50% 50%, #ddd6fe 0%, #ede9fe 45%, #f8fafc 90%)",
  },
  {
    id: "cyber-hive",
    name: "Nanotech Hex Grid",
    type: "animated",
    description: "Pulsing hexagonal nanotech honeycomb lattice with traveling electric current waves and cursor glow.",
    badge: "Nanotech Grid",
    accentColor: "#00e5ff",
    previewDark: "linear-gradient(135deg, #0e7490 0%, #155e75 35%, #030a16 85%)",
    previewLight: "linear-gradient(135deg, #a5f3fc 0%, #cffafe 35%, #f0fdfa 85%)",
  },
  {
    id: "meteor-shower",
    name: "Celestial Meteor Shower",
    type: "animated",
    description: "Luminous shooting stars streaking across midnight space with radiant glowing trails and particle sparks.",
    badge: "Shooting Stars",
    accentColor: "#f43f5e",
    previewDark: "radial-gradient(ellipse at 80% 20%, #be123c 0%, #1e1b4b 50%, #020307 90%)",
    previewLight: "radial-gradient(ellipse at 80% 20%, #fecdd3 0%, #e0e7ff 50%, #f8fafc 90%)",
  },
  {
    id: "quantum-helix",
    name: "Quantum DNA Helix",
    type: "animated",
    description: "3D perspective revolving double-helix with glowing cyan & emerald nucleotide rungs and depth rotation.",
    badge: "Quantum Helix",
    accentColor: "#10b981",
    previewDark: "linear-gradient(160deg, #047857 0%, #0f172a 50%, #020408 95%)",
    previewLight: "linear-gradient(160deg, #a7f3d0 0%, #e2e8f0 50%, #f8fafc 95%)",
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
    previewDark: "radial-gradient(#10b981 1.2px, transparent 1.2px), #080c14",
    previewLight: "radial-gradient(#0284c7 1.2px, transparent 1.2px), #f8fafc",
  },
  {
    id: "emerald-matrix",
    name: "Emerald Cyber Prism",
    type: "static",
    description: "Deep emerald and jade glass architecture with faceted chromatic refractions and clean geometric angles.",
    badge: "Cyber Emerald",
    accentColor: "#10b981",
    previewDark: "linear-gradient(145deg, #065f46 0%, #022c22 45%, #01120e 100%)",
    previewLight: "linear-gradient(145deg, #d1fae5 0%, #a7f3d0 45%, #f0fdf4 100%)",
  },
  {
    id: "tokyo-neon",
    name: "Tokyo Synthwave Horizon",
    type: "static",
    description: "Electric cyberpunk dusk palette with vibrant magenta bloom, cyan lasers, and deep velvet lowlights.",
    badge: "Neon Synthwave",
    accentColor: "#f43f5e",
    previewDark: "linear-gradient(160deg, #be185d 0%, #581c87 40%, #090214 90%)",
    previewLight: "linear-gradient(160deg, #fbcfe8 0%, #e9d5ff 40%, #faf5ff 90%)",
  },
  {
    id: "glacial-ice",
    name: "Nordic Glacial Frost",
    type: "static",
    description: "Ultra-crisp crystalline polar ice sheet with arctic diamond sheen and cool titanium gradients.",
    badge: "Glacial Frost",
    accentColor: "#38bdf8",
    previewDark: "linear-gradient(135deg, #0369a1 0%, #0c2b4e 45%, #020a16 100%)",
    previewLight: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 45%, #f0f9ff 100%)",
  },
  {
    id: "volcanic-magma",
    name: "Volcanic Obsidian Ember",
    type: "static",
    description: "Dramatic molten ember fissure with deep charcoal basalt stone and glowing ruby lava lowlights.",
    badge: "Volcanic Ember",
    accentColor: "#f97316",
    previewDark: "radial-gradient(circle at 70% 30%, #c2410c 0%, #7f1d1d 35%, #0a0405 85%)",
    previewLight: "radial-gradient(circle at 70% 30%, #ffedd5 0%, #fee2e2 40%, #fef2f2 85%)",
  },
  {
    id: "deep-abyss",
    name: "Oceanic Mariana Abyss",
    type: "static",
    description: "Bioluminescent bathypelagic deep sea teal with drifting marine light rays and velvety dark depth.",
    badge: "Abyssal Ocean",
    accentColor: "#14b8a6",
    previewDark: "linear-gradient(175deg, #0f766e 0%, #042f2e 40%, #011012 95%)",
    previewLight: "linear-gradient(175deg, #ccfbf1 0%, #99f6e4 40%, #f0fdfa 95%)",
  },
  {
    id: "retro-vector",
    name: "Sunset Wireframe Horizon",
    type: "static",
    description: "Classic 80s isometric vector grid landscape with warm amber sunset gradient and precision gridlines.",
    badge: "Retro Wireframe",
    accentColor: "#eab308",
    previewDark: "linear-gradient(180deg, #b45309 0%, #451a03 30%, #09090b 80%)",
    previewLight: "linear-gradient(180deg, #fef3c7 0%, #fed7aa 35%, #fffbeb 85%)",
  },
];

const WATERMARK_PALETTES: Record<string, { dark: [string, string, string]; light: [string, string, string] }> = {
  aurora: {
    dark: ["rgba(209, 250, 229, 0.72)", "rgba(52, 211, 153, 0.54)", "rgba(56, 189, 248, 0.14)"],
    light: ["rgba(5, 150, 105, 0.58)", "rgba(2, 132, 199, 0.42)", "rgba(16, 185, 129, 0.08)"],
  },
  starfield: {
    dark: ["rgba(224, 231, 255, 0.72)", "rgba(129, 140, 248, 0.52)", "rgba(67, 56, 202, 0.14)"],
    light: ["rgba(67, 56, 202, 0.56)", "rgba(99, 102, 241, 0.38)", "rgba(129, 140, 248, 0.08)"],
  },
  "cyber-grid": {
    dark: ["rgba(224, 242, 254, 0.76)", "rgba(56, 189, 248, 0.54)", "rgba(2, 132, 199, 0.14)"],
    light: ["rgba(2, 132, 199, 0.60)", "rgba(3, 105, 161, 0.42)", "rgba(56, 189, 248, 0.08)"],
  },
  "fluid-plasma": {
    dark: ["rgba(251, 207, 232, 0.74)", "rgba(236, 72, 153, 0.54)", "rgba(139, 92, 246, 0.16)"],
    light: ["rgba(219, 39, 119, 0.56)", "rgba(124, 58, 237, 0.40)", "rgba(139, 92, 246, 0.08)"],
  },
  "matrix-rain": {
    dark: ["rgba(187, 247, 208, 0.72)", "rgba(34, 197, 94, 0.50)", "rgba(21, 128, 61, 0.14)"],
    light: ["rgba(21, 128, 61, 0.58)", "rgba(22, 163, 74, 0.38)", "rgba(74, 222, 128, 0.08)"],
  },
  "neural-network": {
    dark: ["rgba(207, 250, 254, 0.74)", "rgba(6, 182, 212, 0.52)", "rgba(14, 116, 144, 0.14)"],
    light: ["rgba(14, 116, 144, 0.58)", "rgba(8, 145, 178, 0.40)", "rgba(34, 211, 238, 0.08)"],
  },
  "quantum-waves": {
    dark: ["rgba(243, 232, 255, 0.74)", "rgba(168, 85, 247, 0.54)", "rgba(99, 102, 241, 0.14)"],
    light: ["rgba(126, 34, 206, 0.56)", "rgba(109, 40, 217, 0.38)", "rgba(168, 85, 247, 0.08)"],
  },
  "firefly-forest": {
    dark: ["rgba(254, 240, 138, 0.72)", "rgba(234, 179, 8, 0.48)", "rgba(99, 102, 241, 0.14)"],
    light: ["rgba(180, 83, 9, 0.56)", "rgba(79, 70, 229, 0.38)", "rgba(234, 179, 8, 0.08)"],
  },
  "cosmic-vortex": {
    dark: ["rgba(237, 233, 254, 0.74)", "rgba(139, 92, 246, 0.54)", "rgba(109, 40, 217, 0.14)"],
    light: ["rgba(109, 40, 217, 0.56)", "rgba(79, 70, 229, 0.38)", "rgba(139, 92, 246, 0.08)"],
  },
  "cyber-hive": {
    dark: ["rgba(207, 250, 254, 0.76)", "rgba(0, 229, 255, 0.50)", "rgba(14, 116, 144, 0.14)"],
    light: ["rgba(14, 116, 144, 0.58)", "rgba(2, 132, 199, 0.40)", "rgba(6, 182, 212, 0.08)"],
  },
  "meteor-shower": {
    dark: ["rgba(254, 205, 211, 0.74)", "rgba(244, 63, 94, 0.52)", "rgba(99, 102, 241, 0.16)"],
    light: ["rgba(190, 18, 60, 0.56)", "rgba(79, 70, 229, 0.38)", "rgba(244, 63, 94, 0.08)"],
  },
  "quantum-helix": {
    dark: ["rgba(167, 243, 208, 0.74)", "rgba(16, 185, 129, 0.52)", "rgba(56, 189, 248, 0.14)"],
    light: ["rgba(4, 120, 87, 0.58)", "rgba(2, 132, 199, 0.40)", "rgba(16, 185, 129, 0.08)"],
  },
  "bluestar-frost": {
    dark: ["rgba(219, 234, 254, 0.78)", "rgba(56, 189, 248, 0.54)", "rgba(1, 118, 211, 0.16)"],
    light: ["rgba(1, 118, 211, 0.60)", "rgba(29, 78, 216, 0.44)", "rgba(56, 189, 248, 0.08)"],
  },
  "midnight-nebula": {
    dark: ["rgba(224, 231, 255, 0.74)", "rgba(99, 102, 241, 0.52)", "rgba(55, 48, 163, 0.14)"],
    light: ["rgba(79, 70, 229, 0.56)", "rgba(55, 48, 163, 0.38)", "rgba(99, 102, 241, 0.08)"],
  },
  "sunset-twilight": {
    dark: ["rgba(254, 243, 199, 0.74)", "rgba(245, 158, 11, 0.52)", "rgba(194, 65, 12, 0.16)"],
    light: ["rgba(217, 119, 6, 0.56)", "rgba(194, 65, 12, 0.40)", "rgba(245, 158, 11, 0.08)"],
  },
  "salesforce-mesh": {
    dark: ["rgba(224, 242, 254, 0.78)", "rgba(2, 132, 199, 0.54)", "rgba(3, 105, 161, 0.14)"],
    light: ["rgba(2, 132, 199, 0.60)", "rgba(3, 105, 161, 0.42)", "rgba(56, 189, 248, 0.08)"],
  },
  "emerald-matrix": {
    dark: ["rgba(209, 250, 229, 0.74)", "rgba(16, 185, 129, 0.52)", "rgba(6, 95, 70, 0.16)"],
    light: ["rgba(6, 95, 70, 0.58)", "rgba(5, 150, 105, 0.40)", "rgba(52, 211, 153, 0.08)"],
  },
  "tokyo-neon": {
    dark: ["rgba(251, 207, 232, 0.76)", "rgba(244, 63, 94, 0.56)", "rgba(168, 85, 247, 0.20)"],
    light: ["rgba(190, 24, 93, 0.58)", "rgba(126, 34, 206, 0.42)", "rgba(236, 72, 153, 0.08)"],
  },
  "glacial-ice": {
    dark: ["rgba(224, 242, 254, 0.78)", "rgba(56, 189, 248, 0.52)", "rgba(3, 105, 161, 0.14)"],
    light: ["rgba(3, 105, 161, 0.58)", "rgba(2, 132, 199, 0.42)", "rgba(125, 211, 252, 0.08)"],
  },
  "volcanic-magma": {
    dark: ["rgba(255, 237, 213, 0.74)", "rgba(249, 115, 22, 0.54)", "rgba(220, 38, 38, 0.18)"],
    light: ["rgba(194, 65, 12, 0.58)", "rgba(153, 27, 27, 0.42)", "rgba(249, 115, 22, 0.08)"],
  },
  "deep-abyss": {
    dark: ["rgba(204, 251, 241, 0.74)", "rgba(20, 184, 166, 0.52)", "rgba(15, 118, 110, 0.16)"],
    light: ["rgba(15, 118, 110, 0.58)", "rgba(17, 94, 89, 0.42)", "rgba(45, 212, 191, 0.08)"],
  },
  "retro-vector": {
    dark: ["rgba(254, 243, 199, 0.74)", "rgba(234, 179, 8, 0.52)", "rgba(180, 83, 9, 0.16)"],
    light: ["rgba(180, 83, 9, 0.58)", "rgba(146, 64, 14, 0.42)", "rgba(234, 179, 8, 0.08)"],
  },
};

/**
 * Computes the adaptive gradient for INSIGHT TABLE watermark typography.
 * Matches active background wallpaper color stops; falls back to STEP 1's
 * monochrome scheme when background is complete dark or white (`minimal`,
 * `carbon-matrix`, or low wallpaper opacity).
 */
export function getInsightWatermarkGradient(
  wallpaperId: string,
  isDark: boolean,
  wallpaperOpacity = 1
): string {
  const palette = WATERMARK_PALETTES[wallpaperId];
  const isNeutralBackdrop =
    !palette || wallpaperId === "minimal" || wallpaperId === "carbon-matrix" || wallpaperOpacity <= 0.15;

  const cardSurfaceMid = isDark ? "rgba(10, 12, 18, 0.32)" : "rgba(248, 250, 252, 0.42)";
  const cardSurfaceEnd = isDark ? "rgba(10, 12, 18, 0.14)" : "rgba(241, 245, 249, 0.18)";

  if (isNeutralBackdrop) {
    return isDark
      ? `linear-gradient(180deg, rgba(255, 255, 255, 0.52) 0%, rgba(148, 163, 184, 0.22) 55%, ${cardSurfaceMid} 88%, ${cardSurfaceEnd} 100%)`
      : `linear-gradient(180deg, rgba(148, 163, 184, 0.52) 0%, rgba(203, 213, 225, 0.32) 55%, ${cardSurfaceMid} 88%, ${cardSurfaceEnd} 100%)`;
  }

  const [c1, c2, c3] = isDark ? palette.dark : palette.light;
  return `linear-gradient(166deg, ${c1} 0%, ${c2} 40%, ${c3} 70%, ${cardSurfaceMid} 90%, ${cardSurfaceEnd} 100%)`;
}
