import { NextRequest, NextResponse } from "next/server";
import {
  sameOrigin,
  limited,
  clientKey,
  adminConfigured,
  checkPassword,
  makeSession,
  sessionCookie,
  isAdmin,
} from "@/lib/security";
export async function GET() {
  return NextResponse.json(
    { authenticated: await isAdmin(), configured: adminConfigured() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  if (!adminConfigured())
    return NextResponse.json(
      {
        error:
          "Admin access needs configuration. Set ADMIN_PASSWORD (12+ characters) and SESSION_SECRET (32+ characters) in the server environment.",
      },
      { status: 503 },
    );
  if (limited(`login:${clientKey(req)}`, 5, 15 * 60 * 1000))
    return NextResponse.json(
      { error: "Too many sign-in attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  try {
    const { password } = await req.json();
    if (
      typeof password !== "string" ||
      password.length > 300 ||
      !checkPassword(password)
    )
      return NextResponse.json(
        { error: "The password is incorrect." },
        { status: 401 },
      );
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookie, makeSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid sign-in request." },
      { status: 400 },
    );
  }
}
