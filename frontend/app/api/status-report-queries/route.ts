import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_STATUS_REPORT_QUERIES, StatusReportQueryItem } from "@/lib/status-report-queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const result: Record<string, StatusReportQueryItem> = {
    ...DEFAULT_STATUS_REPORT_QUERIES,
  };

  try {
    const dbQueries = await prisma.statusReportQuery.findMany();
    for (const item of dbQueries) {
      if (item.key) {
        result[item.key] = {
          id: item.id,
          key: item.key,
          name: item.name,
          soql: item.soql,
          updatedAt: item.updatedAt.toISOString(),
        };
      }
    }
    return NextResponse.json({ success: true, queries: result, source: "database" });
  } catch (error) {
    // If DB is offline or table hasn't been pushed yet, return the defaults gracefully
    return NextResponse.json({
      success: true,
      queries: result,
      source: "fallback",
      warning: error instanceof Error ? error.message : "Database connection unavailable",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, soql, name } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "Query key is required" }, { status: 400 });
    }

    if (!soql || typeof soql !== "string") {
      return NextResponse.json({ error: "SOQL query content is required" }, { status: 400 });
    }

    const defaultItem = (DEFAULT_STATUS_REPORT_QUERIES as Record<string, StatusReportQueryItem>)[key];
    const queryName = name || defaultItem?.name || key;

    try {
      const record = await prisma.statusReportQuery.upsert({
        where: { key },
        update: {
          soql: soql.trim(),
          name: queryName,
        },
        create: {
          key,
          name: queryName,
          soql: soql.trim(),
        },
      });

      return NextResponse.json({
        success: true,
        query: {
          id: record.id,
          key: record.key,
          name: record.name,
          soql: record.soql,
          updatedAt: record.updatedAt.toISOString(),
        },
        persisted: true,
      });
    } catch (dbError) {
      return NextResponse.json({
        success: true,
        query: {
          key,
          name: queryName,
          soql: soql.trim(),
          updatedAt: new Date().toISOString(),
        },
        persisted: false,
        warning: dbError instanceof Error ? dbError.message : "Database save failed, using local update",
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update SOQL query";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
