import Link from "next/link";
import { ArrowUpRight, ArrowUp, MessageCircle, Phone } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { business, whatsappUrl } from "@/lib/config";
import { products } from "@/data/products";
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
        Room concepts and reviews are illustrative.
      </p>
    </footer>
  );
}
