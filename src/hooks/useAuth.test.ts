import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getSession } } }));
vi.mock("@/integrations/lovable", () => ({ lovable: {} }));
vi.mock("@/lib/authOverlay", () => ({ hideAuthOverlay: vi.fn(), showAuthOverlay: vi.fn() }));

import { callAccessApi } from "./useAuth";

const response = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status });

describe("expired access sessions", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    getSession.mockReset();
    localStorage.setItem("magnetize_access_token", "expired-token");
    localStorage.setItem("magnetize_user", JSON.stringify({ id: "existing-user" }));
  });

  it("renews an expired session and retries with the restored token", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "identity-token" } }, error: null });
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response(401, { success: false, error: "Acesso expirado." }))
      .mockResolvedValueOnce(response(200, { success: true, token: "renewed-token", userId: "existing-user" }))
      .mockResolvedValueOnce(response(200, { success: true, credits: 500 }));
    const result = await callAccessApi({ action: "session" });
    expect(result.credits).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect((fetchMock.mock.calls[2][1]?.headers as Record<string, string>)["x-access-token"]).toBe("renewed-token");
  });

  it("clears expired cached access for all subscribers when no identity remains", async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response(401, { success: false, error: "Acesso expirado." }));
    const changed = vi.fn();
    window.addEventListener("magnetize:profile-changed", changed);
    const result = await callAccessApi({ action: "account-data" });
    expect(result.statusCode).toBe(401);
    expect(localStorage.getItem("magnetize_access_token")).toBeNull();
    expect(localStorage.getItem("magnetize_user")).toBeNull();
    expect(changed).toHaveBeenCalledOnce();
    window.removeEventListener("magnetize:profile-changed", changed);
  });

  it("handles identity lookup rejection without throwing or deleting cached data", async () => {
    getSession.mockRejectedValue(new Error("Network unavailable"));
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response(401, { success: false, error: "Acesso expirado." }));
    await expect(callAccessApi({ action: "session" })).resolves.toMatchObject({ success: false, error: "Erro de conexão." });
    expect(localStorage.getItem("magnetize_access_token")).toBe("expired-token");
  });

  it("does not recursively renew a rejected identity request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(response(401, { success: false, error: "Sessão inválida." }));
    const result = await callAccessApi({ action: "identity" }, "rejected-identity");
    expect(result.statusCode).toBe(401);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(getSession).not.toHaveBeenCalled();
  });
});