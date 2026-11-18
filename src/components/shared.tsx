import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowUp, MessageCircle, Phone } from "lucide-react";
import { Brand } from "./header";
import { Button } from "./ui/button";
import { business, whatsappUrl } from "@/lib/config";
import { Reveal } from "./reveal";
import { MotionSequence, MotionItem } from "./motion-sequence";
import { products } from "@/lib/products";
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
      <MotionSequence>
        <MotionItem>
          <p className="eyebrow">{eyebrow}</p>
        </MotionItem>
        <MotionItem>
          <h1>{title}</h1>
        </MotionItem>
        <MotionItem>
          <p className="intro-description">{description}</p>
        </MotionItem>
      </MotionSequence>
    </section>
  );
}
export function ProjectCTA() {
  return (
    <section className="project-cta">
      <Reveal className="wrap cta-inner">
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
      </Reveal>
    </section>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-invitation">
        <div>
          <p className="footer-kicker">GOOD THINGS BEGIN WITH A CONVERSATION</p>
          <h2>
            Your next piece.
            <br />
            <em>Let’s make it personal.</em>
          </h2>
        </div>
        <div className="footer-invitation-actions">
          <p>Tell us your idea. Let’s find the right piece for your space.</p>
          <Link href="/enquiry" className="footer-invitation-link">
            <span>Start your project</span>
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
      <div className="wrap footer-grid">
        <div className="footer-brand-column">
          <Brand />
          <p>
            Wooden objects, thoughtful furniture,
            <br />
            and a little warmth for the everyday.
          </p>
          <a
            className="footer-message"
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={16} /> Start a conversation{" "}
            <ArrowUpRight size={14} />
          </a>
        </div>
        <div
          className="footer-links"
          role="navigation"
          aria-label="Footer navigation"
        >
          <h3>Explore the studio</h3>
          <Link href="/about">Our story</Link>
          <Link href="/services">Our expertise</Link>
          <Link href="/work">Selected work</Link>
          <Link href="/products">All products</Link>
          <Link href="/enquiry">Custom enquiries</Link>
        </div>
        <div
          className="footer-links"
          role="navigation"
          aria-label="Footer products"
        >
          <h3>Wooden objects</h3>
          {products.map((product) => (
            <Link key={product.slug} href={`/products/${product.slug}`}>
              {product.name}
            </Link>
          ))}
        </div>
        <div className="footer-contact-column">
          <h3>Let’s connect</h3>
          {business.phone && (
            <a href={`tel:${business.phone}`} className="footer-phone">
              <Phone size={16} />
              {business.phone.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}
            </a>
          )}
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp <ArrowUpRight size={14} />
          </a>
          <Link href="/contact">
            Contact the studio <ArrowUpRight size={14} />
          </Link>
          {business.email && (
            <a href={`mailto:${business.email}`}>{business.email}</a>
          )}
          {business.address && <p>{business.address}</p>}
          {business.hours && <p>{business.hours}</p>}
          <p className="footer-contact-note">
            For product details, custom ideas
            <br />
            and something made for your space.
          </p>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>
          © {new Date().getFullYear()} {business.name}. Crafted with care.
        </span>
        <a href="#page-top" className="footer-back-top">
          Back to top <ArrowUp size={14} />
        </a>
      </div>
      <p className="wrap footer-disclosure">
        Grain & Form is a demonstration brand. Room concepts and reviews are
        illustrative.
      </p>
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
