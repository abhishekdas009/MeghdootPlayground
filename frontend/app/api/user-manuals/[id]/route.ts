import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { password } = await request.json();

    if (password !== (process.env.MANUAL_PASSWORD || "admin123")) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const manual = await prisma.userManualLibrary.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!manual) {
      return NextResponse.json({ error: "Manual not found" }, { status: 404 });
    }

    // Delete file
    const filePath = path.join(process.cwd(), "public", manual.fileUrl.replace(/^\//, ""));
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    await prisma.userManualLibrary.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete manual" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { password, title, description, version } = await request.json();

    if (password !== (process.env.MANUAL_PASSWORD || "admin123")) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const updated = await prisma.userManualLibrary.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        description,
        version
      }
    });

    return NextResponse.json({ manual: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update manual" }, { status: 500 });
  }
}
