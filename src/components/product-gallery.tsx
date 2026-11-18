"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { type ProductPhoto, productPhotoUrl } from "@/lib/products";

export function ProductGallery({
  photos,
  name,
}: {
  photos: ProductPhoto[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();
  const photo = photos[selected];
  return (
    <div className="product-gallery" aria-label={`${name} photos`}>
      <div className="product-gallery-toolbar">
        <span className="photo-counter" aria-live="polite">
          {selected + 1} / {photos.length}
        </span>
      </div>
      <div className="product-gallery-stage">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={photo.id}
            className="product-gallery-image"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
          >
            <Image
              src={productPhotoUrl(photo.id)}
              alt={photo.alt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 60vw"
            />
          </motion.div>
        </AnimatePresence>
        {photos.length > 1 && (
          <div className="gallery-arrows">
            <button
              type="button"
              aria-label="Previous product photo"
              onClick={() =>
                setSelected((selected + photos.length - 1) % photos.length)
              }
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next product photo"
              onClick={() => setSelected((selected + 1) % photos.length)}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
      {photos.length > 1 && (
        <div className="product-thumbnails" aria-label="Choose a product view">
          {photos.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`View photo ${index + 1} of ${name}`}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              <Image
                src={productPhotoUrl(item.id)}
                alt={item.alt}
                fill
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
