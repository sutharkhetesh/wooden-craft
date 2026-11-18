import "server-only";
import { NextRequest } from "next/server";
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
