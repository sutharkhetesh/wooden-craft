"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type TouchEvent,
} from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut } from "lucide-react";
import { type ProductPhoto, productPhotoUrl } from "@/data/products";
import {
  sequenceVariants,
  sequenceItemVariants,
} from "@/components/motion/motion-sequence";

export function ProductGallery({
  photos,
  name,
}: {
  photos: ProductPhoto[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const touchPan = useRef<{
    x: number;
    y: number;
    origin: { x: number; y: number };
  } | null>(null);
  const updatePosition = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({
      x: Math.max(0.2, Math.min(0.8, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0.2, Math.min(0.8, (event.clientY - rect.top) / rect.height)),
    });
  };
  const selectionId = useId();
  const reduced = useReducedMotion();
  const photo = photos[selected];
  const selectPhoto = (index: number, movement = index > selected ? 1 : -1) => {
    setDirection(movement);
    setSelected(index);
    setZoomed(false);
  };
  const movePhoto = (movement: number) => {
    selectPhoto(
      (selected + movement + photos.length) % photos.length,
      movement,
    );
  };
  const startSwipe = (event: TouchEvent) => {
    suppressClick.current = false;
    touchStart.current =
      event.touches.length === 1
        ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
        : null;
  };
  const endSwipe = (event: TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (
      Math.abs(dx) <= 10 &&
      Math.abs(dy) <= 10 &&
      event.target instanceof Element &&
      event.target.closest(".gallery-zoom-trigger")
    ) {
      // Handle taps directly: browsers may suppress the compatibility click after swipes.
      suppressClick.current = true;
      setPosition({ x: 0.5, y: 0.5 });
      setZoomed((current) => !current);
      return;
    }
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) suppressClick.current = true;
    if (zoomed) return;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      suppressClick.current = true;
      if (photos.length > 1) movePhoto(dx < 0 ? 1 : -1);
    }
  };
  const swipeHandlers = {
    onTouchStart: startSwipe,
    onTouchMove: (event: TouchEvent) => {
      if (event.touches.length !== 1) touchStart.current = null;
    },
    onTouchEnd: endSwipe,
    onTouchCancel: () => {
      touchStart.current = null;
    },
  };

  useEffect(() => {
    if (!zoomed) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [zoomed]);

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
      className={`product-gallery${zoomed ? " is-inspecting" : ""}`}
      aria-label={`${name} photos`}
      onKeyDown={(event) => {
        if (event.key === "Escape") setZoomed(false);
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          movePhoto(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
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
        className={`product-gallery-stage${zoomed ? " is-zoomed" : ""}`}
        variants={sequenceItemVariants(reduced)}
        {...swipeHandlers}
      >
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={photo.id}
            className="product-gallery-image"
            style={
              zoomed
                ? {
                    transformOrigin: `${((position.x - 0.2) / 0.6) * 100}% ${((position.y - 0.2) / 0.6) * 100}%`,
                  }
                : undefined
            }
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
        <button
          type="button"
          className="gallery-zoom-trigger"
          aria-label={zoomed ? "Close product zoom" : `Zoom photo of ${name}`}
          aria-pressed={zoomed}
          onPointerEnter={(event) => {
            if (event.pointerType !== "mouse") return;
            updatePosition(event);
            setZoomed(true);
          }}
          onPointerMove={(event) => {
            if (event.pointerType === "mouse") updatePosition(event);
            else if (zoomed && touchPan.current) {
              const start = touchPan.current;
              const rect = event.currentTarget.getBoundingClientRect();
              setPosition({
                x: Math.max(
                  0.2,
                  Math.min(
                    0.8,
                    start.origin.x -
                      (event.clientX - start.x) / (rect.width * 2.5),
                  ),
                ),
                y: Math.max(
                  0.2,
                  Math.min(
                    0.8,
                    start.origin.y -
                      (event.clientY - start.y) / (rect.height * 2.5),
                  ),
                ),
              });
            }
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") setZoomed(false);
          }}
          onPointerDown={(event) => {
            if (event.pointerType === "touch" && zoomed) {
              touchPan.current = {
                x: event.clientX,
                y: event.clientY,
                origin: position,
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }
          }}
          onPointerUp={() => {
            touchPan.current = null;
          }}
          onPointerCancel={() => {
            touchPan.current = null;
          }}
          onClick={(event) => {
            if (suppressClick.current) {
              suppressClick.current = false;
              return;
            }
            // Hover already opens the desktop preview. Tap toggles inline zoom.
            if (
              event.detail === 0 ||
              !window.matchMedia("(hover: hover) and (pointer: fine)").matches
            ) {
              setPosition({ x: 0.5, y: 0.5 });
              setZoomed(!zoomed);
            }
          }}
        >
          {zoomed && (
            <span
              className="gallery-zoom-lens"
              style={{
                left: `${(position.x - 0.2) * 100}%`,
                top: `${(position.y - 0.2) * 100}%`,
              }}
            />
          )}
          <span className="gallery-zoom-label">
            {zoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
            {zoomed ? "Zoom active · Esc to close" : "Hover or tap to zoom"}
          </span>
        </button>
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
      {zoomed && (
        <div
          className="gallery-zoom-preview"
          role="region"
          aria-label={`Magnified detail of ${name}`}
        >
          <div
            className="gallery-zoom-detail"
            style={{
              left: `${50 - position.x * 250}%`,
              top: `${50 - position.y * 250}%`,
            }}
          >
            <Image
              src={productPhotoUrl(photo.id)}
              alt={`Magnified: ${photo.alt}`}
              fill
              sizes="150vw"
              draggable={false}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
