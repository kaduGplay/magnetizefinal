// Facebook Pixel ID
const FB_PIXEL_ID = "814730385061712";

// Declare fbq for TypeScript
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

// Pixel base script is loaded from index.html. This is a no-op kept for
// backwards compatibility with existing imports.
export const initFacebookPixel = () => {
  if (typeof window === "undefined") return;
  if (!window.fbq) {
    // Fallback: if the inline snippet failed (adblock/CSP), inject it.
    const f = window as any;
    const b = document;
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = b.createElement("script") as HTMLScriptElement;
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    b.getElementsByTagName("script")[0]?.parentNode?.insertBefore(t, b.getElementsByTagName("script")[0]);
    window.fbq("init", FB_PIXEL_ID, {}, { agent: "lovable" });
    window.fbq("track", "PageView");
  }
};

// Generic track helper with retry (fbq may not be ready yet)
// eventID is used for deduplication with the server-side Conversions API
const track = (event: string, params?: Record<string, unknown>, eventID?: string) => {
  if (typeof window === "undefined") return;
  const tryFire = (attempts = 0) => {
    if (window.fbq) {
      if (eventID) {
        window.fbq("track", event, params || {}, { eventID });
      } else {
        window.fbq("track", event, params || {});
      }
      console.log(`[FB Pixel] ${event}`, params || "", eventID ? `id=${eventID}` : "");
    } else if (attempts < 20) {
      setTimeout(() => tryFire(attempts + 1), 300);
    }
  };
  tryFire();
};


export const trackPageView = () => track("PageView");
export const trackLead = (data?: { content_name?: string; value?: number }) =>
  track("Lead", { currency: "BRL", ...data });
export const trackCompleteRegistration = (data?: { content_name?: string; value?: number }) =>
  track("CompleteRegistration", { currency: "BRL", status: true, ...data });
export const trackInitiateCheckout = (data?: { content_name?: string; value?: number; num_items?: number }) =>
  track("InitiateCheckout", { currency: "BRL", ...data });
export const trackAddPaymentInfo = (data?: { content_name?: string; value?: number }) =>
  track("AddPaymentInfo", { currency: "BRL", ...data });
export const trackAddToCart = (data?: { content_name?: string; value?: number }) =>
  track("AddToCart", { currency: "BRL", ...data });
export const trackContact = () => track("Contact");
export const trackSearch = (search_string: string) => track("Search", { search_string });

// Track ViewContent event (for Checkout page)
export const trackViewContent = (data?: { content_name?: string; value?: number; currency?: string }) =>
  track("ViewContent", {
    content_name: data?.content_name || "Checkout",
    value: data?.value || 0,
    currency: data?.currency || "BRL",
  });

// Track Purchase event (for ThankYou page)
// Pass eventID (same value the server sends) so Meta deduplicates
export const trackPurchase = (data?: {
  value?: number;
  currency?: string;
  content_name?: string;
  eventID?: string;
}) =>
  track(
    "Purchase",
    {
      value: data?.value || 0,
      currency: data?.currency || "BRL",
      content_name: data?.content_name || "Plano Magnetize",
    },
    data?.eventID
  );

