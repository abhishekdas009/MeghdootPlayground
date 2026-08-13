import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { ids, category } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Missing or invalid ids array" }, { status: 400 });
    }
    if (!category || typeof category !== "string") {
      return NextResponse.json({ error: "Missing or invalid category" }, { status: 400 });
    }

    // First fetch existing to save history
    const existingRecords = await prisma.sOQLLibrary.findMany({
      where: { id: { in: ids } }
    });

    // Create history records
    if (existingRecords.length > 0) {
      await prisma.sOQLHistory.createMany({
        data: existingRecords.map(record => ({
          queryId: record.id,
          soql: record.soql,
          label: record.label,
          category: record.category,
          tags: record.tags,
          description: record.description,
        }))
      });
    }

    // Update categories
    const result = await prisma.sOQLLibrary.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        category: category.trim()
      }
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to perform bulk categorize";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
