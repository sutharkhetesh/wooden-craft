import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer, WhatsApp } from "@/components/shared";
import { business } from "@/lib/config";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(business.url),
  title: {
    default: "Grain & Form — Crafted From Wood. Designed For You.",
    template: "%s | Grain & Form",
  },
  description:
    "Thoughtfully handcrafted wooden furniture and bespoke interiors, tailored to your space, style and vision. Begin your custom project with Grain & Form.",
  openGraph: {
    type: "website",
    siteName: "Grain & Form",
    title: "Grain & Form — Bespoke Woodwork",
    description: "Thoughtfully designed. Beautifully made. Entirely yours.",
    images: [{ url: "/images/hero.jpg", width: 2200, height: 1467 }],
  },
  twitter: { card: "summary_large_image", images: ["/images/hero.jpg"] },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <WhatsApp />
        {business.address && business.phone && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                name: business.name,
                address: business.address,
                telephone: business.phone,
                url: business.url,
              }).replace(/</g, "\\u003c"),
            }}
          />
        )}
      </body>
    </html>
  );
}
