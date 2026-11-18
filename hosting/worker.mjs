import { enquirySchema } from "../src/lib/schema.ts";
import { statuses } from "../src/lib/data.ts";
import { imageKind, maxFileSize } from "../src/lib/image-validation.ts";
import { csvCell } from "../src/lib/csv.ts";
const json = (body, status = 200, headers = {}) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
const configured = (env) =>
  !!(env.ADMIN_PASSWORD?.length >= 12 && env.SESSION_SECRET?.length >= 32);
const encoder = new TextEncoder();
async function digest(text) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", encoder.encode(text)),
  );
}
function equal(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
async function hmac(payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return Array.from(
    new Uint8Array(
      await crypto.subtle.sign("HMAC", key, encoder.encode(payload)),
    ),
  )
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
async function authenticated(req, env) {
  if (!configured(env)) return false;
  const value = req.headers
    .get("cookie")
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("gf_admin="))
    ?.slice(9);
  if (!value) return false;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return false;
  try {
    return (
      equal(
        encoder.encode(sig),
        encoder.encode(await hmac(payload, env.SESSION_SECRET)),
      ) && Number(payload) > Date.now()
    );
  } catch {
    return false;
  }
}
async function limited(env, key, max, period) {
  const now = Date.now();
  const row = await env.DB.prepare(
    "INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires < ? THEN 1 ELSE count+1 END, expires=CASE WHEN expires < ? THEN excluded.expires ELSE expires END RETURNING count",
  )
    .bind(key, now + period, now, now)
    .first();
  return row.count > max;
}
function originValid(req) {
  try {
    return new URL(req.headers.get("origin")).host === new URL(req.url).host;
  } catch {
    return false;
  }
}
function record(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    notes: row.notes,
    payload: JSON.parse(row.payload),
  };
}
async function api(req, env) {
  const url = new URL(req.url);
  const p = url.pathname;
  const method = req.method;
  const admin = await authenticated(req, env);
  if (["POST", "PATCH", "DELETE"].includes(method) && !originValid(req))
    return json({ error: "Please submit from this website." }, 403);
  if (p === "/api/admin/login" && method === "GET")
    return json({ authenticated: admin, configured: configured(env) });
  if (p === "/api/admin/login" && method === "POST") {
    if (!configured(env))
      return json(
        {
          error:
            "Admin access is not configured. Set ADMIN_PASSWORD (12+ characters) and SESSION_SECRET (32+ characters) in the server environment.",
        },
        503,
      );
    if (
      await limited(
        env,
        `login:${req.headers.get("cf-connecting-ip") || "shared"}`,
        5,
        15 * 60 * 1000,
      )
    )
      return json(
        { error: "Too many sign-in attempts. Please try again in 15 minutes." },
        429,
      );
    let data;
    try {
      data = await req.json();
    } catch {
      return json({ error: "Invalid sign-in request." }, 400);
    }
    if (
      typeof data.password !== "string" ||
      data.password.length > 300 ||
      !equal(await digest(data.password), await digest(env.ADMIN_PASSWORD))
    )
      return json({ error: "The password is incorrect." }, 401);
    const payload = String(Date.now() + 8 * 60 * 60 * 1000);
    return json({ ok: true }, 200, {
      "Set-Cookie": `gf_admin=${payload}.${await hmac(payload, env.SESSION_SECRET)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`,
    });
  }
  if (p === "/api/admin/logout" && method === "POST")
    return json({ ok: true }, 200, {
      "Set-Cookie":
        "gf_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
    });
  if (p.startsWith("/api/admin/") && !admin)
    return json({ error: "Please sign in to continue." }, 401);
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
      await env.DB.prepare(
        "INSERT INTO enquiries (id,created_at,status,notes,payload) VALUES (?,?,?,?,?)",
      )
        .bind(
          id,
          new Date().toISOString(),
          "New",
          "",
          JSON.stringify({ ...parsed.data, attachments }),
        )
        .run();
      return json({ id, message: "Your enquiry has been received." }, 201);
    } catch (error) {
      await Promise.all(
        attachments.map((a) => env.BUCKET.delete(`${id}/${a.filename}`)),
      );
      throw error;
    }
  }
  if (p === "/api/admin/enquiries" && method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT * FROM enquiries ORDER BY created_at DESC",
    ).all();
    return json({ enquiries: results.map(record) });
  }
  if (
    /^\/api\/admin\/enquiries\/GF-[A-Z0-9-]+$/.test(p) &&
    method === "PATCH"
  ) {
    const id = p.split("/").pop();
    let data;
    try {
      data = await req.json();
    } catch {
      return json({ error: "Invalid update." }, 400);
    }
    if (
      !statuses.includes(data.status) ||
      typeof data.notes !== "string" ||
      data.notes.length > 10000
    )
      return json({ error: "Invalid status or notes." }, 400);
    const existing = await env.DB.prepare("SELECT id FROM enquiries WHERE id=?")
      .bind(id)
      .first();
    if (!existing) return json({ error: "Enquiry not found." }, 404);
    await env.DB.prepare("UPDATE enquiries SET status=?,notes=? WHERE id=?")
      .bind(data.status, data.notes, id)
      .run();
    return json({ ok: true });
  }
  if (p === "/api/admin/export" && method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT * FROM enquiries ORDER BY created_at DESC",
    ).all();
    const rows = [
      [
        "Reference",
        "Created",
        "Status",
        "Name",
        "Email",
        "Mobile",
        "WhatsApp",
        "City",
        "Project",
        "Type",
        "Description",
        "Dimensions",
        "Material",
        "Quantity",
        "Finish",
        "Budget",
        "Timeline",
        "Location",
        "Instructions",
        "Internal notes",
        "Reference image count",
      ],
      ...results.map((row) => {
        const r = record(row),
          v = r.payload;
        return [
          r.id,
          r.createdAt,
          r.status,
          v.name,
          v.email,
          v.mobile,
          v.whatsapp,
          v.city,
          v.title,
          v.projectType,
          v.description,
          v.dimensions,
          v.material,
          v.quantity,
          v.finish,
          v.budget,
          v.timeline,
          v.location,
          v.instructions,
          r.notes,
          v.attachments.length,
        ];
      }),
    ];
    return new Response(
      "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n"),
      {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="grain-form-enquiries.csv"`,
          "Cache-Control": "no-store",
        },
      },
    );
  }
  if (p.startsWith("/api/admin/files/") && method === "GET") {
    const id = p.split("/").pop();
    const eid = url.searchParams.get("enquiry");
    const row = await env.DB.prepare("SELECT * FROM enquiries WHERE id=?")
      .bind(eid)
      .first();
    const attachment =
      row && record(row).payload.attachments.find((a) => a.id === id);
    if (!attachment) return json({ error: "Image not found." }, 404);
    const object = await env.BUCKET.get(`${eid}/${attachment.filename}`);
    if (!object) return json({ error: "Image unavailable." }, 404);
    return new Response(object.body, {
      headers: {
        "Content-Type": attachment.mime,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
      },
    });
  }
  return json({ error: "Endpoint not found." }, 404);
}
export function createWorker(assets) {
  return {
    async fetch(req, env) {
      const url = new URL(req.url);
      if (url.pathname.startsWith("/api/")) {
        try {
          if (!env.DB || !env.BUCKET)
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
