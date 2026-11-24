import type { EnquiryRecord } from "../enquiry/schema";

type NotificationConfig = {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  ENQUIRY_NOTIFICATION_EMAIL?: string;
};

// Called only after durable storage succeeds. Notification failure must never
// turn a saved enquiry into a failed submission and cause duplicate retries.
export async function notifyEnquiry(
  config: NotificationConfig,
  record: EnquiryRecord,
) {
  if (!config.RESEND_API_KEY) return;
  if (
    !config.RESEND_FROM_EMAIL?.trim() ||
    !config.ENQUIRY_NOTIFICATION_EMAIL?.trim()
  ) {
    console.error(
      "Resend notification skipped: configure RESEND_FROM_EMAIL and ENQUIRY_NOTIFICATION_EMAIL.",
    );
    return;
  }
  const values = record.payload;
  const text = [
    "A new Enteak enquiry has been saved.",
    `Reference: ${record.id}`,
    `Received (UTC): ${record.createdAt}`,
    `Source: ${values.source || "enquiry"}`,
    "",
    `Name: ${values.name}`,
    `Mobile: ${values.mobile}`,
    `WhatsApp: ${values.whatsapp || values.mobile}`,
    `Email: ${values.email || "Not provided"}`,
    `City: ${values.city || "To discuss"}`,
    "",
    `Project: ${values.title}`,
    `Type: ${values.projectType}`,
    `Requirements: ${values.description}`,
    `Dimensions: ${values.dimensions || "To discuss"}`,
    `Material: ${values.material || "To discuss"}`,
    `Quantity: ${values.quantity}`,
    `Finish: ${values.finish || "To discuss"}`,
    `Budget: ${values.budget}`,
    `Timeline: ${values.timeline}`,
    `Location: ${values.location || "To discuss"}`,
    `Instructions: ${values.instructions || "None"}`,
    "",
    `Reference images: ${values.attachments.length} (stored privately; not attached to this email).`,
  ].join("\n");
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `enquiry-alert/${record.id}`,
      },
      body: JSON.stringify({
        from: config.RESEND_FROM_EMAIL.trim(),
        to: [config.ENQUIRY_NOTIFICATION_EMAIL.trim()],
        subject: `New Enteak enquiry · ${record.id}`,
        text,
        ...(values.email ? { reply_to: values.email } : {}),
      }),
      signal: AbortSignal.timeout(3000),
      redirect: "error",
    });
    // Never log response bodies: providers may echo customer data or credentials.
    const accepted = response.ok;
    const status = response.status;
    await response.body?.cancel();
    if (!accepted) {
      console.error(
        `Resend notification failed (HTTP ${status}); the enquiry remains saved.`,
      );
    }
  } catch {
    console.error("Resend notification failed; the enquiry remains saved.");
  }
}
