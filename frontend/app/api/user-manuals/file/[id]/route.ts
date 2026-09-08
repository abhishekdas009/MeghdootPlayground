import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const manual = await prisma.userManualLibrary.findUnique({
      where: { id: resolvedParams.id },
      select: {
        fileName: true,
        fileData: true
      }
    });

    if (!manual || !manual.fileData) {
      return new NextResponse("File not found", { status: 404 });
    }

    const ext = manual.fileName.split('.').pop()?.toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === "pdf") contentType = "application/pdf";
    else if (ext === "png") contentType = "image/png";
    else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    else if (ext === "csv") contentType = "text/csv";
    else if (ext === "xlsx") contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    return new NextResponse(manual.fileData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${manual.fileName}"`,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
