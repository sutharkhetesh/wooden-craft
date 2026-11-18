import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Brand } from "./header";
import { Button } from "./ui/button";
import { business, whatsappUrl } from "@/lib/config";
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
export function TextLink({
  href,
  children,
  light = false,
}: {
  href: string;
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <Link className={`text-link ${light ? "light" : ""}`} href={href}>
      {children}
      <ArrowUpRight size={17} />
    </Link>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-intro wrap">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="intro-description">{description}</p>
    </section>
  );
}
export function ProjectCTA() {
  return (
    <section className="project-cta">
      <div className="wrap cta-inner">
        <div>
          <p className="eyebrow">LET’S MAKE IT PERSONAL</p>
          <h2>
            Have something
            <br />
            <em>unique in mind?</em>
          </h2>
          <p>Tell us what you imagine. We’ll help bring it to life in wood.</p>
        </div>
        <Button asChild variant="light">
          <Link href="/enquiry">
            Start your custom project
            <ArrowUpRight size={18} />
          </Link>
        </Button>
        <span className="cta-rings" aria-hidden="true" />
      </div>
    </section>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <Brand />
          <p>
            Thoughtfully designed.
            <br />
            Beautifully made. Entirely yours.
          </p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/about">Our story</Link>
          <Link href="/services">Our expertise</Link>
          <Link href="/work">Selected work</Link>
        </div>
        <div>
          <h3>Let’s connect</h3>
          <Link href="/enquiry">
            Request a custom quote <ArrowUpRight size={13} />
          </Link>
          <Link href="/contact">Visit & contact</Link>
          {business.email && (
            <a href={`mailto:${business.email}`}>{business.email}</a>
          )}
        </div>
        <div>
          <h3>A note on this studio</h3>
          <p>
            Grain & Form is a demonstration brand.
            <br />
            Portfolio concepts and reviews are illustrative.
          </p>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>
          © {new Date().getFullYear()} Grain & Form. Crafted with care.
        </span>
        <span>Natural materials. Lasting relationships.</span>
      </div>
    </footer>
  );
}
export function WhatsApp() {
  return (
    <Link
      className="whatsapp"
      href={whatsappUrl()}
      target={business.whatsapp ? "_blank" : undefined}
      rel="noopener noreferrer"
      aria-label={
        business.whatsapp
          ? "Discuss your project on WhatsApp"
          : "Start a custom project enquiry"
      }
    >
      <MessageCircle size={23} />
    </Link>
  );
}
