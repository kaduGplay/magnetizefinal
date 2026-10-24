const KEY = "magnetize_pending_checkout";
export const RESUME_WINDOW_MS = 2 * 60 * 1000;

export interface PendingCheckout {
  userId: string;
  transactionId: string;
  path: string;
  amount: number;
  firstSeenAt: number;
}

export function clearPendingCheckout() {
  localStorage.removeItem(KEY);
}

export function readPendingCheckout(userId: string, now = Date.now()): PendingCheckout | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const item = JSON.parse(raw) as PendingCheckout;
    if (item.userId !== userId) return null;
    if (typeof item.transactionId !== "string" || !item.transactionId ||
        typeof item.path !== "string" || !item.path.startsWith("/checkout?") ||
        !Number.isFinite(item.amount) || item.amount <= 0 ||
        !Number.isFinite(item.firstSeenAt) || now < item.firstSeenAt ||
        now - item.firstSeenAt >= RESUME_WINDOW_MS) {
      clearPendingCheckout();
      return null;
    }
    return item;
  } catch {
    clearPendingCheckout();
    return null;
  }
}

export function savePendingCheckout(item: Omit<PendingCheckout, "firstSeenAt">, reused: boolean, now = Date.now()) {
  const previous = readPendingCheckout(item.userId, now);
  // A reused transaction without a known original timestamp must not start a new window.
  if (reused && previous?.transactionId !== item.transactionId) return;
  localStorage.setItem(KEY, JSON.stringify({
    ...item,
    firstSeenAt: previous?.transactionId === item.transactionId ? previous.firstSeenAt : now,
  }));
}