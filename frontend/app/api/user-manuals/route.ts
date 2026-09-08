import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const manuals = await prisma.userManualLibrary.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ manuals });
  } catch (error) {
    return NextResponse.json({ error: "Unable to load user manuals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const password = formData.get("password") as string;
    
    // Check password
    if (password !== (process.env.MANUAL_PASSWORD || "admin123")) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string || "";
    const version = formData.get("version") as string || "New Version";
    const file = formData.get("file") as File | null;

    if (!title || !file) {
      return NextResponse.json({ error: "Title and file are required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file locally to public/manuals
    const manualsDir = path.join(process.cwd(), "public", "manuals");
    if (!existsSync(manualsDir)) {
      await mkdir(manualsDir, { recursive: true });
    }

    // Ensure unique filename
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(manualsDir, fileName);
    await writeFile(filePath, buffer);

    const fileUrl = `/manuals/${fileName}`;

    const manual = await prisma.userManualLibrary.create({
      data: {
        title,
        description,
        version,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
      },
    });

    return NextResponse.json({ manual }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
