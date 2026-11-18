import type { Metadata } from "next";
import { PageIntro } from "@/components/shared";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Wooden Objects & Products",
  description:
    "Explore wooden desk organisers, book rests, quill holders and candle pedestals. Browse product photographs and enquire directly on WhatsApp.",
};

export default function Products() {
  return (
    <>
      <PageIntro
        eyebrow="THE WOODEN OBJECTS COLLECTION"
        title="Small objects. Lasting character."
        description="For a well-loved desk, a favourite reading corner, or a thoughtful gift. Discover the warmth of wood in the everyday."
      />
      <section
        className="wrap collection-section"
        aria-label="Product collection"
      >
        <div className="collection-heading">
          <span>{products.length} wooden pieces</span>
          <span>Explore a piece to enquire on WhatsApp</span>
        </div>
        <div className="collection-grid">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} index={index} />
          ))}
        </div>
      </section>
    </>
  );
}
