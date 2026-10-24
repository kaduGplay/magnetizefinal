import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ExitDownsellModal, { DOWNSELL_PLAN } from "./ExitDownsellModal";

afterEach(cleanup);

describe("exit offer", () => {
  it("offers the unlimited lifetime plan for R$ 9,90", () => {
    const accept = vi.fn();
    render(<ExitDownsellModal isOpen onClose={() => {}} onAccept={accept} />);
    fireEvent.click(screen.getByRole("button", { name: "Quero ilimitado por R$ 9,90" }));
    expect(accept).toHaveBeenCalledWith(expect.objectContaining({
      id: "lifetime-downsell-990", amountCents: 990, isLifetime: true, isPremium: true,
    }));
    expect(DOWNSELL_PLAN.credits).toBe(999999);
  });

  it("dismisses the offer without accepting a purchase", () => {
    const close = vi.fn();
    const accept = vi.fn();
    render(<ExitDownsellModal isOpen onClose={close} onAccept={accept} />);
    fireEvent.click(screen.getByRole("button", { name: "Agora não, voltar aos vídeos" }));
    expect(close).toHaveBeenCalledOnce();
    expect(accept).not.toHaveBeenCalled();
  });
});