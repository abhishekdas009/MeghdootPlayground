"use client";

import * as React from "react";
import { useUIStore } from "@/store/ui-store";

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

export function AnimatedBackground() {
  const [mounted, setMounted] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDark, setIsDark] = React.useState(true);
  const { wallpaperId, wallpaperOpacity, wallpaperSpeed } = useUIStore();

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
    const isAnimated = ["aurora", "starfield", "cyber-grid", "fluid-plasma"].includes(wallpaperId);
    if (!isAnimated) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let time = 0;

    const speedMultiplier = wallpaperSpeed === "paused" ? 0 : wallpaperSpeed === "slow" ? 0.35 : 1.0;

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

    // Asset Allocations
    const starCount = wallpaperId === "starfield" ? 160 : 65;
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

    // ── AURORA BOREALIS ──
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

    // ── DEEP SPACE COSMOS ──
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

    // ── CYBERNETIC BLUEPRINT ──
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

    // ── AMBIENT PLASMA FLOW ──
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

    const render = () => {
      time += 0.007 * speedMultiplier;

      if (wallpaperId === "aurora") {
        renderAurora();
      } else if (wallpaperId === "starfield") {
        renderStarfield();
      } else if (wallpaperId === "cyber-grid") {
        renderCyberGrid();
      } else if (wallpaperId === "fluid-plasma") {
        renderFluidPlasma();
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
  }, [mounted, isDark, wallpaperId, wallpaperSpeed]);

  if (!mounted) {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden"
        aria-hidden="true"
        suppressHydrationWarning
      />
    );
  }

  const isAnimated = ["aurora", "starfield", "cyber-grid", "fluid-plasma"].includes(wallpaperId);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden transition-all duration-700"
      style={{ opacity: wallpaperOpacity }}
      aria-hidden="true"
      suppressHydrationWarning
    >
      {/* ── 1. Real-time Animated GPU Canvas ── */}
      {isAnimated && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
        />
      )}

      {/* ── 2. Static Wallpaper Layers (Complementing Dark & Light Mode) ── */}
      {!isAnimated && (
        <div className="absolute inset-0 h-full w-full transition-all duration-700">
          {/* A. Minimalist Clean Slate */}
          {wallpaperId === "minimal" && (
            <div className="h-full w-full bg-radial from-slate-900/50 via-[#070b14] to-[#020408] dark:block hidden" />
          )}
          {wallpaperId === "minimal" && (
            <div className="h-full w-full bg-radial from-white via-slate-100 to-slate-200 dark:hidden block" />
          )}

          {/* B. Blue Star Corporate Frost */}
          {wallpaperId === "bluestar-frost" && (
            <>
              <div className="h-full w-full bg-gradient-to-br from-[#0c2340] via-[#051124] to-[#02050d] dark:block hidden" />
              <div className="h-full w-full bg-gradient-to-br from-blue-100/80 via-sky-50 to-indigo-100/60 dark:hidden block" />
              <div
                className="absolute inset-0 opacity-25 dark:opacity-40 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "radial-gradient(#0176D3 1.5px, transparent 1.5px), radial-gradient(#0284c7 1.5px, transparent 1.5px)",
                  backgroundSize: "40px 40px",
                  backgroundPosition: "0 0, 20px 20px",
                }}
              />
            </>
          )}

          {/* C. Midnight Indigo Nebula */}
          {wallpaperId === "midnight-nebula" && (
            <>
              <div className="h-full w-full bg-[radial-gradient(circle_at_80%_20%,#4338ca_0%,#1e1b4b_40%,#030712_90%)] dark:block hidden" />
              <div className="h-full w-full bg-[radial-gradient(circle_at_80%_20%,#c7d2fe_0%,#e0e7ff_50%,#f8fafc_90%)] dark:hidden block" />
            </>
          )}

          {/* D. Sunset Horizon */}
          {wallpaperId === "sunset-twilight" && (
            <>
              <div className="h-full w-full bg-[linear-gradient(160deg,#b45309_0%,#7c2d12_30%,#0f172a_75%,#020617_100%)] opacity-70 dark:block hidden" />
              <div className="h-full w-full bg-[linear-gradient(160deg,#fef3c7_0%,#fed7aa_35%,#f1f5f9_80%)] dark:hidden block" />
            </>
          )}

          {/* E. Salesforce Lightning Mesh */}
          {wallpaperId === "salesforce-mesh" && (
            <>
              <div className="h-full w-full bg-[linear-gradient(120deg,#0284c7_0%,#0369a1_30%,#082f49_70%,#020617_100%)] opacity-75 dark:block hidden" />
              <div className="h-full w-full bg-[linear-gradient(120deg,#e0f2fe_0%,#bae6fd_40%,#f0fdfa_80%,#ffffff_100%)] dark:hidden block" />
              <div
                className="absolute inset-0 opacity-15 dark:opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(30deg, #38bdf8 12%, transparent 12.5%, transparent 87%, #38bdf8 87.5%, #38bdf8), linear-gradient(150deg, #38bdf8 12%, transparent 12.5%, transparent 87%, #38bdf8 87.5%, #38bdf8)",
                  backgroundSize: "60px 105px",
                }}
              />
            </>
          )}

          {/* F. Carbon Dot Matrix */}
          {wallpaperId === "carbon-matrix" && (
            <>
              <div className="h-full w-full bg-[#050912] dark:block hidden" />
              <div className="h-full w-full bg-slate-50 dark:hidden block" />
              <div
                className="absolute inset-0 opacity-30 dark:opacity-35"
                style={{
                  backgroundImage: "radial-gradient(#38bdf8 1.2px, transparent 1.2px)",
                  backgroundSize: "24px 24px",
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
