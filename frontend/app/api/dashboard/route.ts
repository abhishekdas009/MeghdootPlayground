import { NextResponse } from "next/server";
import { getDashboardSnapshot, METRIC_DEFINITIONS } from "@/lib/dashboard-metrics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const snapshot = await getDashboardSnapshot();
    return NextResponse.json(
      { success: true, data: snapshot, generatedAt: new Date().toISOString() },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    const fallbackMetrics = Object.entries(METRIC_DEFINITIONS).map(([key, def]) => ({
      key,
      value: 0,
      label: def.label,
      category: def.category,
      updatedAt: new Date().toISOString(),
    }));
    return NextResponse.json(
      {
        success: true,
        data: { metrics: fallbackMetrics, events: [] },
        generatedAt: new Date().toISOString(),
        source: "fallback",
      },
      { status: 200 }
    );
  }
}
