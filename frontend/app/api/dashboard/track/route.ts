import { NextRequest, NextResponse } from "next/server";
import { trackMetricEvent } from "@/lib/dashboard-metrics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface TrackBody {
  metricKey?: unknown;
  incrementBy?: unknown;
  event?: {
    type?: unknown;
    label?: unknown;
    meta?: unknown;
    module?: unknown;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrackBody;

    const metricKey =
      typeof body.metricKey === "string" ? body.metricKey.trim() : "";
    const incrementBy =
      typeof body.incrementBy === "number" && body.incrementBy > 0
        ? body.incrementBy
        : 1;

    if (!metricKey) {
      return NextResponse.json(
        { error: "metricKey is required" },
        { status: 400 }
      );
    }

    const eventType =
      typeof body.event?.type === "string" ? body.event.type.trim() : "unknown";
    const eventLabel =
      typeof body.event?.label === "string"
        ? body.event.label.trim()
        : metricKey;
    const eventMeta =
      typeof body.event?.meta === "string" ? body.event.meta.trim() : undefined;
    const eventModule =
      typeof body.event?.module === "string"
        ? body.event.module.trim()
        : "unknown";

    const result = await trackMetricEvent({
      metricKey,
      incrementBy,
      event: {
        type: eventType,
        label: eventLabel,
        meta: eventMeta,
        module: eventModule,
      },
    });

    return NextResponse.json(
      { success: true, metric: result },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to track event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
