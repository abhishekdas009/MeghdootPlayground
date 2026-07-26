import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SOQLLibraryInput = {
  id?: unknown;
  label?: unknown;
  category?: unknown;
  description?: unknown;
  soql?: unknown;
  favourite?: unknown;
};

function normalizeQueryInput(input: SOQLLibraryInput) {
  const label = typeof input.label === "string" ? input.label.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const soql = typeof input.soql === "string" ? input.soql.trim() : "";

  if (!label || !category || !soql) {
    throw new Error("Label, category and SOQL query are required");
  }

  return {
    label,
    category,
    description,
    soql,
    favourite: typeof input.favourite === "boolean" ? input.favourite : false,
  };
}

async function listQueries() {
  return prisma.sOQLLibrary.findMany({
    orderBy: [{ favourite: "desc" }, { updatedAt: "desc" }, { label: "asc" }],
  });
}

export async function GET() {
  try {
    const queries = await listQueries();
    return NextResponse.json({ queries });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load SOQL library";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SOQLLibraryInput;
    const data = normalizeQueryInput(body);

    const query = await prisma.sOQLLibrary.create({ data });

    return NextResponse.json({ query }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save SOQL query";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
