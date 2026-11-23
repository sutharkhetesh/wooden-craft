import type { Metadata } from "next";
import { business } from "@/lib/config";

export const SITE_NAME = "Enteak";
export const DEFAULT_OG_IMAGE = {
  url: "/images/hero.jpg",
  width: 2200,
  height: 1467,
  alt: "Warm, sunlit living room with natural wooden furniture",
};

export const absoluteUrl = (path = "/") =>
  `${business.url.replace(/\/$/, "")}${path === "/" ? "" : path}`;

type PageMeta = {
  title: string;
  description: string;
  path: string;
  /** Use the title exactly as written, without the "| Enteak" suffix. */
  absoluteTitle?: boolean;
  image?: { url: string; width?: number; height?: number; alt?: string };
  noindex?: boolean;
};

/** Per-page metadata with a self-referencing canonical, Open Graph and Twitter tags. */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  image = DEFAULT_OG_IMAGE,
  noindex,
}: PageMeta): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      title: fullTitle,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image.url],
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Parses the configured one-line address; only returns fields we can read from it. */
function postalAddress() {
  const parts = business.address.split(",").map((s) => s.trim());
  const postal = business.address.match(/\b\d{6}\b/)?.[0];
  const region = /rajasthan/i.test(business.address) ? "Rajasthan" : undefined;
  const locality = parts.find((p) => /^siyana$/i.test(p));
  return {
    "@type": "PostalAddress",
    streetAddress: business.address,
    ...(locality && { addressLocality: locality }),
    ...(region && { addressRegion: region }),
    ...(postal && { postalCode: postal }),
    addressCountry: "IN",
  };
}

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "FurnitureStore"],
      "@id": `${absoluteUrl("/")}#organization`,
      name: business.name,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/icon-512x512.png"),
      image: absoluteUrl(DEFAULT_OG_IMAGE.url),
      description:
        "Handcrafted wooden furniture, bespoke kitchens, wardrobes and custom interior woodwork.",
      ...(business.phone && { telephone: business.phone }),
      ...(business.email && { email: business.email }),
      address: postalAddress(),
      ...(business.hours && { openingHours: business.hours }),
      sameAs: [] as string[],
    },
    {
      "@type": "WebSite",
      "@id": `${absoluteUrl("/")}#website`,
      url: absoluteUrl("/"),
      name: SITE_NAME,
      inLanguage: "en-IN",
      publisher: { "@id": `${absoluteUrl("/")}#organization` },
    },
  ],
});

export const breadcrumbJsonLd = (trail: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", path: "/" }, ...trail].map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    item: absoluteUrl(t.path),
  })),
});
