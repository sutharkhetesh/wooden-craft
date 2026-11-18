import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import { PageIntro } from "@/components/shared/page-intro";
import { ContactForm } from "@/components/forms/contact-form";
import { business, whatsappUrl } from "@/lib/config";
export const metadata: Metadata = {
  title: "Visit & Contact",
  description:
    "Begin a conversation about custom wooden furniture and bespoke interiors. Contact the Grain & Form studio.",
};
export default function Contact() {
  return (
    <>
      <PageIntro
        eyebrow="LET’S BEGIN A CONVERSATION"
        title="Good ideas start with hello."
        description="Whether you have a clear vision or just a feeling, we’d love to hear what you have in mind."
      />
      <section className="wrap contact-layout">
        <div className="contact-info">
          <h2>
            A personal approach.
            <br />
            <em>From the first hello.</em>
          </h2>
          {[
            {
              Icon: Phone,
              title: "Call the studio",
              value: business.phone
                ? business.phone.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")
                : "",
              link: business.phone ? `tel:${business.phone}` : "",
            },
            {
              Icon: MessageCircle,
              title: "A conversation on WhatsApp",
              value: business.whatsapp
                ? `+${business.whatsapp}`.replace(
                    /^\+91(\d{5})(\d{5})$/,
                    "+91 $1 $2",
                  )
                : "",
              link: business.whatsapp ? whatsappUrl() : "",
            },
            {
              Icon: Mail,
              title: "Write to us",
              value: business.email,
              link: business.email ? `mailto:${business.email}` : "",
            },
            {
              Icon: MapPin,
              title: "Visit the studio",
              value: business.address,
              link: "",
            },
            {
              Icon: Clock,
              title: "Studio hours",
              value: business.hours,
              link: "",
            },
          ].map(({ Icon, title, value, link }) => (
            <div className="contact-detail" key={title}>
              <Icon />
              <div>
                <h3>{title}</h3>
                {value ? (
                  link ? (
                    <a href={link}>{value}</a>
                  ) : (
                    <p>{value}</p>
                  )
                ) : (
                  <p>Studio details to be announced</p>
                )}
              </div>
            </div>
          ))}
          <p className="contact-note">
            This is a demonstration studio. For a project conversation, share your
            ideas using the enquiry form.
          </p>
          <Link className="text-link" href="/enquiry">
            Have a specific project? Start here <ArrowUpRight size={16} />
          </Link>
        </div>
        <ContactForm />
      </section>
      <section className="wrap map-section" aria-label="Studio location">
        {business.mapQuery ? (
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(business.mapQuery)}&output=embed`}
            title="Find the Grain & Form studio"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div>
            <MapPin
              size={30}
              style={{ margin: "0 auto 14px", color: "#a77d51" }}
            />
            <p>
              Our studio location will appear here
              <br />
              when the studio opens for visits.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
