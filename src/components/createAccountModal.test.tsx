import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import CreateAccountModal from "./CreateAccountModal";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("create account modal", () => {
  it("asks to create the account to continue without any mention of payment", () => {
    const { container } = render(<CreateAccountModal isOpen onClose={() => {}} onOpenLogin={() => {}} />);
    const text = container.textContent || "";
    expect(screen.getByRole("heading", { name: "Crie sua conta para continuar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Criar conta e continuar/i })).toBeTruthy();
    // no payment talk at this step: it scares people off
    for (const word of ["cartão", "cartao", "paga", "pagar", "grátis", "gratis", "crédito", "credito", "R$"]) {
      expect(text.toLowerCase().includes(word)).toBe(false);
    }
    expect(screen.queryByText(/tenho 18 anos/i)).toBeNull();
    expect(container.querySelector("video")).toBeNull();
    // anonymity promise is the main objection for this audience
    expect(screen.getByText(/100% anônimo: seu perfil não aparece para ninguém/i)).toBeTruthy();
    // the modal stays lean: the old benefits box is gone
    expect(screen.queryByText(/nada se perde/i)).toBeNull();
    expect(screen.queryByText(/sem instalar nada/i)).toBeNull();
  });
});
