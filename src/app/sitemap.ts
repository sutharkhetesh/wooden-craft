export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { business } from "@/lib/config";
import { projects } from "@/data/studio";
import { products } from "@/data/products";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/about",
    "/services",
    "/work",
    "/products",
    "/enquiry",
    "/contact",
    ...projects.map((p) => `/work/${p.slug}`),
    ...products.map((p) => `/products/${p.slug}`),
  ].map((path) => ({
    url: `${business.url}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
