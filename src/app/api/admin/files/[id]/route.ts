import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isAdmin, unauthorized } from "@/lib/security";
import { getEnquiry, dataDirectory } from "@/lib/storage";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await params;
  const enquiryId = req.nextUrl.searchParams.get("enquiry") || "";
  try {
    const record = await getEnquiry(enquiryId);
    const file = record?.payload.attachments.find((a) => a.id === id);
    if (!record || !file)
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    const bytes = await readFile(
      path.join(dataDirectory, "uploads", record.id, file.filename),
    );
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": file.mime,
        "Content-Disposition": `inline; filename="reference.${file.filename.split(".").pop()}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image unavailable." }, { status: 404 });
  }
}
