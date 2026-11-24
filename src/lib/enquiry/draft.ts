import { z } from "zod";
import { enquirySchema, type EnquiryInput } from "./schema";

export const DRAFT_KEY = "enteak-project-draft-v1";
const fields = [
  "projectType",
  "title",
  "description",
  "dimensions",
  "material",
  "quantity",
  "finish",
  "budget",
  "timeline",
  "location",
  "instructions",
] as const;
const draftSchema = z.object(
  Object.fromEntries(
    fields.map((field) => [field, enquirySchema.shape[field]]),
  ),
);
const lifetime = 7 * 24 * 60 * 60 * 1000;

export function encodeDraft(values: EnquiryInput, now = Date.now()) {
  return JSON.stringify({
    savedAt: now,
    values: Object.fromEntries(fields.map((field) => [field, values[field]])),
  });
}

export function decodeDraft(
  raw: string | null,
  now = Date.now(),
): Partial<EnquiryInput> | null {
  try {
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (
      typeof draft.savedAt !== "number" ||
      draft.savedAt > now ||
      now - draft.savedAt > lifetime
    )
      return null;
    // Partial entries may be unfinished; enforce type and maximum length here.
    if (
      !draft.values ||
      typeof draft.values !== "object" ||
      Array.isArray(draft.values)
    )
      return null;
    const values: Record<string, string> = {};
    for (const field of fields) {
      const value = draft.values[field];
      if (typeof value !== "string" || value.length > 5000) return null;
      values[field] = value;
    }
    // Keep enum values valid, while allowing unfinished free-text fields.
    for (const field of ["projectType", "budget", "timeline"] as const)
      if (!draftSchema.shape[field].safeParse(values[field]).success)
        return null;
    return values as Partial<EnquiryInput>;
  } catch {
    return null;
  }
}
