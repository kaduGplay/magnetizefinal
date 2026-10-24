// TikTok Pixel ID
const TIKTOK_PIXEL_ID = 'D84GFC3C77U26NJHJFQ0';

// Declare ttq for TypeScript
declare global {
  interface Window {
    ttq: any;
    _ttq: any;
  }
}

// Initialize TikTok Pixel (only loads the script once)
export const initTikTokPixel = () => {
  if (typeof window === 'undefined') return;
  if (window.ttq) return; // Already initialized

  const w = window as any;
  const d = document;
  const t = 'ttq';

  w.TiktokAnalyticsObject = t;
  const ttq = w[t] = w[t] || [];

  ttq.methods = [
    "page", "track", "identify", "instances", "debug", "on", "off", "once",
    "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent",
    "revokeConsent", "grantConsent"
  ];

  ttq.setAndDefer = function(obj: any, method: string) {
    obj[method] = function() {
      obj.push([method].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };

  for (let i = 0; i < ttq.methods.length; i++) {
    ttq.setAndDefer(ttq, ttq.methods[i]);
  }

  ttq.instance = function(t: string) {
    const e = ttq._i[t] || [];
    for (let n = 0; n < ttq.methods.length; n++) {
      ttq.setAndDefer(e, ttq.methods[n]);
    }
    return e;
  };

  ttq.load = function(e: string, n?: any) {
    const r = "https://analytics.tiktok.com/i18n/pixel/events.js";
    const o = n && n.partner;
    ttq._i = ttq._i || {};
    ttq._i[e] = [];
    ttq._i[e]._u = r;
    ttq._t = ttq._t || {};
    ttq._t[e] = +new Date();
    ttq._o = ttq._o || {};
    ttq._o[e] = n || {};

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = r + "?sdkid=" + e + "&lib=" + t;

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);
  };

  ttq.load(TIKTOK_PIXEL_ID);
  ttq.page();
};

// Track custom events
export const trackTikTokEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window === 'undefined') return;

  const tryTrack = (attempts = 0) => {
    if (window.ttq) {
      window.ttq.track(eventName, data || {});
      console.log('[TikTok Pixel] Event tracked:', eventName, data);
    } else if (attempts < 20) {
      setTimeout(() => tryTrack(attempts + 1), 500);
    } else {
      console.warn('[TikTok Pixel] Failed to track event after retries:', eventName);
    }
  };

  setTimeout(() => tryTrack(), 100);
};

// Specific event helpers
export const trackViewContent = (data?: { content_name?: string; value?: number; currency?: string }) => {
  trackTikTokEvent('ViewContent', {
    content_name: data?.content_name || 'Checkout',
    value: data?.value || 0,
    currency: data?.currency || 'BRL',
  });
};

export const trackPurchase = (data?: { value?: number; currency?: string; content_name?: string; content_type?: string }) => {
  trackTikTokEvent('Purchase', {
    value: data?.value || 0,
    currency: data?.currency || 'BRL',
    content_name: data?.content_name || 'Plano Magnetize',
    content_type: data?.content_type || 'product',
  });
};

export const trackInitiateCheckout = (data?: { value?: number; currency?: string; content_name?: string }) => {
  trackTikTokEvent('InitiateCheckout', {
    value: data?.value || 0,
    currency: data?.currency || 'BRL',
    content_name: data?.content_name || 'Checkout',
  });
};

export const trackCompleteRegistration = (data?: { value?: number; currency?: string }) => {
  trackTikTokEvent('CompleteRegistration', {
    value: data?.value || 0,
    currency: data?.currency || 'BRL',
  });
};

export const trackAddToCart = (data?: { value?: number; currency?: string; content_name?: string }) => {
  trackTikTokEvent('AddToCart', {
    value: data?.value || 0,
    currency: data?.currency || 'BRL',
    content_name: data?.content_name || 'Créditos',
  });
};

export const trackClickButton = (buttonName: string) => {
  trackTikTokEvent('ClickButton', {
    button_name: buttonName,
  });
};
