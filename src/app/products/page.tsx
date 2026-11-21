import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { PageIntro } from "@/components/shared/page-intro";
import { ProductCard } from "@/components/products/product-card";
import { MotionSequence } from "@/components/motion/motion-sequence";
import { Ticker } from "@/components/motion/ticker";
import { products } from "@/data/products";

export const metadata: Metadata = pageMetadata({
  title: "Handcrafted Wooden Desk Accessories & Objects",
  description:
    "Handcrafted wooden desk organisers, book rests, quill holders and candle pedestals. Browse photographs and enquire directly on WhatsApp.",
  path: "/products",
});

export default function Products() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([{ name: "Collection", path: "/products" }])}
      />
      <PageIntro
        eyebrow="THE WOODEN OBJECTS COLLECTION"
        title="Small objects. Lasting character."
        description="For a well-loved desk, a favourite reading corner, or a thoughtful gift. Discover the warmth of wood in the everyday."
      />
      <Ticker
        items={products.map((product) => product.name)}
        label="The wooden objects collection"
      />
      <section
        className="wrap collection-section products-page-collection"
        aria-label="Product collection"
      >
        <div className="collection-heading">
          <span>{products.length} wooden pieces</span>
          <span>Explore a piece to enquire on WhatsApp</span>
        </div>
        <MotionSequence className="collection-grid">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </MotionSequence>
      </section>
    </>
  );
}
