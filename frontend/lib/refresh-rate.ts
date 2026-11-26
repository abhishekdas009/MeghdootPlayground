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
let hasMeasuredOnce = false;
let isMeasuringNow = false;
let lastMeasuredTimestamp = 0;
let listeners: Array<(info: RefreshRateInfo) => void> = [];

function buildInfo(fps: number, highRefresh: boolean): RefreshRateInfo {
  return {
    fps,
    isHighRefresh: highRefresh,
    label: `${fps}Hz ${fps >= 120 ? "Ultra Smooth" : fps >= 90 ? "High Refresh" : "Standard"}`,
  };
}

/**
 * Measure display refresh rate using high-resolution requestAnimationFrame timestamps.
 * Deduplicated and cooled down so tab switches / multiple mounts do not re-trigger bursts.
 */
export function measureDisplayRefreshRate(
  callback?: (info: RefreshRateInfo) => void,
  force = false
) {
  if (typeof window === "undefined") {
    return;
  }

  const nowMs = Date.now();
  if (!force && hasMeasuredOnce && nowMs - lastMeasuredTimestamp < 60_000) {
    if (callback) callback(buildInfo(cachedFps, isHighRefreshGlobal));
    return;
  }

  if (isMeasuringNow) {
    return;
  }
  isMeasuringNow = true;

  let frameCount = 0;
  let startTime = 0;
  const sampleFrames = 18;
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
      isMeasuringNow = false;
      hasMeasuredOnce = true;
      lastMeasuredTimestamp = Date.now();

      // Calculate median/trimmed average delta to discard isolated frame drops
      deltas.sort((a, b) => a - b);
      const validDeltas = deltas.length > 4 ? deltas.slice(2, deltas.length - 2) : deltas;
      const avgDelta =
        validDeltas.length > 0
          ? validDeltas.reduce((a, b) => a + b, 0) / validDeltas.length
          : (now - startTime) / frameCount;

      const rawFps = avgDelta > 0 ? 1000 / avgDelta : 60;

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

      const info = buildInfo(detectedFps, isHighRefreshGlobal);

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
