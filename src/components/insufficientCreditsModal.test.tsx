import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import InsufficientCreditsModal, { PLANS } from "./InsufficientCreditsModal";
import { generationStep } from "@/lib/generationStep";

const { assign } = vi.hoisted(() => ({ assign: vi.fn() }));
vi.mock("@/hooks/useUtmParams", () => ({ getStoredUtmParams: () => ({ utm_source: "test-source" }) }));
vi.mock("@/lib/tiktok-pixel", () => ({ initTikTokPixel: vi.fn(), trackAddToCart: vi.fn(), trackInitiateCheckout: vi.fn() }));
beforeEach(() => { vi.spyOn(window, "location", "get").mockReturnValue({ ...window.location, assign }); });
afterEach(() => {
  cleanup();
  assign.mockReset();
  vi.restoreAllMocks();
});

describe("plan modal (credits step)", () => {
  it.each([PLANS.credits, PLANS.lifetime])("opens the correct checkout directly from the $name plan", (plan) => {
    render(<InsufficientCreditsModal isOpen onClose={() => {}} onBuyCredits={() => {}} currentCredits={0} requiredCredits={100} />);
    const button = screen.getByRole("button", { name: `Ir para pagamento · ${plan.price}` });
    expect(button.closest("section")).not.toBeNull();
    fireEvent.click(button);
    expect(assign).toHaveBeenCalledTimes(1);
    const url = new URL(assign.mock.calls[0][0], "https://example.com");
    expect(url.pathname).toBe("/checkout");
    expect(Object.fromEntries(url.searchParams)).toMatchObject({ plan: plan.id, name: plan.name, amount: String(plan.amountCents), credits: String(plan.credits), isLifetime: String(plan.isLifetime), isPremium: String(plan.isPremium), utm_source: "test-source" });
    fireEvent.click(button);
    expect(assign).toHaveBeenCalledTimes(1);
  });

  it("keeps the X dismissal separate from the optional exit offer", () => {
    const close = vi.fn();
    const defer = vi.fn();
    render(<InsufficientCreditsModal isOpen onClose={close} onDefer={defer} onBuyCredits={() => {}} currentCredits={0} requiredCredits={100} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(close).toHaveBeenCalledTimes(1);
    expect(defer).not.toHaveBeenCalled();
  });

  it("uses plan browsing copy only when opened outside the generation funnel", () => {
    const props = { isOpen: true, onClose: () => {}, onBuyCredits: () => {}, currentCredits: 0, requiredCredits: 100 };
    const view = render(<InsufficientCreditsModal {...props} context="browse" />);
    expect(screen.getByRole("heading", { name: "Conheça nossos planos" })).toBeTruthy();
    expect(screen.queryByText(/Esta é a etapa de compra dos créditos/)).toBeNull();
    view.rerender(<InsufficientCreditsModal {...props} context="generation" />);
    expect(screen.getByRole("heading", { name: "Para gerar, compre créditos" })).toBeTruthy();
    expect(screen.getByText(/Esta é a etapa de compra dos créditos/)).toBeTruthy();
  });

  it("makes the payment step and selected price explicit", () => {
    render(<InsufficientCreditsModal isOpen onClose={() => {}} onBuyCredits={() => {}} currentCredits={0} requiredCredits={100} />);
    expect(screen.getByText(/Os créditos serão liberados após a confirmação do pagamento via PIX/)).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "500 créditos" })).getByRole("button", { name: "Ir para pagamento · R$ 9,90" })).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Acesso vitalício" })).getByRole("button", { name: "Ir para pagamento · R$ 14,90" })).toBeTruthy();
  });

  it("the dashboard funnel skips the fake loading screen and goes straight to the plan", () => {
    expect(generationStep(false, 100, 100)).toBe("account");
    expect(generationStep(true, 99, 100)).toBe("plans");
    expect(generationStep(true, 100, 100)).toBe("queue");
  });
});
