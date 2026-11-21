"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { GA_ID, trackEvent } from "@/lib/analytics";

const KEY = "enteak-analytics-consent";
type Consent = "granted" | "denied" | null;

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Google Analytics 4, loaded only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set and the
 * visitor accepts. Also reports WhatsApp, phone and email link clicks.
 */
export function Analytics() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!GA_ID || consent !== "granted") return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      const href = a?.getAttribute("href") || "";
      if (href.includes("wa.me/"))
        trackEvent("whatsapp_click", { link_location: location.pathname });
      else if (href.startsWith("tel:"))
        trackEvent("phone_click", { link_location: location.pathname });
      else if (href.startsWith("mailto:"))
        trackEvent("email_click", { link_location: location.pathname });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [consent]);

  if (!GA_ID) return null;

  function choose(value: "granted" | "denied") {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
    setConsent(value);
  }

  return (
    <>
      {consent === "granted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {ready && consent === null && (
        <div
          className="consent-banner"
          role="region"
          aria-label="Analytics consent"
        >
          <p>
            We use privacy-friendly analytics to understand how visitors use
            this site. May we?
          </p>
          <div>
            <button type="button" onClick={() => choose("denied")}>
              Decline
            </button>
            <button type="button" onClick={() => choose("granted")}>
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}
