import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initTikTokPixel, trackTikTokEvent } from "@/lib/tiktok-pixel";

export const useTikTokPixel = () => {
  const location = useLocation();

  // Initialize on first mount
  useEffect(() => {
    initTikTokPixel();
  }, []);

  // Track page view on route change
  useEffect(() => {
    if (typeof window !== "undefined" && window.ttq) {
      const tryPage = (attempts = 0) => {
        if (window.ttq && typeof window.ttq.page === "function") {
          window.ttq.page();
          console.log("[TikTok Pixel] PageView:", location.pathname);
        } else if (attempts < 20) {
          setTimeout(() => tryPage(attempts + 1), 300);
        }
      };
      tryPage();
    }
  }, [location.pathname]);
};

export default useTikTokPixel;
