import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const query = await prisma.sOQLLibrary.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ query });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to use SOQL query";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
