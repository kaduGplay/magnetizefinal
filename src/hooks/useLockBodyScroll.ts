import { useEffect } from "react";

/**
 * Locks page scrolling (including iOS rubber-band) while a full-screen
 * overlay is active, so the content behind never moves or shows through.
 */
export const useLockBodyScroll = (active: boolean) => {
  useEffect(() => {
    if (!active) return;

    const { body, documentElement: html } = document;
    const scrollY = window.scrollY;

    const prev = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      overscroll: html.style.overscrollBehavior,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    return () => {
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.width = prev.bodyWidth;
      body.style.overflow = prev.bodyOverflow;
      html.style.overflow = prev.htmlOverflow;
      html.style.overscrollBehavior = prev.overscroll;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
};

export default useLockBodyScroll;
