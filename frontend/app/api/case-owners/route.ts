import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type OwnerInput = {
  id?: unknown;
  name?: unknown;
  ownerId?: unknown;
  isActive?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function normalizeOwnerInput(input: OwnerInput, includeId = false) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const ownerId = typeof input.ownerId === "string" ? input.ownerId.trim() : "";

  if (!name || !ownerId) {
    throw new Error("Employee name and owner id are required");
  }

  return {
    ...(includeId && typeof input.id === "string" && input.id.trim() ? { id: input.id.trim() } : {}),
    name,
    ownerId,
    isActive: typeof input.isActive === "boolean" ? input.isActive : true,
    createdAt: typeof input.createdAt === "string" ? new Date(input.createdAt) : new Date(),
    updatedAt: typeof input.updatedAt === "string" ? new Date(input.updatedAt) : new Date(),
  };
}

function hasDuplicateOwnerIds(owners: Array<{ ownerId: string }>) {
  const seen = new Set<string>();

  for (const owner of owners) {
    const key = owner.ownerId.toLowerCase();
    if (seen.has(key)) return true;
    seen.add(key);
  }

  return false;
}

async function listOwners() {
  return prisma.caseOwner.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
}

export async function GET() {
  const owners = await listOwners();
  return NextResponse.json({ owners });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OwnerInput;
    const data = normalizeOwnerInput(body);

    const owner = await prisma.caseOwner.create({
      data: {
        name: data.name,
        ownerId: data.ownerId,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ owner }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save employee";
    const status = message.includes("Unique constraint") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as { owners?: OwnerInput[] };
    const owners = Array.isArray(body.owners)
      ? body.owners.map((owner) => normalizeOwnerInput(owner, true))
      : [];

    if (!owners.length) {
      return NextResponse.json({ error: "At least one employee record is required" }, { status: 400 });
    }

    if (hasDuplicateOwnerIds(owners)) {
      return NextResponse.json({ error: "Owner ids must be unique" }, { status: 409 });
    }

    await prisma.$transaction([
      prisma.caseOwner.deleteMany(),
      prisma.caseOwner.createMany({
        data: owners,
      }),
    ]);

    return NextResponse.json({ owners: await listOwners() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to replace employee master";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
