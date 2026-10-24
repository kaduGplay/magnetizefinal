import { useEffect, useRef } from "react";

interface ModalPageTrackerProps {
  /** Se o modal está aberto */
  isOpen: boolean;
  /** Caminho virtual enquanto o modal está aberto (ex: "/dashboard/planos") */
  path: string;
  /** Caminho para restaurar quando o modal fecha (ex: "/dashboard") */
  basePath: string;
}

/**
 * Faz cada modal contar como uma página no analytics.
 * O script de analytics do hosting escuta history.pushState e registra
 * um page_hit com o pathname atual — então ao abrir o modal trocamos a URL
 * (sem re-render, pois o React Router só reage a popstate) e ao fechar
 * restauramos o caminho base. Também dispara PageView no Meta/TikTok.
 */
const ModalPageTracker = ({ isOpen, path, basePath }: ModalPageTrackerProps) => {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !pushedRef.current) {
      pushedRef.current = true;
      try {
        window.history.pushState({ ...window.history.state, modalPage: path }, "", path);
      } catch {
        /* noop */
      }
      if (typeof window.fbq === "function") window.fbq("track", "PageView");
      if (window.ttq && typeof window.ttq.page === "function") window.ttq.page();
    } else if (!isOpen && pushedRef.current) {
      pushedRef.current = false;
      try {
        window.history.pushState({ ...window.history.state, modalPage: null }, "", basePath);
      } catch {
        /* noop */
      }
      if (typeof window.fbq === "function") window.fbq("track", "PageView");
    }
  }, [isOpen, path, basePath]);

  return null;
};

export default ModalPageTracker;
