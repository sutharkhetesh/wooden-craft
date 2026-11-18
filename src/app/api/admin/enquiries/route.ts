import { NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/security";
import { listEnquiries } from "@/lib/storage";
export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  try {
    return NextResponse.json(
      { enquiries: await listEnquiries() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to load enquiries. Check the storage configuration." },
      { status: 503 },
    );
  }
}
