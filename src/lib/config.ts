export const business = {
  name: "Grain & Form",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "",
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, ""),
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "",
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "",
  hours: process.env.NEXT_PUBLIC_BUSINESS_HOURS || "",
  mapQuery: process.env.NEXT_PUBLIC_MAP_QUERY || "",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};
export function whatsappUrl(
  message = "Hello Grain & Form, I would like to discuss a custom woodwork project.",
) {
  return business.whatsapp
    ? `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`
    : "/enquiry";
}
