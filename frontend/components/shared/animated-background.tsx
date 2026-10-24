"use client";

import * as React from "react";

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
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDark, setIsDark] = React.useState(true);

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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let time = 0;

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

      // Soft ionized trail on quick cursor motion
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

    // ──────────────────────────────────────────────────────────────────────────
    // PRE-ALLOCATED ASSETS (POLAR STARS & PLASMA MOTES)
    // ──────────────────────────────────────────────────────────────────────────
    const starCount = 65;
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.7),
        r: Math.random() * 1.3 + 0.4,
        baseAlpha: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 1.8 + 0.8,
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

    // Pre-allocated ray phases for natural curtain striation
    const curtainRays: AuroraRay[] = [];
    for (let i = 0; i < 90; i++) {
      curtainRays.push({
        xOffset: (i / 90),
        heightMult: 0.6 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        speed: 1.2 + Math.random() * 1.4,
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // MAIN 60FPS RENDER LOOP: AURORA BOREALIS CURTAINS
    // ──────────────────────────────────────────────────────────────────────────
    const render = () => {
      time += 0.007;

      // 1. Polar Ambient Base Wash
      if (isDark) {
        ctx.fillStyle = "#030408";
        ctx.fillRect(0, 0, width, height);

        // Soft deep atmospheric glow in the upper stratosphere
        const ambientGrad = ctx.createRadialGradient(
          width * 0.5, height * 0.35, 100,
          width * 0.5, height * 0.35, Math.max(width, height) * 0.85
        );
        ambientGrad.addColorStop(0, "rgba(6, 30, 48, 0.45)");
        ambientGrad.addColorStop(0.5, "rgba(8, 16, 32, 0.25)");
        ambientGrad.addColorStop(1, "rgba(3, 4, 8, 0.95)");
        ctx.fillStyle = ambientGrad;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, width, height);

        // Soft luminous morning polar wash in light theme
        const lightGrad = ctx.createRadialGradient(
          width * 0.5, height * 0.3, 100,
          width * 0.5, height * 0.3, Math.max(width, height) * 0.9
        );
        lightGrad.addColorStop(0, "rgba(238, 246, 255, 0.65)");
        lightGrad.addColorStop(0.6, "rgba(241, 245, 249, 0.45)");
        lightGrad.addColorStop(1, "rgba(248, 250, 252, 0.85)");
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Polar Twinkling Stars (visible in dark mode & softly in light)
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

      // 3. Multi-Layered Aurora Borealis Curtains
      const m = mouseRef.current;

      const layers = [
        // Layer 1: High-Altitude Ionized Violet & Indigo Curtain
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
        // Layer 2: Signature Arctic Emerald Green Curtain (Strongest O2 emission line)
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
        // Layer 3: Vibrant Glacial Cyan & Aquamarine Fold
        {
          baseYRatio: 0.58,
          amp: 74,
          freq: 0.0034,
          speed: 1.25,
          alpha: isDark ? 0.32 : 0.20,
          colStart: isDark ? "rgba(56, 189, 248, " : "rgba(2, 132, 199, ",
          colEnd: isDark ? "rgba(6, 182, 212, " : "rgba(14, 165, 233, ",
          rayCol: isDark ? "#38bdf8" : "#0284c7",
          rayHeight: 85,
        },
        // Layer 4: Deep Ethereal Magenta / Polar Edge Glow
        {
          baseYRatio: 0.70,
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
          // Interactive cursor pull & organic fluid displacement
          let mouseDisplace = 0;
          if (m.x !== -1000) {
            const dx = Math.abs(x - m.x);
            if (dx < m.radius) {
              const falloff = Math.cos((dx / m.radius) * (Math.PI / 2));
              mouseDisplace = falloff * (m.y - height * layer.baseYRatio) * 0.32;
            }
          }

          // Multi-harmonic undulating wave formulation
          const wave1 = Math.sin(x * layer.freq + time * layer.speed + layerIdx * 1.5) * layer.amp;
          const wave2 = Math.cos(x * layer.freq * 1.7 - time * 0.8 + layerIdx) * (layer.amp * 0.35);
          const wave3 = Math.sin(x * layer.freq * 0.5 + time * 0.4) * (layer.amp * 0.2);

          const y = height * layer.baseYRatio + wave1 + wave2 + wave3 + mouseDisplace;
          points.push({ x, y });
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Aurora Curtain Volumetric Vertical Gradient
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

        // Vertical Folding Striations (Auroral Rays along geomagnetic lines)
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

      // 4. Floating Ionized Plasma Motes
      for (let i = 0; i < motes.length; i++) {
        const mote = motes[i]!;
        mote.x += mote.vx;
        mote.y += mote.vy;

        // Wrap around boundaries
        if (mote.x < 0) mote.x = width;
        if (mote.x > width) mote.x = 0;
        if (mote.y < 0) mote.y = height;
        if (mote.y > height) mote.y = 0;

        // Mouse deflection / attraction
        if (m.x !== -1000) {
          const dx = mote.x - m.x;
          const dy = mote.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < m.radius && dist > 1) {
            const force = (1 - dist / m.radius) * 0.45;
            mote.x += (dx / dist) * force * 1.5;
            mote.y += (dy / dist) * force * 1.5;
          }
        }

        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
        const palette = isDark ? moteColorsDark : moteColorsLight;
        ctx.fillStyle = palette[i % palette.length]!;
        ctx.globalAlpha = isDark ? mote.alpha : mote.alpha * 0.7;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 5. Click & Velocity Shockwave Ripples
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
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-100 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
}
