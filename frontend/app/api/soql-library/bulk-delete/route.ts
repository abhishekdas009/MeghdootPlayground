import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Missing or invalid ids array" }, { status: 400 });
    }

    const result = await prisma.sOQLLibrary.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to perform bulk delete";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
