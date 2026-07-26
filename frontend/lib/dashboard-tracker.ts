// lib/dashboard-tracker.ts
// Client-side fire-and-forget event tracker for dashboard KPIs.
// Calls POST /api/dashboard/track in the background while also
// updating the local Zustand store for instant UI reactivity.

import { useDashboardStore } from "@/lib/dashboard-store";

export interface TrackEventInput {
  metricKey: string;
  incrementBy?: number;
  event: {
    type: string;
    label: string;
    meta?: string;
    module: string;
  };
}

/**
 * Fire-and-forget: persist an event to the database and update the
 * local Zustand store in parallel. Errors are logged but never propagated
 * so the calling UI code is never interrupted.
 */
export function trackDashboardEvent(input: TrackEventInput): void {
  const { metricKey, incrementBy = 1, event } = input;

  // Optimistic local update
  const store = useDashboardStore.getState();
  store.incrementMetric(metricKey, incrementBy);
  store.pushServerActivity({
    type: event.type,
    label: event.label,
    meta: event.meta,
    module: event.module,
  });

  // Persist to server (fire-and-forget)
  fetch("/api/dashboard/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metricKey, incrementBy, event }),
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.warn("[dashboard-tracker] Failed to persist event:", err);
  });
}
