"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { type ProductPhoto, productPhotoUrl } from "@/data/products";
import { sequenceVariants, sequenceItemVariants } from "@/components/motion/motion-sequence";

export function ProductGallery({
  photos,
  name,
}: {
  photos: ProductPhoto[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState(1);
  const selectionId = useId();
  const reduced = useReducedMotion();
  const photo = photos[selected];
  const selectPhoto = (index: number, movement = index > selected ? 1 : -1) => {
    setDirection(movement);
    setSelected(index);
  };
  const slide = {
    enter: (direction: number) => ({
      opacity: reduced ? 1 : 0,
      x: reduced ? 0 : direction * 24,
    }),
    visible: { opacity: 1, x: 0 },
    exit: (direction: number) => ({
      opacity: reduced ? 1 : 0,
      x: reduced ? 0 : direction * -24,
    }),
  };
  return (
    <motion.div
      className="product-gallery"
      aria-label={`${name} photos`}
      variants={sequenceVariants(reduced)}
      initial={reduced ? false : "hidden"}
      animate="visible"
    >
      <motion.div
        className="product-gallery-toolbar"
        variants={sequenceItemVariants(reduced)}
      >
        <span className="photo-counter" aria-live="polite">
          {selected + 1} / {photos.length}
        </span>
      </motion.div>
      <motion.div
        className="product-gallery-stage"
        variants={sequenceItemVariants(reduced)}
      >
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={photo.id}
            className="product-gallery-image"
            custom={direction}
            variants={slide}
            initial={reduced ? false : "enter"}
            animate="visible"
            exit="exit"
            transition={{
              duration: reduced ? 0 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
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
            <motion.button
              type="button"
              aria-label="Previous product photo"
              onClick={() =>
                selectPhoto((selected + photos.length - 1) % photos.length, -1)
              }
              whileHover={reduced ? undefined : { scale: 1.06 }}
              whileTap={reduced ? undefined : { scale: 0.92 }}
            >
              <ArrowLeft size={18} />
            </motion.button>
            <motion.button
              type="button"
              aria-label="Next product photo"
              onClick={() => selectPhoto((selected + 1) % photos.length, 1)}
              whileHover={reduced ? undefined : { scale: 1.06 }}
              whileTap={reduced ? undefined : { scale: 0.92 }}
            >
              <ArrowRight size={18} />
            </motion.button>
          </div>
        )}
      </motion.div>
      {photos.length > 1 && (
        <motion.div
          className="product-thumbnails"
          aria-label="Choose a product view"
          variants={sequenceVariants(reduced)}
        >
          {photos.map((item, index) => (
            <motion.button
              key={item.id}
              type="button"
              aria-label={`View photo ${index + 1} of ${name}`}
              aria-pressed={selected === index}
              onClick={() => selectPhoto(index)}
              variants={sequenceItemVariants(reduced)}
              whileHover={reduced ? undefined : { y: -3 }}
              whileTap={reduced ? undefined : { scale: 0.95 }}
            >
              <Image
                src={productPhotoUrl(item.id)}
                alt={item.alt}
                fill
                sizes="80px"
              />
              {selected === index && (
                <motion.span
                  className="thumbnail-indicator"
                  layoutId={selectionId}
                  transition={{ duration: reduced ? 0 : 0.25 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
