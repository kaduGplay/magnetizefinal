import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import InsufficientCreditsModal, { PLANS } from "./InsufficientCreditsModal";
import { generationStep } from "@/lib/generationStep";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("plan modal (credits step)", () => {
  it("selects the initial package by default and allows choosing lifetime", async () => {
    render(
      <InsufficientCreditsModal
        isOpen
        onClose={() => {}}
        onBuyCredits={() => {}}
        currentCredits={0}
        requiredCredits={100}
        mediaType="video"
      />,
    );
    const { fireEvent } = await import("@testing-library/react");
    const initial = screen.getByRole("button", { name: /500 créditos.*R\$ 9,90/ });
    const lifetime = screen.getByRole("button", { name: /Vídeos ilimitados.*R\$ 14,90/ });
    expect(initial.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(lifetime);
    expect(lifetime.getAttribute("aria-pressed")).toBe("true");
    expect(initial.getAttribute("aria-pressed")).toBe("false");
    expect(PLANS.credits.amountCents).toBe(990);
    expect(PLANS.credits.credits).toBe(500);
    expect(PLANS.lifetime.amountCents).toBe(1490);
    expect(PLANS.lifetime.isLifetime).toBe(true);
  });

  it("the dashboard funnel skips the fake loading screen and goes straight to the plan", () => {
    expect(generationStep(false, 100, 100)).toBe("account");
    expect(generationStep(true, 99, 100)).toBe("plans");
    expect(generationStep(true, 100, 100)).toBe("queue");
  });
});
