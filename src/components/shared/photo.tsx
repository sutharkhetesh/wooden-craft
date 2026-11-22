import Image from "next/image";
import { ParallaxLayer } from "@/components/motion/parallax-layer";
export function Photo({
  name,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  parallax = false,
  parallaxFromTop = false,
}: {
  name: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  parallax?: boolean;
  parallaxFromTop?: boolean;
}) {
  const image = (
    <Image
      src={`/images/${name}.jpg`}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
    />
  );
  return (
    <div className={`photo ${className}`}>
      {parallax ? (
        <ParallaxLayer fromTop={parallaxFromTop}>{image}</ParallaxLayer>
      ) : (
        image
      )}
    </div>
  );
}
