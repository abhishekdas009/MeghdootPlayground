import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type OwnerUpdateInput = {
  name?: unknown;
  ownerId?: unknown;
  isActive?: unknown;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as OwnerUpdateInput;
    const data: { name?: string; ownerId?: string; isActive?: boolean } = {};

    if (typeof body.name === "string") data.name = body.name.trim();
    if (typeof body.ownerId === "string") data.ownerId = body.ownerId.trim();
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;

    if ((body.name !== undefined || body.ownerId !== undefined) && (!data.name || !data.ownerId)) {
      return NextResponse.json({ error: "Employee name and owner id are required" }, { status: 400 });
    }

    const owner = await prisma.caseOwner.update({
      where: { id },
      data,
    });

    return NextResponse.json({ owner });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update employee";
    const status = message.includes("Unique constraint") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const owner = await prisma.caseOwner.delete({
      where: { id },
    });

    return NextResponse.json({ owner });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete employee";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
