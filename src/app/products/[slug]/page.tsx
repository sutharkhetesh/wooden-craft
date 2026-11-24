import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MessageCircle } from "lucide-react";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductCard } from "@/components/products/product-card";
import {
  MotionSequence,
  MotionItem,
} from "@/components/motion/motion-sequence";
import { products, productPhotoUrl } from "@/data/products";
import { whatsappUrl } from "@/lib/config";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((product) => product.slug === slug);
  if (!product) return { title: "Product not found" };
  return pageMetadata({
    title: `${product.name} — Handcrafted Wooden ${product.category.includes("Objects") ? "Accent" : "Piece"}`,
    description: product.description,
    path: `/products/${product.slug}`,
    image: {
      url: productPhotoUrl(product.photos[0].id),
      alt: product.photos[0].alt,
    },
  });
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((product) => product.slug === slug);
  if (!product) notFound();
  return (
    <div className="wrap product-detail-wrap">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Collection", path: "/products" },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            category: product.category,
            url: absoluteUrl(`/products/${product.slug}`),
            image: product.photos.map((p) =>
              absoluteUrl(productPhotoUrl(p.id)),
            ),
            brand: { "@type": "Brand", name: "Enteak" },
          },
        ]}
      />
      <Link href="/products" className="collection-back">
        <ArrowLeft size={15} /> Back to the collection
      </Link>
      <section className="product-detail">
        <ProductGallery photos={product.photos} name={product.name} />
        <MotionSequence className="product-information">
          <MotionItem>
            <p className="eyebrow">{product.category}</p>
          </MotionItem>
          <MotionItem>
            <h1>{product.name}</h1>
          </MotionItem>
          <MotionItem>
            <p className="product-tagline">{product.tagline}</p>
          </MotionItem>
          <MotionItem>
            <p className="product-description">{product.description}</p>
          </MotionItem>
          <MotionItem>
            <ul className="product-features">
              {product.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </MotionItem>
          <MotionItem>
            <dl className="product-specifications">
              {[
                ["Price", "Personalised quote from the studio"],
                ["Dimensions", "Exact measurements to be confirmed"],
                ["Material", "Wood; species to be confirmed by the studio"],
                ["Appearance / finish", product.finish],
                [
                  "Availability & delivery",
                  "Confirm for your quantity and location",
                ],
                [
                  "Included accessories",
                  "Confirm what is included; styling items may be separate",
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </MotionItem>
          <MotionItem className="product-enquiry">
            <p>Make it part of your everyday.</p>
            <a
              href={whatsappUrl(
                `Hello Enteak, I am interested in ${product.name}. Please share the price, dimensions, availability and what is included.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-dark"
            >
              <MessageCircle size={18} /> Enquire on WhatsApp{" "}
              <ArrowUpRight size={16} />
            </a>
            <Link
              href={`/enquiry?type=Other%20Custom%20Work&title=${encodeURIComponent(product.name)}`}
              className="text-link"
            >
              Discuss a custom version <ArrowUpRight size={16} />
            </Link>
            <span>
              Ask us about price, dimensions, finish and included accessories.
            </span>
          </MotionItem>
        </MotionSequence>
      </section>
      <section
        className="related-products"
        aria-label="More from the collection"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">BETTER TOGETHER</p>
            <h2>
              A few more <em>possibilities.</em>
            </h2>
          </div>
        </div>
        <MotionSequence className="collection-grid">
          {products
            .filter((item) => item.slug !== slug)
            .slice(0, 3)
            .map((item) => (
              <ProductCard product={item} key={item.slug} />
            ))}
        </MotionSequence>
      </section>
    </div>
  );
}
