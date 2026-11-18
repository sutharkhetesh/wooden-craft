"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
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
      <span className="brand-mark">
        <i />
        <i />
        <i />
        <i />
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
  const reduced = useReducedMotion();
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
    <header className="site-header" ref={header}>
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([name, url]) => (
            <Link key={url} href={url} className={path === url ? "active" : ""}>
              {name}
            </Link>
          ))}
        </nav>
        <Link href="/enquiry" className="header-quote">
          Let’s create something <ArrowUpRight size={15} />
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
                  aria-current={path === url ? "page" : undefined}
                >
                  {name}
                  <ArrowUpRight size={20} />
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
