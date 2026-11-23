export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { business } from "@/lib/config";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: "Googlebot-Image", allow: "/" },
    ],
    sitemap: `${business.url}/sitemap.xml`,
  };
}
