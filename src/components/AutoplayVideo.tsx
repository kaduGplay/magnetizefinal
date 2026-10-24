import { forwardRef, useEffect, useRef } from "react";
import type { VideoHTMLAttributes } from "react";

type AutoplayVideoProps = VideoHTMLAttributes<HTMLVideoElement>;

/**
 * Vídeo que SEMPRE roda em autoplay + loop, sem controles e sem pausa.
 * - força muted (exigência dos navegadores para autoplay)
 * - tenta play() de novo se for bloqueado ou se algo pausar o vídeo
 * - retoma quando a aba volta a ficar visível
 * - no celular, se o navegador exigir um toque, o primeiro toque na tela
 *   dá play em todos os vídeos que ainda estiverem parados
 */

// Vídeos ainda parados esperando um gesto do usuário (política de autoplay do iOS/Android).
const waitingForGesture = new Set<HTMLVideoElement>();
let gestureListenerInstalled = false;

const playAllWaiting = () => {
  waitingForGesture.forEach((el) => {
    if (!el.paused) {
      waitingForGesture.delete(el);
      return;
    }
    void el.play().then(() => waitingForGesture.delete(el)).catch(() => {});
  });
};

const installGestureUnlock = () => {
  if (gestureListenerInstalled) return;
  gestureListenerInstalled = true;
  const events = ["touchend", "pointerup", "click", "keydown"] as const;
  events.forEach((event) =>
    window.addEventListener(event, playAllWaiting, { passive: true, capture: true }),
  );
};

const AutoplayVideo = forwardRef<HTMLVideoElement, AutoplayVideoProps>(function AutoplayVideo(
  { children, ...rest },
  forwardedRef,
) {
  const innerRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    // iOS/Safari só libera autoplay quando o atributo muted está no elemento.
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.setAttribute("autoplay", "");
    el.removeAttribute("controls");

    let attempts = 0;
    let timer: number | undefined;

    const tryPlay = () => {
      if (!el.paused) {
        waitingForGesture.delete(el);
        return;
      }

      const result = el.play();
      if (result && typeof result.catch === "function") {
        result.catch(() => {
          waitingForGesture.add(el);
          installGestureUnlock();
          attempts += 1;
          // Depois de algumas tentativas, recarrega a mídia: destrava vídeos
          // que travaram sem nunca chegar em "canplay".
          if (attempts === 8) {
            try {
              el.load();
            } catch {
              /* ignora */
            }
          }
          if (attempts < 40) {
            timer = window.setTimeout(tryPlay, 250);
          }
        });
      }
    };

    tryPlay();

    const onVisible = () => {
      if (!document.hidden) tryPlay();
    };

    const onEnded = () => {
      //Garante que o loop recomece mesmo se o navegador parar no fim.
      el.currentTime = 0;
      tryPlay();
    };

    el.addEventListener("canplay", tryPlay);
    el.addEventListener("loadeddata", tryPlay);
    el.addEventListener("loadedmetadata", tryPlay);
    el.addEventListener("pause", tryPlay);
    el.addEventListener("ended", onEnded);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      waitingForGesture.delete(el);
      el.removeEventListener("canplay", tryPlay);
      el.removeEventListener("loadeddata", tryPlay);
      el.removeEventListener("loadedmetadata", tryPlay);
      el.removeEventListener("pause", tryPlay);
      el.removeEventListener("ended", onEnded);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [rest.src]);

  return (
    <video
      ref={(el) => {
        innerRef.current = el;
        if (typeof forwardedRef === "function") forwardedRef(el);
        else if (forwardedRef) forwardedRef.current = el;
      }}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      {...rest}
    >
      {children}
    </video>
  );
});

export default AutoplayVideo;
