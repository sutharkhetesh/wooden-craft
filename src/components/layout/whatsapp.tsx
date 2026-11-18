import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { business, whatsappUrl } from "@/lib/config";
export function WhatsApp() {
  return (
    <Link
      className="whatsapp"
      href={whatsappUrl()}
      target={business.whatsapp ? "_blank" : undefined}
      rel="noopener noreferrer"
      aria-label={
        business.whatsapp
          ? "Discuss your project on WhatsApp"
          : "Start a custom project enquiry"
      }
    >
      <MessageCircle size={23} />
    </Link>
  );
}
