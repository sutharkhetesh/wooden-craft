import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { statuses } from "@/lib/data";
import { isAdmin, unauthorized, sameOrigin } from "@/lib/security";
import { getEnquiry, saveEnquiry } from "@/lib/storage";
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return unauthorized();
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  try {
    const parsed = z
      .object({ status: z.enum(statuses), notes: z.string().max(10000) })
      .safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid status or notes." },
        { status: 400 },
      );
    const { id } = await params;
    const record = await getEnquiry(id);
    if (!record)
      return NextResponse.json(
        { error: "Enquiry not found." },
        { status: 404 },
      );
    await saveEnquiry({ ...record, ...parsed.data });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to save this update." },
      { status: 503 },
    );
  }
}
