import type { Metadata } from "next";
import { PageIntro } from "@/components/shared/page-intro";
import { ProductCard } from "@/components/products/product-card";
import { MotionSequence } from "@/components/motion/motion-sequence";
import { Ticker } from "@/components/motion/ticker";
import { products } from "@/data/products";

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
