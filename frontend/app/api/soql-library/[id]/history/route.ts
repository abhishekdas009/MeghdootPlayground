import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const history = await prisma.sOQLHistory.findMany({
      where: { queryId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ history });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load query history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
