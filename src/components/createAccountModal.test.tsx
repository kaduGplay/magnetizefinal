import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import CreateAccountModal from "./CreateAccountModal";

const { signup } = vi.hoisted(() => ({ signup: vi.fn() }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ signup }) }));

afterEach(() => {
  signup.mockReset();
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
  it("closes the signup modal when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<CreateAccountModal isOpen onClose={onClose} onOpenLogin={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(signup).not.toHaveBeenCalled();
  });
  it("reveals and hides the typed password without submitting the form", () => {
    render(<CreateAccountModal isOpen onClose={() => {}} onOpenLogin={() => {}} />);
    const password = screen.getByLabelText("Crie uma senha") as HTMLInputElement;
    fireEvent.change(password, { target: { value: "example-password" } });
    expect(password.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(password.type).toBe("text");
    expect(password.value).toBe("example-password");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(password.type).toBe("password");
    expect(signup).not.toHaveBeenCalled();
  });
  it("hides the password again when the modal is reopened", () => {
    const props = { onClose: () => {}, onOpenLogin: () => {} };
    const view = render(<CreateAccountModal isOpen {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    view.rerender(<CreateAccountModal isOpen={false} {...props} />);
    view.rerender(<CreateAccountModal isOpen {...props} />);
    expect(screen.getByLabelText("Crie uma senha")).toHaveAttribute("type", "password");
  });

});
