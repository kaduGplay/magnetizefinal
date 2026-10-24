import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConsentConfirmationModal from "@/components/ConsentConfirmationModal";

// Regra: ao subir a foto não pode haver confirmação de idade (caixa de 18 anos).
describe("confirmação da foto enviada", () => {
  it("não mostra caixa de confirmação de idade", () => {
    render(
      <ConsentConfirmationModal
        isOpen
        imageUrl={null}
        onClose={() => {}}
        onConfirm={() => {}}
        alwaysConfirmPhoto
      />,
    );
    expect(document.querySelector('input[type="checkbox"]')).toBeNull();
    expect(document.body.textContent).not.toContain("18 anos");
  });

  it("gera com a foto sem exigir nenhuma marcação antes", () => {
    const onConfirm = vi.fn();
    render(
      <ConsentConfirmationModal
        isOpen
        imageUrl={null}
        onClose={() => {}}
        onConfirm={onConfirm}
        alwaysConfirmPhoto
      />,
    );
    const btn = screen.getByRole("button", { name: "Gerar com essa foto" });
    expect(btn).toBeEnabled();
    fireEvent.click(btn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
