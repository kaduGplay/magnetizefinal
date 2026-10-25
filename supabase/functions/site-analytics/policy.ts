export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const pages = new Set(["/", "/checkout", "/auth", "/thank-you", "/fast-generations", "/politic", "/terms", "/escolher-modelo", "/gerando", "/resultado", "/criar-conta", "/entrar"]);

export function analyticsPath(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return null;
  const path = value.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (path === "/dashboard" || path.startsWith("/dashboard/")) return "/dashboard";
  if (path === "/auth" || path.startsWith("/auth/")) return "/auth";
  return pages.has(path) ? path : null;
}
