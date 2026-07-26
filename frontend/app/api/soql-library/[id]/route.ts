import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type SOQLLibraryUpdateInput = {
  label?: unknown;
  category?: unknown;
  description?: unknown;
  soql?: unknown;
  favourite?: unknown;
};

function normalizeUpdateInput(input: SOQLLibraryUpdateInput) {
  const data: {
    label?: string;
    category?: string;
    description?: string;
    soql?: string;
    favourite?: boolean;
  } = {};

  if (typeof input.label === "string") data.label = input.label.trim();
  if (typeof input.category === "string") data.category = input.category.trim();
  if (typeof input.description === "string") data.description = input.description.trim();
  if (typeof input.soql === "string") data.soql = input.soql.trim();
  if (typeof input.favourite === "boolean") data.favourite = input.favourite;

  if ((input.label !== undefined && !data.label) || (input.category !== undefined && !data.category) || (input.soql !== undefined && !data.soql)) {
    throw new Error("Label, category and SOQL query cannot be empty");
  }

  return data;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as SOQLLibraryUpdateInput;
    const query = await prisma.sOQLLibrary.update({
      where: { id },
      data: normalizeUpdateInput(body),
    });

    return NextResponse.json({ query });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update SOQL query";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const query = await prisma.sOQLLibrary.delete({
      where: { id },
    });

    return NextResponse.json({ query });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete SOQL query";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
