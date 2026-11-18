"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { ArrowUpRight, Menu, X, MessageCircle, Phone } from "lucide-react";
import { business, whatsappUrl } from "@/lib/config";
const links = [
  ["Home", "/"],
  ["Our Story", "/about"],
  ["Our Expertise", "/services"],
  ["Our Work", "/work"],
  ["Products", "/products"],
  ["Custom Enquiry", "/enquiry"],
  ["Contact", "/contact"],
];
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Grain and Form home">
      <span className="brand-emblem" aria-hidden="true">
        <span className="brand-mark">
          <i />
          <i />
          <i />
          <i />
        </span>
      </span>
      <span>
        GRAIN <span className="brand-amp">&</span> FORM
        <small>BESPOKE WOODWORK</small>
      </span>
    </Link>
  );
}
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (position) =>
    setScrolled(position > 16),
  );
  const reduced = useReducedMotion();
  const isActive = (url: string) =>
    path === url || (url !== "/" && path.startsWith(`${url}/`));
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1151px)");
    const closeOnDesktop = () => {
      if (wide.matches) setOpen(false);
    };
    wide.addEventListener("change", closeOnDesktop);
    return () => wide.removeEventListener("change", closeOnDesktop);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    navigation.current?.querySelector("a")?.focus({ preventScroll: true });
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (event.key === "Tab") {
        const focusable = Array.from(
          header.current?.querySelectorAll<HTMLElement>("a, button") || [],
        ).filter((element) => element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);
  return (
    <header
      className={`site-header${scrolled ? " is-scrolled" : ""}`}
      ref={header}
    >
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([name, url]) => (
            <Link
              key={url}
              href={url}
              className={isActive(url) ? "active" : ""}
              aria-current={isActive(url) ? "page" : undefined}
            >
              {name}
              {isActive(url) && (
                <motion.span
                  className="nav-active-line"
                  layoutId="main-navigation-active"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 35 }
                  }
                />
              )}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/enquiry" className="header-quote">
            Start a project <ArrowUpRight size={15} />
          </Link>
          <button
            ref={toggle}
            className="menu-toggle"
            aria-controls="mobile-navigation"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-navigation"
            ref={navigation}
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={reduced ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          >
            <div className="mobile-menu-intro">
              <p className="eyebrow">A LITTLE EXPLORATION</p>
              <p>
                Something beautiful.
                <br />
                <em>Something yours.</em>
              </p>
            </div>
            <div className="mobile-menu-links">
              {links.map(([name, url], i) => (
                <motion.div
                  key={url}
                  initial={reduced ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: reduced ? 0 : 0.3,
                    delay: reduced ? 0 : i * 0.035,
                  }}
                >
                  <Link
                    href={url}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(url) ? "page" : undefined}
                  >
                    <span className="nav-index" aria-hidden="true">
                      0{i + 1}
                    </span>
                    <span>{name}</span>
                    <ArrowUpRight size={20} />
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mobile-menu-contact">
              <span>Let’s talk about your next piece.</span>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
              >
                <MessageCircle size={17} /> Message us on WhatsApp{" "}
                <ArrowUpRight size={16} />
              </a>
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  onClick={() => setOpen(false)}
                >
                  <Phone size={15} />
                  {business.phone.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}
                </a>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
