export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Sends a GA4 event. No-ops when analytics is not configured or consent has not been given. */
export function trackEvent(
  name: string,
  params: Record<string, string | number | boolean> = {},
) {
  if (typeof window === "undefined" || !GA_ID || !window.gtag) return;
  window.gtag("event", name, { transport_type: "beacon", ...params });
}
