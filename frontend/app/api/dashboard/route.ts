import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/dashboard-metrics";

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
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}