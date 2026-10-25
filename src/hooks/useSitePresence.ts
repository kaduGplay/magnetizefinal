import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analyticsEnabled, analyticsPath, analyticsRequest, analyticsVisitorId } from "@/lib/siteAnalytics";

export function useSitePresence() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = analyticsPath(pathname);
    if (!analyticsEnabled || !path) return;
    let disposed = false;
    let pending = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    const pulse = async () => {
      if (disposed || pending || document.hidden) return;
      clearTimeout(timer);
      pending = true;
      let delay = 20_000;
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 15_000);
      try {
        await analyticsRequest({ action: "heartbeat", visitorId: analyticsVisitorId(), path }, undefined, controller.signal);
      } catch {
        delay = 60_000;
      } finally {
        clearTimeout(timeout);
        pending = false;
        if (!disposed) timer = setTimeout(pulse, delay);
      }
    };
    const onVisible = () => { if (!document.hidden) void pulse(); };
    document.addEventListener("visibilitychange", onVisible);
    void pulse();
    return () => {
      disposed = true;
      clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);
}
