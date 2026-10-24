import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ServerQueueModal, { PRIORITY_PLAN } from "./ServerQueueModal";

afterEach(cleanup);

describe("modal de servidores lotados", () => {
  it("mostra espera de 4 a 7 horas e a oferta prioritária de R$ 8,90", () => {
    render(<ServerQueueModal isOpen onClose={() => {}} onAccept={() => {}} />);
    expect(screen.getByText("Servidores lotados")).toBeTruthy();
    expect(screen.getByText("4 a 7 horas")).toBeTruthy();
    expect(screen.getByText("R$ 8,90")).toBeTruthy();
    expect(screen.getByText("Oferta prioritária vitalícia")).toBeTruthy();
  });

  it("mostra uma fila ao vivo entre 150 e 300 pessoas", () => {
    render(<ServerQueueModal isOpen onClose={() => {}} onAccept={() => {}} />);
    const fila = Number(screen.getByText(/^\d+$/).textContent);
    expect(fila).toBeGreaterThanOrEqual(150);
    expect(fila).toBeLessThanOrEqual(300);
  });

  it("envia o plano prioritário vitalício de 890 centavos ao aceitar", () => {
    const onAccept = vi.fn();
    render(<ServerQueueModal isOpen onClose={() => {}} onAccept={onAccept} />);
    fireEvent.click(screen.getByRole("button", { name: /Quero prioridade por R\$ 8,90/ }));
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onAccept).toHaveBeenCalledWith(PRIORITY_PLAN);
    expect(PRIORITY_PLAN.amountCents).toBe(890);
    expect(PRIORITY_PLAN.isLifetime).toBe(true);
    expect(PRIORITY_PLAN.isPremium).toBe(true);
  });

  it("permite entrar na fila sem pagar", () => {
    const onClose = vi.fn();
    render(<ServerQueueModal isOpen onClose={onClose} onAccept={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Entrar na fila e esperar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
