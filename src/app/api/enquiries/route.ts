import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { enquirySchema } from "@/lib/enquiry/schema";
import { saveEnquiry } from "@/lib/server/storage";
import { storeUploads, removeUploads } from "@/lib/server/uploads";
import { sameOrigin, limited, clientKey } from "@/lib/server/security";
import { notifyEnquiry } from "@/lib/server/notifications";
import { storageErrorDetails } from "@/lib/server/storage-error";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Please submit from this website." },
      { status: 403 },
    );
  if (limited(`enquiry:${clientKey(req)}`, 10, 60 * 60 * 1000))
    return NextResponse.json(
      { error: "Too many enquiries. Please try again later." },
      { status: 429 },
    );
  if (Number(req.headers.get("content-length") || 0) > 22 * 1024 * 1024)
    return NextResponse.json(
      { error: "Your upload is too large." },
      { status: 413 },
    );
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Unable to read your enquiry. Please try again." },
      { status: 400 },
    );
  }
  const raw = form.get("data");
  if (typeof raw !== "string" || raw.length > 20000)
    return NextResponse.json({ error: "Invalid enquiry." }, { status: 400 });
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid enquiry." }, { status: 400 });
  }
  const parsed = enquirySchema.safeParse(data);
  if (!parsed.success)
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message || "Please check your details.",
      },
      { status: 400 },
    );
  const candidates = form.getAll("images");
  if (candidates.some((f) => !(f instanceof File)))
    return NextResponse.json(
      { error: "Invalid reference image." },
      { status: 400 },
    );
  const id = `GF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 8).toUpperCase()}`;
  let attachments;
  try {
    attachments = await storeUploads(candidates as File[], id);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save reference images.",
      },
      { status: 400 },
    );
  }
  try {
    const record = {
      id,
      createdAt: new Date().toISOString(),
      status: "New",
      notes: "",
      payload: { ...parsed.data, attachments },
    };
    await saveEnquiry(record);
    await notifyEnquiry(
      {
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
        ENQUIRY_NOTIFICATION_EMAIL: process.env.ENQUIRY_NOTIFICATION_EMAIL,
      },
      record,
    );
    return NextResponse.json(
      { id, message: "Your enquiry has been received." },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (attachments.length > 0) await removeUploads(id);
    console.error("Enquiry storage failed:", {
      ...storageErrorDetails(error),
      reference: id,
    });
    return NextResponse.json(
      { error: "We couldn’t save your enquiry. Please try again shortly." },
      { status: 503 },
    );
  }
}
