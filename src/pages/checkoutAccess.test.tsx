import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import Checkout from "./Checkout";

const mocks = vi.hoisted(() => ({
  auth: { profile: null as null | { id: string; full_name: string; email: string; phone: null }, isLoading: false, isAuthenticated: false, signOut: vi.fn() },
  invoke: vi.fn(), access: vi.fn(),
}));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => mocks.auth, callAccessApi: mocks.access, getAccessToken: () => "access" }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: mocks.invoke } } }));
vi.mock("@/components/checkout/GuaranteeSection", () => ({ default: () => null }));
vi.mock("@/components/checkout/TestimonialsCarousel", () => ({ default: () => null }));
vi.mock("@/lib/facebook-pixel", () => ({ initFacebookPixel: vi.fn(), trackViewContent: vi.fn(), trackInitiateCheckout: vi.fn(), trackAddPaymentInfo: vi.fn() }));
vi.mock("@/lib/tiktok-pixel", () => ({ initTikTokPixel: vi.fn(), trackViewContent: vi.fn(), trackInitiateCheckout: vi.fn() }));
const path = "/checkout?plan=credit-pack-500&name=500+Créditos&amount=990&credits=500";
const AuthDestination = () => <div>Retorno: {useLocation().state?.returnTo}</div>;
const mount = () => render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/checkout" element={<Checkout />} /><Route path="/auth" element={<AuthDestination />} /></Routes></MemoryRouter>);
afterEach(() => { cleanup(); vi.resetAllMocks(); mocks.auth.profile = null; mocks.auth.isAuthenticated = false; localStorage.clear(); });
describe("checkout access and validity", () => {
  it("preserves the complete checkout when login is required", async () => {
    mount(); expect(await screen.findByText(`Retorno: /checkout?${new URLSearchParams(path.split("?")[1]).toString()}`)).toBeTruthy(); expect(mocks.invoke).not.toHaveBeenCalled();
  });
  it("restores access before charging and never invents an expiration", async () => {
    mocks.auth.profile = { id: "user", full_name: "Teste", email: "teste@example.com", phone: null }; mocks.auth.isAuthenticated = true;
    mocks.access.mockResolvedValue({ success: true, status: "waiting_payment" });
    mocks.invoke.mockResolvedValue({ data: { success: true, transactionId: "tx", pixQrcode: "pix-code", pixExpirationDate: null }, error: null });
    mount();
    expect(await screen.findByText("A validade do código é informada pelo seu banco.")).toBeTruthy();
    expect(mocks.access.mock.invocationCallOrder[0]).toBeLessThan(mocks.invoke.mock.invocationCallOrder[0]);
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
  });
  it("does not create a charge when access verification fails", async () => {
    mocks.auth.profile = { id: "user", full_name: "Teste", email: "teste@example.com", phone: null }; mocks.auth.isAuthenticated = true;
    mocks.access.mockResolvedValue({ success: false, error: "Erro de conexão." }); mount();
    await waitFor(() => expect(screen.getByText("Erro de conexão.")).toBeTruthy()); expect(mocks.invoke).not.toHaveBeenCalled();
  });
});
