import { enquirySchema } from "../src/lib/enquiry/schema.ts";
import { imageKind, maxFileSize } from "../src/lib/enquiry/image-validation.ts";
import { saveDatabaseEnquiry } from "./database.mjs";
const json = (body, status = 200, headers = {}) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
async function limited(env, key, max, period) {
  // Each Worker instance keeps its own counters; no persistent service is used.
  let limits = rateLimits.get(env);
  if (!limits) rateLimits.set(env, (limits = new Map()));
  const now = Date.now();
  for (const [k, value] of limits) if (value.expires <= now) limits.delete(k);
  let current = limits.get(key);
  if (!current) {
    current = { count: 0, expires: now + period };
    limits.set(key, current);
  }
  return ++current.count > max;
}
const rateLimits = new WeakMap();
function originValid(req) {
  try {
    return new URL(req.headers.get("origin")).host === new URL(req.url).host;
  } catch {
    return false;
  }
}
const recordKey = (id) => `enquiries/${id}.json`;
async function saveEnquiry(env, record) {
  if (env.DATABASE_URL) {
    await saveDatabaseEnquiry(env.DATABASE_URL, record);
    return;
  }
  await env.BUCKET.put(recordKey(record.id), JSON.stringify(record), {
    httpMetadata: { contentType: "application/json" },
  });
}
async function api(req, env) {
  const url = new URL(req.url);
  const p = url.pathname;
  const method = req.method;
  if (["POST", "PATCH", "DELETE"].includes(method) && !originValid(req))
    return json({ error: "Please submit from this website." }, 403);
  if (p === "/api/enquiries" && method === "POST") {
    if (
      await limited(
        env,
        `enquiry:${req.headers.get("cf-connecting-ip") || "shared"}`,
        10,
        60 * 60 * 1000,
      )
    )
      return json(
        { error: "Too many enquiries. Please try again later." },
        429,
      );
    if (Number(req.headers.get("content-length") || 0) > 22 * 1024 * 1024)
      return json({ error: "Your upload is too large." }, 413);
    let form, parsed;
    try {
      form = await req.formData();
      const raw = form.get("data");
      if (typeof raw !== "string" || raw.length > 20000) throw Error();
      parsed = enquirySchema.safeParse(JSON.parse(raw));
    } catch {
      return json({ error: "Invalid enquiry." }, 400);
    }
    if (!parsed.success)
      return json(
        {
          error:
            parsed.error.issues[0]?.message || "Please check your details.",
        },
        400,
      );
    const files = form.getAll("images");
    if (files.length > 5)
      return json({ error: "Upload up to 5 reference images." }, 400);
    const validated = [];
    for (const file of files) {
      if (!(file instanceof File) || !file.size || file.size > maxFileSize)
        return json(
          {
            error:
              "Each reference must be a JPG, PNG or WebP smaller than 4 MB.",
          },
          400,
        );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const kind = imageKind(bytes);
      if (!kind || kind.mime !== file.type)
        return json(
          { error: "Only valid JPG, PNG and WebP images are supported." },
          400,
        );
      validated.push({ file, bytes, kind });
    }
    const id = `GF-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const attachments = [];
    try {
      for (const { file, bytes, kind } of validated) {
        const fid = crypto.randomUUID();
        const filename = `${fid}.${kind.extension}`;
        await env.BUCKET.put(`${id}/${filename}`, bytes, {
          httpMetadata: { contentType: kind.mime },
        });
        attachments.push({
          id: fid,
          filename,
          mime: kind.mime,
          size: file.size,
          name: file.name
            .split(/[\\/]/)
            .pop()
            .replace(/[\x00-\x1f\x7f]/g, "")
            .slice(0, 120),
        });
      }
      await saveEnquiry(env, {
        id,
        createdAt: new Date().toISOString(),
        status: "New",
        notes: "",
        payload: { ...parsed.data, attachments },
      });
      return json({ id, message: "Your enquiry has been received." }, 201);
    } catch (error) {
      await Promise.all(
        attachments.map((a) => env.BUCKET.delete(`${id}/${a.filename}`)),
      );
      throw error;
    }
  }
  return json({ error: "Endpoint not found." }, 404);
}
export function createWorker(assets) {
  return {
    async fetch(req, env) {
      const url = new URL(req.url);
      if (url.pathname.startsWith("/api/")) {
        try {
          if (url.pathname !== "/api/enquiries")
            return json({ error: "Endpoint not found." }, 404);
          if (!env.BUCKET)
            return json({ error: "Storage is not configured." }, 503);
          return await api(req, env);
        } catch {
          return json(
            {
              error:
                "The studio is temporarily unavailable. Please try again shortly.",
            },
            503,
          );
        }
      }
      if (!["GET", "HEAD"].includes(req.method))
        return new Response("Method not allowed", { status: 405 });
      let pathname;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        return new Response("Bad request", { status: 400 });
      }
      const normalized = pathname.replace(/\/$/, "") || "/";
      let asset =
        assets[pathname] ||
        assets[normalized] ||
        assets[`${normalized}.html`] ||
        assets[`${normalized}/index.html`];
      if (normalized === "/") asset = assets["/index.html"];
      const status = asset ? 200 : 404;
      asset ||= assets["/404.html"];
      if (!asset) return new Response("Page not found", { status: 404 });
      const bytes = Uint8Array.from(atob(asset.data), (c) => c.charCodeAt(0));
      return new Response(req.method === "HEAD" ? null : bytes, {
        status,
        headers: {
          "Content-Type": asset.type,
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "Cache-Control": pathname.startsWith("/_next/")
            ? "public, max-age=31536000, immutable"
            : "public, max-age=0, must-revalidate",
        },
      });
    },
  };
}
