import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
const mount = (entry = path) => render(<MemoryRouter initialEntries={[entry]}><Routes><Route path="/checkout" element={<Checkout />} /><Route path="/auth" element={<AuthDestination />} /><Route path="/dashboard" element={<div>Checkout fechado</div>} /></Routes></MemoryRouter>);
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
  it("displays and submits catalog values even when URL pricing and entitlements were changed", async () => {
    mocks.auth.profile = { id: "user", full_name: "Teste", email: "teste@example.com", phone: null }; mocks.auth.isAuthenticated = true;
    mocks.access.mockResolvedValue({ success: true, status: "waiting_payment" });
    mocks.invoke.mockResolvedValue({ data: { success: true, transactionId: "tx", pixQrcode: "pix-code", pixExpirationDate: null }, error: null });
    mount("/checkout?plan=credit-pack-500&name=Alterado&amount=1&credits=999999&isLifetime=true&isPremium=true");
    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(1));
    expect(mocks.invoke).toHaveBeenCalledWith("create-pix-payment", expect.objectContaining({ body: expect.objectContaining({ planId: "credit-pack-500", planName: "500 Créditos", amount: 990, credits: 500, isLifetime: false, isPremium: false }) }));
    expect(screen.getAllByText("R$ 9,90").length).toBeGreaterThan(0);
    expect(screen.queryByText("R$ 0,01")).toBeNull();
  });
  it("accepts a known plan link without requiring a price in the URL", async () => {
    mocks.auth.profile = { id: "user", full_name: "Teste", email: "teste@example.com", phone: null }; mocks.auth.isAuthenticated = true;
    mocks.access.mockResolvedValue({ success: true, status: "waiting_payment" });
    mocks.invoke.mockResolvedValue({ data: { success: true, transactionId: "tx", pixQrcode: "pix-code", pixExpirationDate: null }, error: null });
    mount("/checkout?plan=lifetime-unlimited");
    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledWith("create-pix-payment", expect.objectContaining({ body: expect.objectContaining({ amount: 1490, credits: 999999 }) })));
  });
  it("rejects unknown plan identifiers without creating a charge", async () => {
    mocks.auth.profile = { id: "user", full_name: "Teste", email: "teste@example.com", phone: null }; mocks.auth.isAuthenticated = true;
    mount("/checkout?plan=unknown&name=Invalid&amount=990");
    expect(await screen.findByText("Dados do plano inválidos")).toBeTruthy();
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it("lets the visitor leave checkout while the session is still being checked", () => {
    mocks.auth.profile = { id: "user", full_name: "Teste", email: "teste@example.com", phone: null }; mocks.auth.isAuthenticated = true;
    mocks.access.mockImplementation(() => new Promise(() => {}));
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Sair do checkout" }));
    expect(screen.getByText("Checkout fechado")).toBeTruthy();
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

});
