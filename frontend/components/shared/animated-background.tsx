"use client";

import * as React from "react";
import { useUIStore } from "@/store/ui-store";
import { useRefreshRate } from "@/lib/refresh-rate";
import { WALLPAPER_PRESETS } from "@/lib/wallpapers";
import { cn } from "@/lib/utils";

interface AuroraRay {
  xOffset: number;
  heightMult: number;
  phase: number;
  speed: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
}

interface PlasmaMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface Ripple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
  color: string;
}

interface MatrixColumn {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;
}

interface NeuralNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulsePhase: number;
  pulseSpeed: number;
  color: string;
}

interface QuantumWave {
  baseYRatio: number;
  amp: number;
  freq: number;
  speed: number;
  colorStart: string;
  colorEnd: string;
  alpha: number;
  harmonicPhase: number;
}

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulseSpeed: number;
  pulsePhase: number;
  hue: number;
  wanderAngle: number;
}

interface VortexParticle {
  r: number;
  theta: number;
  speed: number;
  size: number;
  alpha: number;
  color: string;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  speed: number;
  size: number;
  color: string;
  active: boolean;
  delay: number;
}

const ANIMATED_WALLPAPER_IDS = [
  "aurora",
  "starfield",
  "cyber-grid",
  "fluid-plasma",
  "matrix-rain",
  "neural-network",
  "quantum-waves",
  "firefly-forest",
  "cosmic-vortex",
  "cyber-hive",
  "meteor-shower",
  "quantum-helix",
];

export function AnimatedBackground() {
  const [mounted, setMounted] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDark, setIsDark] = React.useState(true);
  const { wallpaperId, wallpaperOpacity, wallpaperSpeed } = useUIStore();
  const { fps, isHighRefresh } = useRefreshRate();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize with document dark class
  React.useEffect(() => {
    const updateThemeState = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateThemeState();

    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const mouseRef = React.useRef<{
    x: number;
    y: number;
    px: number;
    py: number;
    vx: number;
    vy: number;
    down: boolean;
    radius: number;
  }>({
    x: -1000,
    y: -1000,
    px: -1000,
    py: -1000,
    vx: 0,
    vy: 0,
    down: false,
    radius: 220,
  });

  const ripplesRef = React.useRef<Ripple[]>([]);

  React.useEffect(() => {
    if (!mounted) return;
    const isAnimated = ANIMATED_WALLPAPER_IDS.includes(wallpaperId);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!isAnimated) {
      // Clear canvas when on static wallpaper
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let time = 0;

    const speedMultiplier =
      wallpaperSpeed === "paused"
        ? 0
        : wallpaperSpeed === "slow"
        ? 0.35
        : wallpaperSpeed === "ultra"
        ? 1.45
        : wallpaperSpeed === "adaptive"
        ? isHighRefresh ? 1.25 : 1.0
        : 1.0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const m = mouseRef.current;
      m.vx = e.clientX - (m.px === -1000 ? e.clientX : m.px);
      m.vy = e.clientY - (m.py === -1000 ? e.clientY : m.py);
      m.px = m.x;
      m.py = m.y;
      m.x = e.clientX;
      m.y = e.clientY;

      const speed = Math.hypot(m.vx, m.vy);
      if (speed > 16 && Math.random() < 0.25) {
        ripplesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          r: 8,
          maxR: 90 + speed * 2,
          alpha: isDark ? 0.45 : 0.28,
          color: isDark ? "#38bdf8" : "#0284c7",
        });
        if (ripplesRef.current.length > 18) ripplesRef.current.shift();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.down = true;
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        r: 10,
        maxR: 280,
        alpha: isDark ? 0.75 : 0.45,
        color: isDark ? "#34d399" : "#0284c7",
      });
      if (ripplesRef.current.length > 18) ripplesRef.current.shift();
    };

    const handleMouseUp = () => {
      mouseRef.current.down = false;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseRef.current.px = -1000;
      mouseRef.current.py = -1000;
      mouseRef.current.vx = 0;
      mouseRef.current.vy = 0;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseleave", handleMouseLeave);

    // ── Asset Allocations ──
    const starCount = wallpaperId === "starfield" ? 170 : wallpaperId === "meteor-shower" ? 130 : 65;
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.4,
        baseAlpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 2.0 + 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const moteCount = 38;
    const motes: PlasmaMote[] = [];
    const moteColorsDark = ["#34d399", "#38bdf8", "#818cf8", "#a78bfa", "#6ee7b7"];
    const moteColorsLight = ["#059669", "#0284c7", "#6366f1", "#7c3aed", "#10b981"];

    for (let i = 0; i < moteCount; i++) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.5 + 0.2,
        color: moteColorsDark[i % moteColorsDark.length]!,
      });
    }

    const curtainRays: AuroraRay[] = [];
    for (let i = 0; i < 90; i++) {
      curtainRays.push({
        xOffset: i / 90,
        heightMult: 0.6 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        speed: 1.2 + Math.random() * 1.4,
      });
    }

    // Matrix Rain Allocations (Immediately distributed across screen height)
    const matrixFontSize = 14;
    const matrixColCount = Math.floor(width / matrixFontSize);
    const matrixCols: MatrixColumn[] = [];
    const MATRIX_CHARS = "0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜXYZ+-*/=%$#@&";
    for (let i = 0; i < matrixColCount; i++) {
      const len = Math.floor(Math.random() * 22) + 12;
      const chars: string[] = [];
      for (let j = 0; j < len; j++) {
        chars.push(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]!);
      }
      matrixCols.push({
        x: i * matrixFontSize,
        // Start across the screen so it is instantly populated on frame 1
        y: Math.random() * height,
        speed: Math.random() * 2.5 + 2.0,
        chars,
        length: len,
      });
    }

    // Neural Network Allocations (Increased density for rich connections)
    const neuralNodeCount = Math.min(85, Math.floor((width * height) / 14000));
    const neuralNodes: NeuralNode[] = [];
    const neuralColorsDark = ["#38bdf8", "#818cf8", "#34d399", "#a78bfa", "#22d3ee"];
    const neuralColorsLight = ["#0284c7", "#4f46e5", "#059669", "#7c3aed", "#0891b2"];
    for (let i = 0; i < neuralNodeCount; i++) {
      neuralNodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        r: Math.random() * 2.5 + 1.4,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 1.6 + 0.8,
        color: isDark ? neuralColorsDark[i % neuralColorsDark.length]! : neuralColorsLight[i % neuralColorsLight.length]!,
      });
    }

    // Quantum Waves Allocations
    const quantumWaveLayers: QuantumWave[] = [
      {
        baseYRatio: 0.35,
        amp: 60,
        freq: 0.002,
        speed: 0.8,
        colorStart: isDark ? "rgba(168, 85, 247, " : "rgba(147, 51, 234, ",
        colorEnd: isDark ? "rgba(99, 102, 241, " : "rgba(79, 70, 229, ",
        alpha: isDark ? 0.35 : 0.22,
        harmonicPhase: 0,
      },
      {
        baseYRatio: 0.5,
        amp: 85,
        freq: 0.0028,
        speed: 1.2,
        colorStart: isDark ? "rgba(56, 189, 248, " : "rgba(2, 132, 199, ",
        colorEnd: isDark ? "rgba(14, 165, 233, " : "rgba(3, 105, 161, ",
        alpha: isDark ? 0.4 : 0.26,
        harmonicPhase: Math.PI / 3,
      },
      {
        baseYRatio: 0.65,
        amp: 70,
        freq: 0.0024,
        speed: 0.95,
        colorStart: isDark ? "rgba(236, 72, 153, " : "rgba(219, 39, 119, ",
        colorEnd: isDark ? "rgba(139, 92, 246, " : "rgba(124, 58, 237, ",
        alpha: isDark ? 0.32 : 0.2,
        harmonicPhase: Math.PI / 1.5,
      },
      {
        baseYRatio: 0.78,
        amp: 55,
        freq: 0.0018,
        speed: 0.7,
        colorStart: isDark ? "rgba(20, 184, 166, " : "rgba(13, 148, 136, ",
        colorEnd: isDark ? "rgba(6, 182, 212, " : "rgba(8, 145, 178, ",
        alpha: isDark ? 0.28 : 0.18,
        harmonicPhase: Math.PI,
      },
    ];

    // Fireflies Allocations
    const fireflyCount = 48;
    const fireflies: Firefly[] = [];
    const fireflyHues = [45, 52, 58, 148, 162];
    for (let i = 0; i < fireflyCount; i++) {
      fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.2 + 1.2,
        pulseSpeed: Math.random() * 2.0 + 1.0,
        pulsePhase: Math.random() * Math.PI * 2,
        hue: fireflyHues[i % fireflyHues.length]!,
        wanderAngle: Math.random() * Math.PI * 2,
      });
    }

    // Cosmic Gravity Vortex Allocations
    const vortexParticleCount = 130;
    const vortexParticles: VortexParticle[] = [];
    const vortexColorsDark = ["#c084fc", "#a855f7", "#38bdf8", "#818cf8", "#e0e7ff"];
    const vortexColorsLight = ["#7c3aed", "#9333ea", "#0284c7", "#4f46e5", "#1e1b4b"];
    const maxVortexR = Math.hypot(width, height) * 0.65;
    for (let i = 0; i < vortexParticleCount; i++) {
      vortexParticles.push({
        r: Math.random() * maxVortexR + 30,
        theta: Math.random() * Math.PI * 2,
        speed: Math.random() * 1.8 + 0.8,
        size: Math.random() * 2.4 + 1.0,
        alpha: Math.random() * 0.6 + 0.3,
        color: isDark ? vortexColorsDark[i % vortexColorsDark.length]! : vortexColorsLight[i % vortexColorsLight.length]!,
      });
    }

    // Celestial Meteor Shower Allocations
    const meteorCount = 16;
    const meteors: Meteor[] = [];
    const meteorColorsDark = ["#38bdf8", "#f43f5e", "#facc15", "#a855f7", "#34d399"];
    const meteorColorsLight = ["#0284c7", "#e11d48", "#d97706", "#7c3aed", "#059669"];
    for (let i = 0; i < meteorCount; i++) {
      meteors.push({
        x: Math.random() * (width + 300) - 100,
        y: Math.random() * -height * 0.5,
        vx: 8 + Math.random() * 5,
        vy: 10 + Math.random() * 6,
        length: 100 + Math.random() * 140,
        speed: 12 + Math.random() * 8,
        size: Math.random() * 2.2 + 1.2,
        color: isDark ? meteorColorsDark[i % meteorColorsDark.length]! : meteorColorsLight[i % meteorColorsLight.length]!,
        active: true,
        delay: Math.random() * 180,
      });
    }

    // ── 1. AURORA BOREALIS ──
    const renderAurora = () => {
      if (isDark) {
        ctx.fillStyle = "#030408";
        ctx.fillRect(0, 0, width, height);

        const ambientGrad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.35,
          100,
          width * 0.5,
          height * 0.35,
          Math.max(width, height) * 0.85
        );
        ambientGrad.addColorStop(0, "rgba(6, 30, 48, 0.45)");
        ambientGrad.addColorStop(0.5, "rgba(8, 16, 32, 0.25)");
        ambientGrad.addColorStop(1, "rgba(3, 4, 8, 0.95)");
        ctx.fillStyle = ambientGrad;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, width, height);

        const lightGrad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.3,
          100,
          width * 0.5,
          height * 0.3,
          Math.max(width, height) * 0.9
        );
        lightGrad.addColorStop(0, "rgba(238, 246, 255, 0.65)");
        lightGrad.addColorStop(0.6, "rgba(241, 245, 249, 0.45)");
        lightGrad.addColorStop(1, "rgba(248, 250, 252, 0.85)");
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, width, height);
      }

      if (isDark) {
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i]!;
          const twinkle = Math.sin(time * s.twinkleSpeed + s.phase) * 0.4 + 0.6;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 242, 254, ${s.baseAlpha * twinkle})`;
          ctx.fill();
        }
      }

      const m = mouseRef.current;
      const layers = [
        {
          baseYRatio: 0.28,
          amp: 68,
          freq: 0.0022,
          speed: 0.8,
          alpha: isDark ? 0.28 : 0.16,
          colStart: isDark ? "rgba(167, 139, 250, " : "rgba(124, 58, 237, ",
          colEnd: isDark ? "rgba(129, 140, 248, " : "rgba(99, 102, 241, ",
          rayCol: isDark ? "#c084fc" : "#7c3aed",
          rayHeight: 95,
        },
        {
          baseYRatio: 0.44,
          amp: 90,
          freq: 0.0028,
          speed: 1.05,
          alpha: isDark ? 0.35 : 0.22,
          colStart: isDark ? "rgba(52, 211, 153, " : "rgba(5, 150, 105, ",
          colEnd: isDark ? "rgba(16, 185, 129, " : "rgba(16, 185, 129, ",
          rayCol: isDark ? "#34d399" : "#059669",
          rayHeight: 120,
        },
        {
          baseYRatio: 0.58,
          amp: 74,
          freq: 0.0034,
          speed: 1.25,
          alpha: isDark ? 0.32 : 0.2,
          colStart: isDark ? "rgba(56, 189, 248, " : "rgba(2, 132, 199, ",
          colEnd: isDark ? "rgba(6, 182, 212, " : "rgba(14, 165, 233, ",
          rayCol: isDark ? "#38bdf8" : "#0284c7",
          rayHeight: 85,
        },
        {
          baseYRatio: 0.7,
          amp: 55,
          freq: 0.0025,
          speed: 0.7,
          alpha: isDark ? 0.22 : 0.14,
          colStart: isDark ? "rgba(244, 114, 182, " : "rgba(219, 39, 119, ",
          colEnd: isDark ? "rgba(129, 140, 248, " : "rgba(99, 102, 241, ",
          rayCol: isDark ? "#f472b6" : "#db2777",
          rayHeight: 65,
        },
      ];

      layers.forEach((layer, layerIdx) => {
        const points: Array<{ x: number; y: number }> = [];
        ctx.beginPath();
        ctx.moveTo(0, height);

        const stepX = 14;
        for (let x = 0; x <= width + stepX; x += stepX) {
          let mouseDisplace = 0;
          if (m.x !== -1000) {
            const dx = Math.abs(x - m.x);
            if (dx < m.radius) {
              const falloff = Math.cos((dx / m.radius) * (Math.PI / 2));
              mouseDisplace = falloff * (m.y - height * layer.baseYRatio) * 0.32;
            }
          }

          const wave1 = Math.sin(x * layer.freq + time * layer.speed + layerIdx * 1.5) * layer.amp;
          const wave2 = Math.cos(x * layer.freq * 1.7 - time * 0.8 + layerIdx) * (layer.amp * 0.35);
          const wave3 = Math.sin(x * layer.freq * 0.5 + time * 0.4) * (layer.amp * 0.2);

          const y = height * layer.baseYRatio + wave1 + wave2 + wave3 + mouseDisplace;
          points.push({ x, y });
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const curtainGrad = ctx.createLinearGradient(
          0,
          height * layer.baseYRatio - layer.amp,
          0,
          height
        );
        curtainGrad.addColorStop(0, `${layer.colStart}${layer.alpha})`);
        curtainGrad.addColorStop(0.45, `${layer.colEnd}${layer.alpha * 0.75})`);
        curtainGrad.addColorStop(0.85, `${layer.colEnd}${layer.alpha * 0.2})`);
        curtainGrad.addColorStop(1, `${layer.colEnd}0)`);

        ctx.fillStyle = curtainGrad;
        ctx.fill();

        const rayStride = 3;
        for (let i = 0; i < points.length; i += rayStride) {
          const pt = points[i]!;
          const rayIndex = (i + layerIdx * 17) % curtainRays.length;
          const rayData = curtainRays[rayIndex]!;
          const shimmer = Math.sin(time * rayData.speed + rayData.phase) * 0.35 + 0.65;
          const currentRayH = layer.rayHeight * rayData.heightMult * shimmer;

          const rayGrad = ctx.createLinearGradient(pt.x, pt.y - currentRayH, pt.x, pt.y + 10);
          rayGrad.addColorStop(0, "transparent");
          rayGrad.addColorStop(0.45, layer.rayCol);
          rayGrad.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y - currentRayH);
          ctx.lineTo(pt.x, pt.y + 15);
          ctx.strokeStyle = rayGrad;
          ctx.lineWidth = isDark ? 2.2 : 1.8;
          ctx.globalAlpha = (isDark ? 0.32 : 0.16) * shimmer;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      });

      for (let i = 0; i < motes.length; i++) {
        const mote = motes[i]!;
        mote.x += mote.vx * speedMultiplier;
        mote.y += mote.vy * speedMultiplier;

        if (mote.x < 0) mote.x = width;
        if (mote.x > width) mote.x = 0;
        if (mote.y < 0) mote.y = height;
        if (mote.y > height) mote.y = 0;

        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
        const palette = isDark ? moteColorsDark : moteColorsLight;
        ctx.fillStyle = palette[i % palette.length]!;
        ctx.globalAlpha = isDark ? mote.alpha : mote.alpha * 0.7;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    };

    // ── 2. DEEP SPACE COSMOS ──
    const renderStarfield = () => {
      ctx.fillStyle = isDark ? "#020308" : "#f1f5f9";
      ctx.fillRect(0, 0, width, height);

      const nebulae = [
        { x: width * 0.25, y: height * 0.3, r: width * 0.4, color: isDark ? "rgba(99, 102, 241, 0.18)" : "rgba(199, 210, 254, 0.4)" },
        { x: width * 0.75, y: height * 0.65, r: width * 0.45, color: isDark ? "rgba(168, 85, 247, 0.14)" : "rgba(233, 213, 255, 0.35)" },
        { x: width * 0.5, y: height * 0.85, r: width * 0.35, color: isDark ? "rgba(14, 165, 233, 0.15)" : "rgba(186, 230, 253, 0.35)" },
      ];

      nebulae.forEach((neb) => {
        const rad = ctx.createRadialGradient(neb.x, neb.y, 10, neb.x, neb.y, neb.r);
        rad.addColorStop(0, neb.color);
        rad.addColorStop(1, "transparent");
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, width, height);
      });

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]!;
        s.y += 0.15 * speedMultiplier;
        if (s.y > height) s.y = 0;

        const twinkle = Math.sin(time * s.twinkleSpeed + s.phase) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(240, 249, 255, ${s.baseAlpha * twinkle})`
          : `rgba(30, 58, 138, ${s.baseAlpha * twinkle * 0.6})`;
        ctx.fill();
      }
    };

    // ── 3. CYBERNETIC BLUEPRINT ──
    const renderCyberGrid = () => {
      ctx.fillStyle = isDark ? "#030712" : "#f8fafc";
      ctx.fillRect(0, 0, width, height);

      const horizonY = height * 0.48;
      const gridSize = 50;

      ctx.strokeStyle = isDark ? "rgba(2, 132, 199, 0.22)" : "rgba(2, 132, 199, 0.18)";
      ctx.lineWidth = 1;

      const numLines = Math.floor(width / gridSize) + 8;
      for (let i = -4; i <= numLines; i++) {
        const xBottom = i * gridSize;
        const xTop = width * 0.5 + (xBottom - width * 0.5) * 0.2;
        ctx.beginPath();
        ctx.moveTo(xTop, horizonY);
        ctx.lineTo(xBottom, height);
        ctx.stroke();
      }

      const speedOffset = (time * 40 * speedMultiplier) % gridSize;
      for (let y = horizonY; y < height; y += (y - horizonY) * 0.18 + 8) {
        const currentY = y + speedOffset * ((y - horizonY) / (height - horizonY));
        if (currentY <= height) {
          ctx.beginPath();
          ctx.moveTo(0, currentY);
          ctx.lineTo(width, currentY);
          ctx.stroke();
        }
      }

      const horizonGrad = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 80);
      horizonGrad.addColorStop(0, "transparent");
      horizonGrad.addColorStop(0.5, isDark ? "rgba(56, 189, 248, 0.35)" : "rgba(2, 132, 199, 0.25)");
      horizonGrad.addColorStop(1, "transparent");
      ctx.fillStyle = horizonGrad;
      ctx.fillRect(0, horizonY - 40, width, 120);
    };

    // ── 4. AMBIENT PLASMA FLOW ──
    const renderFluidPlasma = () => {
      ctx.fillStyle = isDark ? "#05070f" : "#f8fafc";
      ctx.fillRect(0, 0, width, height);

      const orbs = [
        {
          x: width * 0.3 + Math.sin(time * 0.8) * 120,
          y: height * 0.4 + Math.cos(time * 0.7) * 80,
          r: width * 0.45,
          color: isDark ? "rgba(236, 72, 153, 0.22)" : "rgba(244, 114, 182, 0.35)",
        },
        {
          x: width * 0.7 + Math.cos(time * 0.6) * 100,
          y: height * 0.6 + Math.sin(time * 0.8) * 90,
          r: width * 0.42,
          color: isDark ? "rgba(139, 92, 246, 0.24)" : "rgba(196, 181, 253, 0.4)",
        },
        {
          x: width * 0.5 + Math.sin(time * 0.5) * 140,
          y: height * 0.3 + Math.cos(time * 0.6) * 100,
          r: width * 0.38,
          color: isDark ? "rgba(14, 165, 233, 0.2)" : "rgba(186, 230, 253, 0.4)",
        },
      ];

      orbs.forEach((orb) => {
        const rad = ctx.createRadialGradient(orb.x, orb.y, 20, orb.x, orb.y, orb.r);
        rad.addColorStop(0, orb.color);
        rad.addColorStop(1, "transparent");
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, width, height);
      });
    };

    // ── 5. MATRIX DIGITAL CASCADE (Guaranteed Instant Population) ──
    const renderMatrixRain = () => {
      ctx.fillStyle = isDark ? "rgba(2, 4, 8, 0.28)" : "rgba(240, 253, 244, 0.28)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `bold ${matrixFontSize - 1}px monospace`;
      const m = mouseRef.current;

      matrixCols.forEach((col) => {
        col.y += col.speed * speedMultiplier * 1.5;

        // Reset if off bottom
        if (col.y - col.length * matrixFontSize > height) {
          col.y = -Math.random() * 60;
          col.speed = Math.random() * 2.5 + 2.0;
        }

        // Randomly mutate characters
        if (Math.random() < 0.08) {
          const randIdx = Math.floor(Math.random() * col.chars.length);
          col.chars[randIdx] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]!;
        }

        // Mouse displacement
        let xDisplace = 0;
        if (m.x !== -1000) {
          const dist = Math.hypot(col.x - m.x, col.y - m.y);
          if (dist < 120) {
            xDisplace = ((col.x - m.x) / 120) * 15;
          }
        }

        for (let j = 0; j < col.chars.length; j++) {
          const charY = col.y - j * matrixFontSize;
          if (charY < 0 || charY > height + 20) continue;

          const ch = col.chars[j]!;
          if (j === 0) {
            // Head character: bright glowing white/emerald
            ctx.fillStyle = isDark ? "#ffffff" : "#047857";
            ctx.shadowColor = isDark ? "#34d399" : "#10b981";
            ctx.shadowBlur = isDark ? 10 : 4;
          } else {
            const fade = 1 - j / col.chars.length;
            ctx.shadowBlur = 0;
            ctx.fillStyle = isDark
              ? `rgba(34, 197, 94, ${fade * 0.92})`
              : `rgba(5, 150, 105, ${fade * 0.88})`;
          }

          ctx.fillText(ch, col.x + xDisplace, charY);
        }
        ctx.shadowBlur = 0;
      });
    };

    // ── 6. SYNAPTIC NEURAL MESH (Dense Synapses + Interactive Attraction) ──
    const renderNeuralNetwork = () => {
      ctx.fillStyle = isDark ? "#020617" : "#f8fafc";
      ctx.fillRect(0, 0, width, height);

      // Ambient radial gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, isDark ? "rgba(14, 116, 144, 0.18)" : "rgba(207, 250, 254, 0.5)");
      bgGrad.addColorStop(1, "transparent");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const m = mouseRef.current;
      const connectDist = 160;

      // Update positions and connect lines
      for (let i = 0; i < neuralNodes.length; i++) {
        const node = neuralNodes[i]!;
        node.x += node.vx * speedMultiplier;
        node.y += node.vy * speedMultiplier;

        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        // Interactive mouse attraction & lightning connection
        if (m.x !== -1000) {
          const dx = m.x - node.x;
          const dy = m.y - node.y;
          const distToMouse = Math.hypot(dx, dy);
          if (distToMouse < 200 && distToMouse > 20) {
            node.x += (dx / distToMouse) * 0.55 * speedMultiplier;
            node.y += (dy / distToMouse) * 0.55 * speedMultiplier;

            // Connect mouse to node
            const lineAlpha = (1 - distToMouse / 200) * (isDark ? 0.75 : 0.5);
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = isDark
              ? `rgba(56, 189, 248, ${lineAlpha})`
              : `rgba(2, 132, 199, ${lineAlpha})`;
            ctx.lineWidth = 1.4;
            ctx.stroke();
          }
        }

        // Connect node to other nearby nodes
        for (let j = i + 1; j < neuralNodes.length; j++) {
          const other = neuralNodes[j]!;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.hypot(dx, dy);

          if (dist < connectDist) {
            const lineAlpha = (1 - dist / connectDist) * (isDark ? 0.42 : 0.28);
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = isDark
              ? `rgba(125, 211, 252, ${lineAlpha})`
              : `rgba(3, 105, 161, ${lineAlpha})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < neuralNodes.length; i++) {
        const node = neuralNodes[i]!;
        const pulse = Math.sin(time * node.pulseSpeed + node.pulsePhase) * 0.35 + 0.65;

        // Outer glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = (isDark ? 0.22 : 0.15) * pulse;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "#ffffff" : node.color;
        ctx.globalAlpha = (isDark ? 0.95 : 0.85) * pulse;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    };

    // ── 7. QUANTUM HARMONIC WAVES (High-Visibility Spectral Ribbons) ──
    const renderQuantumWaves = () => {
      ctx.fillStyle = isDark ? "#030014" : "#faf5ff";
      ctx.fillRect(0, 0, width, height);

      // Deep celestial violet vignette
      const deepVignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        80,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      deepVignette.addColorStop(0, isDark ? "rgba(88, 28, 135, 0.28)" : "rgba(243, 232, 255, 0.6)");
      deepVignette.addColorStop(1, "transparent");
      ctx.fillStyle = deepVignette;
      ctx.fillRect(0, 0, width, height);

      const m = mouseRef.current;
      const stepX = 14;

      quantumWaveLayers.forEach((wave, idx) => {
        ctx.beginPath();
        ctx.moveTo(0, height);

        const points: Array<{ x: number; y: number }> = [];

        for (let x = 0; x <= width + stepX; x += stepX) {
          let mouseDistort = 0;
          if (m.x !== -1000) {
            const dx = Math.abs(x - m.x);
            if (dx < m.radius) {
              const falloff = Math.cos((dx / m.radius) * (Math.PI / 2));
              mouseDistort = falloff * (m.y - height * wave.baseYRatio) * 0.32;
            }
          }

          const h1 = Math.sin(x * wave.freq + time * wave.speed + wave.harmonicPhase) * wave.amp;
          const h2 = Math.cos(x * wave.freq * 1.6 - time * 0.6 + idx) * (wave.amp * 0.35);
          const h3 = Math.sin(x * wave.freq * 0.4 + time * 0.35) * (wave.amp * 0.25);

          const y = height * wave.baseYRatio + h1 + h2 + h3 + mouseDistort;
          points.push({ x, y });
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, height * wave.baseYRatio - wave.amp, 0, height);
        grad.addColorStop(0, `${wave.colorStart}${wave.alpha})`);
        grad.addColorStop(0.5, `${wave.colorEnd}${wave.alpha * 0.7})`);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.fill();

        // Glowing wave crest stroke
        ctx.beginPath();
        points.forEach((pt, pIdx) => {
          if (pIdx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.strokeStyle = isDark ? "#c084fc" : "#9333ea";
        ctx.lineWidth = isDark ? 2.5 : 2.0;
        ctx.globalAlpha = Math.min(1.0, wave.alpha * 2.0);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      });
    };

    // ── 8. BIOLUMINESCENT GROVE ──
    const renderFireflyForest = () => {
      ctx.fillStyle = isDark ? "#03040b" : "#f8fafc";
      ctx.fillRect(0, 0, width, height);

      // Deep twilight atmosphere
      const ambientForest = ctx.createRadialGradient(
        width * 0.5,
        height * 0.85,
        60,
        width * 0.5,
        height * 0.85,
        Math.max(width, height) * 0.8
      );
      ambientForest.addColorStop(0, isDark ? "rgba(113, 63, 18, 0.28)" : "rgba(254, 240, 138, 0.45)");
      ambientForest.addColorStop(0.5, isDark ? "rgba(30, 27, 75, 0.25)" : "rgba(224, 231, 255, 0.35)");
      ambientForest.addColorStop(1, "transparent");
      ctx.fillStyle = ambientForest;
      ctx.fillRect(0, 0, width, height);

      const m = mouseRef.current;

      fireflies.forEach((ff) => {
        ff.wanderAngle += (Math.random() - 0.5) * 0.25;
        ff.vx = Math.cos(ff.wanderAngle) * 0.65;
        ff.vy = Math.sin(ff.wanderAngle) * 0.5 - 0.05;

        // Flee gently from cursor
        if (m.x !== -1000) {
          const dx = ff.x - m.x;
          const dy = ff.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120 && dist > 1) {
            ff.x += (dx / dist) * 1.8 * speedMultiplier;
            ff.y += (dy / dist) * 1.8 * speedMultiplier;
          }
        }

        ff.x += ff.vx * speedMultiplier;
        ff.y += ff.vy * speedMultiplier;

        if (ff.x < -30) ff.x = width + 30;
        if (ff.x > width + 30) ff.x = -30;
        if (ff.y < -30) ff.y = height + 30;
        if (ff.y > height + 30) ff.y = -30;

        const pulse = Math.sin(time * ff.pulseSpeed + ff.pulsePhase) * 0.4 + 0.6;
        const glowRadius = Math.max(1, (ff.radius + 18) * pulse);

        // Soft outer halo
        const haloGrad = ctx.createRadialGradient(ff.x, ff.y, 0, ff.x, ff.y, glowRadius);
        haloGrad.addColorStop(
          0,
          isDark
            ? `hsla(${ff.hue}, 95%, 65%, ${0.65 * pulse})`
            : `hsla(${ff.hue}, 85%, 45%, ${0.45 * pulse})`
        );
        haloGrad.addColorStop(
          0.4,
          isDark
            ? `hsla(${ff.hue}, 90%, 55%, ${0.25 * pulse})`
            : `hsla(${ff.hue}, 80%, 40%, ${0.15 * pulse})`
        );
        haloGrad.addColorStop(1, "transparent");

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Crisp luminous core
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, ff.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "#ffffff" : `hsl(${ff.hue}, 95%, 40%)`;
        ctx.globalAlpha = 0.95 * pulse;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
    };

    // ── 9. GRAVITATIONAL VORTEX (Cosmic Swirling Photon Vortex) ──
    const renderCosmicVortex = () => {
      ctx.fillStyle = isDark ? "#020308" : "#f8fafc";
      ctx.fillRect(0, 0, width, height);

      // Central gravity sink coordinates (gently tracks mouse)
      const m = mouseRef.current;
      const targetCx = m.x !== -1000 ? width * 0.5 + (m.x - width * 0.5) * 0.15 : width * 0.5;
      const targetCy = m.y !== -1000 ? height * 0.5 + (m.y - height * 0.5) * 0.15 : height * 0.5;

      // Central singularity glow
      const singularityGrad = ctx.createRadialGradient(targetCx, targetCy, 10, targetCx, targetCy, 240);
      singularityGrad.addColorStop(0, isDark ? "rgba(139, 92, 246, 0.4)" : "rgba(196, 181, 253, 0.6)");
      singularityGrad.addColorStop(0.4, isDark ? "rgba(56, 189, 248, 0.2)" : "rgba(186, 230, 253, 0.35)");
      singularityGrad.addColorStop(1, "transparent");
      ctx.fillStyle = singularityGrad;
      ctx.fillRect(0, 0, width, height);

      vortexParticles.forEach((p) => {
        // Orbit faster near the center (Keplerian angular velocity)
        const angularVelocity = (p.speed / (p.r * 0.08 + 25)) * 1.8 * speedMultiplier;
        p.theta += angularVelocity;
        p.r -= 0.3 * speedMultiplier;

        if (p.r < 20) {
          p.r = Math.random() * maxVortexR * 0.9 + 50;
          p.theta = Math.random() * Math.PI * 2;
        }

        const px = targetCx + Math.cos(p.theta) * p.r;
        const py = targetCy + Math.sin(p.theta) * p.r;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = isDark ? p.alpha : p.alpha * 0.8;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
    };

    // ── 10. NANOTECH HEX GRID (Pulsing Honeycomb Wave) ──
    const renderCyberHive = () => {
      ctx.fillStyle = isDark ? "#030a16" : "#f0fdfa";
      ctx.fillRect(0, 0, width, height);

      const m = mouseRef.current;
      const hexR = 34;
      const hexH = Math.sqrt(3) * hexR;
      const colStep = hexR * 1.5;
      const rowStep = hexH;

      ctx.lineWidth = 1.2;

      for (let x = -hexR; x < width + hexR * 2; x += colStep) {
        const colIdx = Math.round(x / colStep);
        const yOffset = colIdx % 2 === 0 ? 0 : hexH / 2;

        for (let y = -hexH; y < height + hexH * 2; y += rowStep) {
          const cy = y + yOffset;
          const distToCenter = Math.hypot(x - width * 0.5, cy - height * 0.5);
          const pulse = Math.sin(time * 2.0 - distToCenter * 0.007) * 0.5 + 0.5;

          let mouseBoost = 0;
          if (m.x !== -1000) {
            const distToMouse = Math.hypot(x - m.x, cy - m.y);
            if (distToMouse < 140) {
              mouseBoost = (1 - distToMouse / 140) * 0.6;
            }
          }

          const alpha = (pulse * 0.28 + mouseBoost) * (isDark ? 0.9 : 0.65);
          ctx.strokeStyle = isDark
            ? `rgba(6, 182, 212, ${alpha})`
            : `rgba(14, 116, 144, ${alpha})`;

          // Draw hexagon
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const angle = (Math.PI / 3) * k;
            const hx = x + hexR * 0.85 * Math.cos(angle);
            const hy = cy + hexR * 0.85 * Math.sin(angle);
            if (k === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    };

    // ── 11. CELESTIAL METEOR SHOWER ──
    const renderMeteorShower = () => {
      ctx.fillStyle = isDark ? "#020308" : "#f8fafc";
      ctx.fillRect(0, 0, width, height);

      // Distant stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]!;
        const twinkle = Math.sin(time * s.twinkleSpeed + s.phase) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(240, 249, 255, ${s.baseAlpha * twinkle})`
          : `rgba(30, 58, 138, ${s.baseAlpha * twinkle * 0.6})`;
        ctx.fill();
      }

      // Meteors
      meteors.forEach((m) => {
        if (m.delay > 0) {
          m.delay -= speedMultiplier;
          return;
        }

        m.x += m.vx * speedMultiplier;
        m.y += m.vy * speedMultiplier;

        if (m.x > width + 200 || m.y > height + 200) {
          m.x = Math.random() * (width + 300) - 200;
          m.y = -Math.random() * 200 - 50;
          m.delay = Math.random() * 120 + 20;
          m.speed = 12 + Math.random() * 8;
        }

        const tailX = m.x - (m.vx / Math.hypot(m.vx, m.vy)) * m.length;
        const tailY = m.y - (m.vy / Math.hypot(m.vx, m.vy)) * m.length;

        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, isDark ? "#ffffff" : m.color);
        grad.addColorStop(0.2, m.color);
        grad.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.size;
        ctx.lineCap = "round";
        ctx.stroke();

        // Glowing head
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "#ffffff" : m.color;
        ctx.shadowColor = m.color;
        ctx.shadowBlur = isDark ? 8 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    // ── 12. QUANTUM DNA HELIX (3D Rotating Double Helix) ──
    const renderQuantumHelix = () => {
      ctx.fillStyle = isDark ? "#02040a" : "#f0fdf4";
      ctx.fillRect(0, 0, width, height);

      const rungs = 42;
      const stepY = height / (rungs - 4);
      const amp = width * 0.22;
      const freq = 0.015;

      for (let i = 0; i < rungs; i++) {
        const y = i * stepY;
        const phase = y * freq + time * 1.8;
        const x1 = width * 0.5 + Math.sin(phase) * amp;
        const z1 = Math.cos(phase); // -1 (back) to +1 (front)
        const x2 = width * 0.5 + Math.sin(phase + Math.PI) * amp;
        const z2 = Math.cos(phase + Math.PI);

        // Normalize depth
        const depthAlpha = ((z1 + 1) / 2) * 0.5 + 0.25;

        // Connecting rung bar
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = isDark
          ? `rgba(52, 211, 153, ${depthAlpha * 0.4})`
          : `rgba(5, 150, 105, ${depthAlpha * 0.35})`;
        ctx.lineWidth = Math.max(1, (z1 + 1) * 1.5);
        ctx.stroke();

        // Strand 1 node (Cyan)
        const r1 = Math.max(1.5, 2.8 + z1 * 1.6);
        ctx.beginPath();
        ctx.arc(x1, y, r1, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? (z1 > 0 ? "#38bdf8" : "#0369a1") : "#0284c7";
        ctx.globalAlpha = Math.max(0.2, (z1 + 1) / 2);
        ctx.fill();

        // Strand 2 node (Emerald)
        const r2 = Math.max(1.5, 2.8 + z2 * 1.6);
        ctx.beginPath();
        ctx.arc(x2, y, r2, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? (z2 > 0 ? "#34d399" : "#065f46") : "#10b981";
        ctx.globalAlpha = Math.max(0.2, (z2 + 1) / 2);
        ctx.fill();

        ctx.globalAlpha = 1.0;
      }
    };

    let lastTime = performance.now();
    const render = (now?: DOMHighResTimeStamp) => {
      const currentTime = typeof now === "number" ? now : performance.now();
      const deltaMs = Math.min(currentTime - lastTime, 40);
      lastTime = currentTime;
      const deltaFactor = deltaMs > 0 ? deltaMs / 16.67 : 1.0;
      time += 0.007 * speedMultiplier * deltaFactor;

      if (wallpaperId === "aurora") {
        renderAurora();
      } else if (wallpaperId === "starfield") {
        renderStarfield();
      } else if (wallpaperId === "cyber-grid") {
        renderCyberGrid();
      } else if (wallpaperId === "fluid-plasma") {
        renderFluidPlasma();
      } else if (wallpaperId === "matrix-rain") {
        renderMatrixRain();
      } else if (wallpaperId === "neural-network") {
        renderNeuralNetwork();
      } else if (wallpaperId === "quantum-waves") {
        renderQuantumWaves();
      } else if (wallpaperId === "firefly-forest") {
        renderFireflyForest();
      } else if (wallpaperId === "cosmic-vortex") {
        renderCosmicVortex();
      } else if (wallpaperId === "cyber-hive") {
        renderCyberHive();
      } else if (wallpaperId === "meteor-shower") {
        renderMeteorShower();
      } else if (wallpaperId === "quantum-helix") {
        renderQuantumHelix();
      }

      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]!;
        r.r += (r.maxR - r.r) * 0.07;
        r.alpha *= 0.94;

        if (r.alpha < 0.02 || r.r >= r.maxR - 2) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = r.alpha;
        ctx.lineWidth = 2.0;
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mounted, isDark, wallpaperId, wallpaperSpeed, isHighRefresh]);

  if (!mounted) {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden"
        aria-hidden="true"
        suppressHydrationWarning
      />
    );
  }

  const isAnimated = ANIMATED_WALLPAPER_IDS.includes(wallpaperId);
  const currentPreset = WALLPAPER_PRESETS.find((p) => p.id === wallpaperId) || WALLPAPER_PRESETS[0]!;
  const staticGradient = isDark ? currentPreset.previewDark : currentPreset.previewLight;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden transition-all duration-700"
      style={{ opacity: wallpaperOpacity }}
      aria-hidden="true"
      suppressHydrationWarning
    >
      {/* ── 1. Live Animated GPU Canvas (Always mounted to prevent ref disconnects) ── */}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-500 will-change-transform",
          isAnimated ? "opacity-100 block" : "opacity-0 hidden"
        )}
        style={{
          transform: "translateZ(0)",
        }}
      />

      {/* ── 2. Static Wallpaper Layers (Directly driven by preset gradients + textures) ── */}
      {!isAnimated && (
        <div className="absolute inset-0 h-full w-full transition-all duration-700">
          {/* Base gradient matching the modal card preview 100% */}
          <div
            className="absolute inset-0 h-full w-full transition-all duration-700"
            style={{ background: staticGradient }}
          />

          {/* Preset-specific architectural texture overlays */}
          {wallpaperId === "bluestar-frost" && (
            <div
              className="absolute inset-0 opacity-25 dark:opacity-40 mix-blend-overlay"
              style={{
                backgroundImage:
                  "radial-gradient(#0176D3 1.5px, transparent 1.5px), radial-gradient(#0284c7 1.5px, transparent 1.5px)",
                backgroundSize: "40px 40px",
                backgroundPosition: "0 0, 20px 20px",
              }}
            />
          )}

          {wallpaperId === "salesforce-mesh" && (
            <div
              className="absolute inset-0 opacity-15 dark:opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(30deg, #38bdf8 12%, transparent 12.5%, transparent 87%, #38bdf8 87.5%, #38bdf8), linear-gradient(150deg, #38bdf8 12%, transparent 12.5%, transparent 87%, #38bdf8 87.5%, #38bdf8)",
                backgroundSize: "60px 105px",
              }}
            />
          )}

          {wallpaperId === "carbon-matrix" && (
            <div
              className="absolute inset-0 opacity-30 dark:opacity-35"
              style={{
                backgroundImage: "radial-gradient(#38bdf8 1.2px, transparent 1.2px)",
                backgroundSize: "24px 24px",
              }}
            />
          )}

          {wallpaperId === "emerald-matrix" && (
            <div
              className="absolute inset-0 opacity-20 dark:opacity-25"
              style={{
                backgroundImage:
                  "linear-gradient(60deg, #10b981 1px, transparent 1px), linear-gradient(120deg, #10b981 1px, transparent 1px)",
                backgroundSize: "48px 84px",
              }}
            />
          )}

          {wallpaperId === "tokyo-neon" && (
            <>
              <div
                className="absolute inset-0 opacity-15 dark:opacity-25"
                style={{
                  backgroundImage: "linear-gradient(0deg, #f43f5e 1px, transparent 1px)",
                  backgroundSize: "100% 32px",
                }}
              />
              <div
                className="absolute inset-0 opacity-35 dark:opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse at 80% 20%, rgba(244,63,94,0.3) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(6,182,212,0.25) 0%, transparent 55%)",
                }}
              />
            </>
          )}

          {wallpaperId === "glacial-ice" && (
            <div
              className="absolute inset-0 opacity-20 dark:opacity-25"
              style={{
                backgroundImage:
                  "radial-gradient(#38bdf8 1.5px, transparent 1.5px), radial-gradient(#0ea5e9 1px, transparent 1px)",
                backgroundSize: "36px 36px, 18px 18px",
                backgroundPosition: "0 0, 9px 9px",
              }}
            />
          )}

          {wallpaperId === "volcanic-magma" && (
            <div
              className="absolute inset-0 opacity-15 dark:opacity-25 mix-blend-color-dodge"
              style={{
                backgroundImage:
                  "radial-gradient(#f97316 1.5px, transparent 1.5px), radial-gradient(#ef4444 1px, transparent 1px)",
                backgroundSize: "44px 44px, 22px 22px",
                backgroundPosition: "0 0, 11px 11px",
              }}
            />
          )}

          {wallpaperId === "deep-abyss" && (
            <div
              className="absolute inset-0 opacity-25 dark:opacity-35"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 50% 0%, rgba(20, 184, 166, 0.4) 0%, transparent 70%)",
              }}
            />
          )}

          {wallpaperId === "retro-vector" && (
            <div
              className="absolute inset-0 opacity-15 dark:opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
