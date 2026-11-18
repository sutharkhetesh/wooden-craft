import Image from "next/image";
export function Photo({
  name,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: {
  name: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`photo ${className}`}>
      <Image
        src={`/images/${name}.jpg`}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
      />
    </div>
  );
}
