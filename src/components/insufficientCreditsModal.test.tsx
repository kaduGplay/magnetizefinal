import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import InsufficientCreditsModal, { PLANS } from "./InsufficientCreditsModal";
import { generationStep } from "@/lib/generationStep";

const { assign } = vi.hoisted(() => ({ assign: vi.fn() }));
vi.mock("@/hooks/useUtmParams", () => ({ getStoredUtmParams: () => ({ utm_source: "test-source" }) }));
vi.mock("@/lib/tiktok-pixel", () => ({ initTikTokPixel: vi.fn(), trackAddToCart: vi.fn(), trackInitiateCheckout: vi.fn() }));
const props = { isOpen: true, onClose: vi.fn(), onBuyCredits: vi.fn(), currentCredits: 0, requiredCredits: 100 };
beforeEach(() => {
  vi.spyOn(window, "location", "get").mockReturnValue({ ...window.location, assign });
});
afterEach(() => { cleanup(); assign.mockReset(); props.onClose.mockReset(); vi.restoreAllMocks(); });

describe("plan modal direct checkout", () => {
  it.each([
    ["Desbloquear por R$ 9,90", PLANS.credits],
    ["Desbloquear vitalício por R$ 14,90", PLANS.lifetime],
  ] as const)("%s opens the correct checkout in one click", (label, plan) => {
    render(<InsufficientCreditsModal {...props} />);
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(assign).toHaveBeenCalledTimes(1);
    const url = new URL(assign.mock.calls[0][0], "https://example.com");
    expect(url.pathname).toBe("/checkout");
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      plan: plan.id, name: plan.name, amount: String(plan.amountCents), credits: String(plan.credits),
      isLifetime: String(plan.isLifetime), isPremium: String(plan.isPremium), utm_source: "test-source",
    });
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(assign).toHaveBeenCalledTimes(1);
  });

  it("keeps dismissal available without starting checkout", () => {
    render(<InsufficientCreditsModal {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Continuar depois" }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(assign).not.toHaveBeenCalled();
  });

  it("allows another choice when reopened after a checkout navigation", () => {
    const view = render(<InsufficientCreditsModal {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Desbloquear por R$ 9,90" }));
    view.rerender(<InsufficientCreditsModal {...props} isOpen={false} />);
    view.rerender(<InsufficientCreditsModal {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Desbloquear vitalício por R$ 14,90" }));
    expect(assign).toHaveBeenCalledTimes(2);
  });

  it("preserves the existing account, queue and plan eligibility rules", () => {
    expect(generationStep(false, 100, 100)).toBe("account");
    expect(generationStep(true, 99, 100)).toBe("plans");
    expect(generationStep(true, 100, 100)).toBe("queue");
  });
});
