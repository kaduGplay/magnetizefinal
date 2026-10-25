import { analyticsPath, UUID_PATTERN } from "../../supabase/functions/site-analytics/policy";
export { analyticsPath };

export const analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === "true";

export interface AnalyticsSnapshot {
  generatedAt: string;
  online: number;
  last2Hours: number;
  last4Hours: number;
  visitors: Array<{ id: string; firstSeen: string; lastSeen: string; path: string }>;
}

export async function analyticsRequest(body: Record<string, unknown>, token?: string, signal?: AbortSignal) {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/site-analytics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Análise indisponível. Tente novamente em instantes.");
  return data;
}

let memoryId: string | undefined;
export function analyticsVisitorId(): string {
  if (memoryId) return memoryId;
  try {
    const stored = localStorage.getItem("magnetize_analytics_visitor");
    if (stored && UUID_PATTERN.test(stored)) return (memoryId = stored);
    memoryId = crypto.randomUUID();
    localStorage.setItem("magnetize_analytics_visitor", memoryId);
  } catch {
    memoryId ||= crypto.randomUUID();
  }
  return memoryId;
}
