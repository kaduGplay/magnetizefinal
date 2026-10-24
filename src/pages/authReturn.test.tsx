import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Auth from "./Auth";
import ModalPageTracker from "@/components/ModalPageTracker";
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ profile: null, isLoading: false }) }));
vi.mock("@/components/LoginCodeModal", () => ({ default: ({ onSuccess, onClose, navigateOnSuccess }: { onSuccess: () => void; onClose: () => void; navigateOnSuccess: boolean }) => <button onClick={() => { expect(navigateOnSuccess).toBe(false); onSuccess(); onClose(); }}>Concluir login</button> }));
vi.mock("@/components/CreateAccountModal", () => ({ default: () => null }));
afterEach(() => cleanup());
describe("return after authentication", () => {
  it("returns to checkout without the modal close overriding navigation", () => {
    render(<MemoryRouter initialEntries={[{ pathname: "/auth", state: { returnTo: "/checkout?plan=credit-pack-500" } }]}><Routes><Route path="/auth" element={<Auth />} /><Route path="/checkout" element={<div>Checkout retomado</div>} /><Route path="/" element={<div>Home</div>} /></Routes></MemoryRouter>);
    fireEvent.click(screen.getByText("Concluir login")); expect(screen.getByText("Checkout retomado")).toBeTruthy();
  });
  it("preserves the router return state while tracking a modal", () => {
    window.history.replaceState({ usr: { returnTo: "/checkout?plan=credit-pack-500" }, key: "auth" }, "", "/auth");
    const { rerender } = render(<ModalPageTracker isOpen path="/auth/entrar" basePath="/auth" />);
    expect(window.history.state.usr.returnTo).toBe("/checkout?plan=credit-pack-500");
    rerender(<ModalPageTracker isOpen={false} path="/auth/entrar" basePath="/auth" />);
    expect(window.history.state.usr.returnTo).toBe("/checkout?plan=credit-pack-500");
  });
});
