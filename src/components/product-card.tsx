"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type Product, productPhotoUrl } from "@/lib/products";
import { motion, useReducedMotion } from "framer-motion";
import { sequenceItemVariants } from "./motion-sequence";

export function ProductCard({ product }: { product: Product }) {
  const reduced = useReducedMotion();
  return (
    <motion.article
      className="collection-card"
      variants={sequenceItemVariants(reduced)}
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
    >
      <Link href={`/products/${product.slug}`} className="collection-card-link">
        <div className="collection-card-photo">
          <Image
            src={productPhotoUrl(product.photos[0].id)}
            alt={product.photos[0].alt}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
          />
          <span className="collection-card-arrow">
            <ArrowUpRight size={20} />
          </span>
        </div>
        <div className="collection-card-copy">
          <p className="eyebrow">{product.category}</p>
          <h3>{product.name}</h3>
          <p>{product.tagline}</p>
          <span className="small-link">
            Explore the piece <ArrowUpRight size={14} />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
