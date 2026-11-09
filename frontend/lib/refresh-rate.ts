"use client";

import * as React from "react";

export interface RefreshRateInfo {
  fps: number;
  isHighRefresh: boolean; // true if >= 90Hz (e.g. 120Hz, 144Hz, 165Hz, 240Hz)
  label: string;
}

// Global cached refresh rate to avoid re-measuring on every component mount
let cachedFps = 60;
let isHighRefreshGlobal = false;
let listeners: Array<(info: RefreshRateInfo) => void> = [];

/**
 * Measure display refresh rate using high-resolution requestAnimationFrame timestamps
 */
export function measureDisplayRefreshRate(callback?: (info: RefreshRateInfo) => void) {
  if (typeof window === "undefined") {
    return;
  }

  let frameCount = 0;
  let startTime = 0;
  const sampleFrames = 25;
  const deltas: number[] = [];
  let lastTimestamp = 0;

  const sample = (now: DOMHighResTimeStamp) => {
    if (startTime === 0) {
      startTime = now;
      lastTimestamp = now;
      requestAnimationFrame(sample);
      return;
    }

    const delta = now - lastTimestamp;
    lastTimestamp = now;
    if (delta > 2 && delta < 50) {
      deltas.push(delta);
    }

    frameCount++;
    if (frameCount < sampleFrames) {
      requestAnimationFrame(sample);
    } else {
      // Calculate median or trimmed average delta to discard frame drops
      deltas.sort((a, b) => a - b);
      const validDeltas = deltas.slice(2, deltas.length - 2);
      const avgDelta =
        validDeltas.length > 0
          ? validDeltas.reduce((a, b) => a + b, 0) / validDeltas.length
          : (now - startTime) / frameCount;

      const rawFps = 1000 / avgDelta;

      // Snap to known standard hardware tiers
      let detectedFps = 60;
      if (rawFps >= 210) detectedFps = 240;
      else if (rawFps >= 155) detectedFps = 165;
      else if (rawFps >= 135) detectedFps = 144;
      else if (rawFps >= 108) detectedFps = 120;
      else if (rawFps >= 82) detectedFps = 90;
      else if (rawFps >= 70) detectedFps = 75;
      else detectedFps = 60;

      cachedFps = detectedFps;
      isHighRefreshGlobal = detectedFps >= 90;

      // Update CSS custom properties on document element for hardware-adaptive CSS
      document.documentElement.style.setProperty("--app-refresh-rate", `${detectedFps}`);
      document.documentElement.style.setProperty(
        "--is-high-refresh",
        isHighRefreshGlobal ? "1" : "0"
      );

      const info: RefreshRateInfo = {
        fps: detectedFps,
        isHighRefresh: isHighRefreshGlobal,
        label: `${detectedFps}Hz ${detectedFps >= 120 ? "Ultra Smooth" : detectedFps >= 90 ? "High Refresh" : "Standard"}`,
      };

      if (callback) callback(info);
      listeners.forEach((fn) => fn(info));
    }
  };

  requestAnimationFrame(sample);
}

/**
 * Hook to auto-adaptively read the laptop / monitor's refresh rate
 */
export function useRefreshRate(): RefreshRateInfo {
  const [info, setInfo] = React.useState<RefreshRateInfo>(() => ({
    fps: cachedFps,
    isHighRefresh: isHighRefreshGlobal,
    label: `${cachedFps}Hz ${cachedFps >= 120 ? "Ultra Smooth" : cachedFps >= 90 ? "High Refresh" : "Standard"}`,
  }));

  React.useEffect(() => {
    listeners.push(setInfo);

    // Initial measurement
    measureDisplayRefreshRate(setInfo);

    // Re-check when window is moved between screens or regains focus
    const handleFocus = () => {
      measureDisplayRefreshRate(setInfo);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      listeners = listeners.filter((fn) => fn !== setInfo);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return info;
}
