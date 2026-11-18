import "server-only";
import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
export const sessionCookie = "gf_admin";
export function adminConfigured() {
  return Boolean(
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_PASSWORD.length >= 12 &&
    process.env.SESSION_SECRET &&
    process.env.SESSION_SECRET.length >= 32,
  );
}
export function checkPassword(value: string) {
  if (!adminConfigured()) return false;
  return timingSafeEqual(
    createHash("sha256").update(value).digest(),
    createHash("sha256").update(process.env.ADMIN_PASSWORD!).digest(),
  );
}
function sign(payload: string) {
  return createHmac("sha256", process.env.SESSION_SECRET!)
    .update(payload)
    .digest("base64url");
}
export function makeSession() {
  const payload = Buffer.from(
    JSON.stringify({ role: "admin", expires: Date.now() + 8 * 60 * 60 * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export async function isAdmin() {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(sessionCookie)?.value;
  if (!value) return false;
  try {
    const [payload, sig] = value.split(".");
    const expected = sign(payload);
    if (
      !sig ||
      sig.length !== expected.length ||
      !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    )
      return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.role === "admin" && data.expires > Date.now();
  } catch {
    return false;
  }
}
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}
const limits = new Map<string, { count: number; expires: number }>();
export function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  for (const [k, v] of limits) if (v.expires < now) limits.delete(k);
  const current = limits.get(key);
  if (!current) {
    limits.set(key, { count: 1, expires: now + windowMs });
    return false;
  }
  current.count++;
  return current.count > max;
}
export function clientKey(req: NextRequest) {
  return process.env.TRUST_PROXY === "true"
    ? req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown"
    : "shared";
}
export const unauthorized = () =>
  NextResponse.json(
    { error: "Please sign in to continue." },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
