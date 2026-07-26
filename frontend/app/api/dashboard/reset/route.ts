import { NextResponse } from "next/server";
import { resetDashboardMetrics } from "@/lib/dashboard-metrics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    await resetDashboardMetrics();
    return NextResponse.json(
      { success: true, message: "Dashboard metrics reset successfully" },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset dashboard";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
