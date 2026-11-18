import { NextRequest, NextResponse } from "next/server";
import { sameOrigin, sessionCookie } from "@/lib/security";
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie, "", { maxAge: 0, path: "/" });
  return response;
}
