import { NextRequest, NextResponse } from "next/server";
import { recordStoredQueryUsage } from "@/lib/soql-library-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const query = await recordStoredQueryUsage(id);
    if (!query) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }

    return NextResponse.json({ query });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to register query usage";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
