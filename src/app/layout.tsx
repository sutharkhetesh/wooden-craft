import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsApp } from "@/components/layout/whatsapp";
import { business } from "@/lib/config";
import { MotionProvider } from "@/components/motion/motion-provider";
import "@/styles/globals.css";
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
      <body id="page-top">
        <MotionProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <WhatsApp />
        </MotionProvider>
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
