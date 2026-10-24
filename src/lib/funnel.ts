/**
 * Utilitários do funil: continuidade do resultado entre landing → acesso →
 * dashboard, e rastreio de páginas virtuais (inclusive erros de acesso) para
 * conseguir enxergar o gargalo no analytics.
 */

export interface PendingResult {
  /** URL da mídia do modelo escolhido (nunca a foto do usuário) */
  mediaSrc: string;
  isVideo: boolean;
  templateLabel?: string;
  savedAt: number;
}

const PENDING_KEY = "magnetize_pending_result";
/** Depois de 1h o "resultado pendente" perde sentido */
const MAX_AGE_MS = 60 * 60 * 1000;

export const savePendingResult = (data: Omit<PendingResult, "savedAt">) => {
  try {
    // blob:/data: não sobrevivem a um reload (ex.: redirect do OAuth)
    if (!data.mediaSrc || data.mediaSrc.startsWith("blob:") || data.mediaSrc.startsWith("data:")) return;
    localStorage.setItem(PENDING_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch {
    /* noop */
  }
};

export const getPendingResult = (): PendingResult | null => {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingResult;
    if (!parsed?.mediaSrc || Date.now() - (parsed.savedAt || 0) > MAX_AGE_MS) {
      localStorage.removeItem(PENDING_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const clearPendingResult = () => {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* noop */
  }
};

/**
 * Registra uma página virtual no analytics (e PageView no Meta/TikTok) e
 * restaura o caminho anterior em seguida — usado para eventos pontuais como
 * falha de acesso, que não têm um modal próprio.
 */
export const trackVirtualPageview = (path: string) => {
  const previous = window.location.pathname + window.location.search;
  try {
    window.history.pushState({ virtualPage: path }, "", path);
    if (typeof window.fbq === "function") window.fbq("track", "PageView");
    if (window.ttq && typeof window.ttq.page === "function") window.ttq.page();
    window.setTimeout(() => {
      try {
        window.history.pushState({}, "", previous);
      } catch {
        /* noop */
      }
    }, 400);
  } catch {
    /* noop */
  }
};
