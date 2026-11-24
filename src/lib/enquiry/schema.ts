import { z } from "zod";
import { types } from "@/data/studio";
const phone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s()-]{10,18}$/, "Enter a valid mobile number (10–15 digits).")
  .refine((v) => {
    const n = v.replace(/\D/g, "").length;
    return n >= 10 && n <= 15;
  }, "Enter a valid mobile number.");
export const enquirySchema = z
  .object({
    source: z.enum(["contact", "enquiry"]).optional(),
    projectType: z.enum(types, { error: "Choose a project type." }),
    title: z
      .string()
      .trim()
      .min(3, "Give your project a short title.")
      .max(120),
    description: z
      .string()
      .trim()
      .min(20, "Tell us a little more (at least 20 characters).")
      .max(5000),
    dimensions: z.string().trim().max(200),
    material: z.string().trim().max(100),
    quantity: z
      .string()
      .regex(/^[1-9]\d{0,2}$/, "Enter a quantity from 1 to 999."),
    finish: z.string().trim().max(150),
    budget: z.enum(
      [
        "Under ₹50,000",
        "₹50,000–₹1 lakh",
        "₹1–3 lakh",
        "₹3–5 lakh",
        "₹5–10 lakh",
        "₹10 lakh+",
        "Let’s discuss",
      ],
      { error: "Choose a budget range." },
    ),
    timeline: z.enum(
      ["Within 1 month", "1–3 months", "3–6 months", "6 months+", "Flexible"],
      { error: "Choose an expected timeline." },
    ),
    location: z.string().trim().max(150),
    name: z.string().trim().min(2, "Enter your full name.").max(100),
    mobile: phone,
    whatsapp: z.union([z.literal(""), phone]),
    email: z.union([
      z.literal(""),
      z.email("Enter a valid email address.").max(200),
    ]),
    city: z.string().trim().max(100),
    instructions: z.string().trim().max(3000),
    consent: z
      .boolean()
      .refine((v) => v, "Please agree to be contacted about your enquiry."),
    website: z.string().max(0, "Unable to submit this enquiry."),
  })
  .superRefine((values, ctx) => {
    if (values.source === "contact") return;
    for (const [field, message] of [
      ["email", "Enter a valid email address."],
      ["city", "Enter your city."],
      ["location", "Enter the project location."],
    ] as const) {
      if (values[field].length < (field === "email" ? 1 : 2))
        ctx.addIssue({ code: "custom", path: [field], message });
    }
  });
export type EnquiryInput = z.infer<typeof enquirySchema>;
export const defaults: EnquiryInput = {
  source: "enquiry",
  projectType: "Other Custom Work",
  title: "",
  description: "",
  dimensions: "",
  material: "Not sure — please advise",
  quantity: "1",
  finish: "",
  budget: "Let’s discuss",
  timeline: "Flexible",
  location: "",
  name: "",
  mobile: "",
  whatsapp: "",
  email: "",
  city: "",
  instructions: "",
  consent: false,
  website: "",
};
export type Attachment = {
  id: string;
  name: string;
  mime: string;
  size: number;
  filename: string;
  content?: Uint8Array<ArrayBuffer>;
};
export type EnquiryRecord = {
  id: string;
  createdAt: string;
  status: string;
  notes: string;
  payload: EnquiryInput & { attachments: Attachment[] };
};
