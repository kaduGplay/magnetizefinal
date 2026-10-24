const OVERLAY_ID = "magnetize-auth-overlay";

/** Overlay de carregamento em tela cheia enquanto a sessão social é finalizada. */
export const showAuthOverlay = (message = "Entrando na sua conta...") => {
  if (typeof document === "undefined") return;
  if (document.getElementById(OVERLAY_ID)) return;

  const el = document.createElement("div");
  el.id = OVERLAY_ID;
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:2147483647",
    "display:flex",
    "flex-direction:column",
    "align-items:center",
    "justify-content:center",
    "gap:18px",
    "background:hsl(0 0% 4%)",
    "color:#fff",
    "font-family:inherit",
    "text-align:center",
    "padding:24px",
  ].join(";");

  el.innerHTML = `
    <div style="width:46px;height:46px;border-radius:9999px;border:3px solid rgba(255,255,255,0.15);border-top-color:hsl(0 84% 60%);animation:magnetize-spin .7s linear infinite"></div>
    <div style="font-size:15px;font-weight:700;letter-spacing:-0.01em">${message}</div>
    <div style="font-size:13px;opacity:.6">Só um instante</div>
    <style>@keyframes magnetize-spin{to{transform:rotate(360deg)}}</style>
  `;

  document.body.appendChild(el);
};

export const hideAuthOverlay = () => {
  if (typeof document === "undefined") return;
  document.getElementById(OVERLAY_ID)?.remove();
};
