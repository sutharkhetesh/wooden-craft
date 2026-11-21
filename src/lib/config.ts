import type { EnquiryInput } from "@/lib/enquiry/schema";

const address =
  process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ||
  "4MMJ+GCQ, Siana- Sirohi Main Road, Shanti Nagar Colony, Siyana, Rajasthan 343024";

export const business = {
  name: "Enteak",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+918905089544",
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918905089544").replace(
    /\D/g,
    "",
  ),
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "",
  address,
  hours: process.env.NEXT_PUBLIC_BUSINESS_HOURS || "",
  mapQuery: process.env.NEXT_PUBLIC_MAP_QUERY || address,
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.enteak.in").replace(
    /\/$/,
    "",
  ),
};
export function whatsappUrl(
  message = "Hello Enteak, I would like to discuss a custom woodwork project.",
) {
  return business.whatsapp
    ? `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`
    : "/enquiry";
}

export function enquiryWhatsappUrl(values: EnquiryInput, reference: string) {
  const message = `Hello Enteak, I would like to discuss my project (enquiry ${reference}).
Project: ${values.title}
Type: ${values.projectType}
Requirements: ${values.description}
Dimensions: ${values.dimensions || "To discuss"}
Material: ${values.material}
Quantity: ${values.quantity}
Finish: ${values.finish || "To discuss"}
Budget: ${values.budget}
Timeline: ${values.timeline}
Location: ${values.location}
Name: ${values.name}
Email: ${values.email}
Mobile: ${values.mobile}
WhatsApp: ${values.whatsapp || values.mobile}
City: ${values.city}
Instructions: ${values.instructions || "None"}
Reference images are not attached to this WhatsApp message.`;
  return whatsappUrl(message);
}
