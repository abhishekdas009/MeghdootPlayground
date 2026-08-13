import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const { historyId } = await request.json();
    if (!historyId) {
      return NextResponse.json({ error: "historyId is required" }, { status: 400 });
    }

    const historyRecord = await prisma.sOQLHistory.findUnique({
      where: { id: historyId },
    });

    if (!historyRecord || historyRecord.queryId !== id) {
      return NextResponse.json({ error: "History record not found" }, { status: 404 });
    }

    // Save the current state as a new history record before rolling back
    const existing = await prisma.sOQLLibrary.findUnique({ where: { id } });
    if (existing) {
      await prisma.sOQLHistory.create({
        data: {
          queryId: existing.id,
          soql: existing.soql,
          label: existing.label,
          category: existing.category,
          tags: existing.tags,
          description: existing.description,
        }
      });
    }

    // Rollback
    const query = await prisma.sOQLLibrary.update({
      where: { id },
      data: {
        soql: historyRecord.soql,
        label: historyRecord.label,
        category: historyRecord.category,
        tags: historyRecord.tags,
        description: historyRecord.description,
      }
    });

    return NextResponse.json({ query });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to rollback SOQL query";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
