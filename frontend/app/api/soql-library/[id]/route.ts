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
  tags?: unknown;
  description?: unknown;
  soql?: unknown;
  favourite?: unknown;
};

function normalizeUpdateInput(input: SOQLLibraryUpdateInput) {
  const data: {
    label?: string;
    category?: string;
    tags?: string[];
    description?: string;
    soql?: string;
    favourite?: boolean;
  } = {};

  if (typeof input.label === "string") data.label = input.label.trim();
  if (typeof input.category === "string") data.category = input.category.trim();
  if (typeof input.description === "string") data.description = input.description.trim();
  if (typeof input.soql === "string") data.soql = input.soql.trim();
  if (typeof input.favourite === "boolean") data.favourite = input.favourite;
  if (Array.isArray(input.tags)) {
    data.tags = input.tags.filter((t) => typeof t === "string").map((t) => t.trim()).filter(Boolean);
  }

  if ((input.label !== undefined && !data.label) || (input.category !== undefined && !data.category) || (input.soql !== undefined && !data.soql)) {
    throw new Error("Label, category and SOQL query cannot be empty");
  }

  return data;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as SOQLLibraryUpdateInput;
    const updateData = normalizeUpdateInput(body);

    const existing = await prisma.sOQLLibrary.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }

    // Check if meaningful fields changed before saving history
    const isMeaningfulChange = 
      (updateData.soql && updateData.soql !== existing.soql) ||
      (updateData.label && updateData.label !== existing.label) ||
      (updateData.description && updateData.description !== existing.description) ||
      (updateData.category && updateData.category !== existing.category) ||
      (updateData.tags && JSON.stringify(updateData.tags) !== JSON.stringify(existing.tags));

    if (isMeaningfulChange) {
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

    const query = await prisma.sOQLLibrary.update({
      where: { id },
      data: updateData,
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
