import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Index from "./Index";
import Dashboard from "./Dashboard";

const auth = vi.hoisted(() => ({ profile: null as null | { id: string; full_name: string; credits: number; is_premium: boolean }, isAuthenticated: false, isLoading: false }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => auth }));
vi.mock("@/hooks/useUtmParams", () => ({ useUtmCapture: () => {}, getStoredUtmParams: () => ({}) }));
vi.mock("@/components/UserAccountModal", () => ({ default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div>Conta aberta</div> : null }));
vi.mock("@/components/LoginCodeModal", () => ({ default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div>Login aberto</div> : null }));
vi.mock("@/components/CreateAccountModal", () => ({ default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div>Cadastro aberto</div> : null }));
vi.mock("@/components/InsufficientCreditsModal", () => ({ GENERATION_COST: 100, default: ({ isOpen, onClose, context }: { isOpen: boolean; onClose: () => void; context: string }) => isOpen ? <div>Planos abertos<button onClick={onClose}>Fechar planos</button><span>{context}</span></div> : null }));
vi.mock("@/components/AutoplayVideo", () => ({ default: () => null }));
vi.mock("@/components/PendingCheckoutNotice", () => ({ default: () => null }));
vi.mock("@/components/PhotoUploadModal", () => ({ default: () => null }));
vi.mock("@/components/ServerQueueModal", () => ({ default: () => null }));
vi.mock("@/components/ExitDownsellModal", () => ({ default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div>Oferta de saída</div> : null }));
vi.mock("@/components/CreditsModal", () => ({ default: () => null }));
beforeEach(() => { vi.spyOn(window, "scrollTo").mockImplementation(() => {}); });
afterEach(() => { cleanup(); auth.profile = null; auth.isAuthenticated = false; auth.isLoading = false; });
for (const [name, Page] of [["dashboard", Dashboard]] as const) {
  describe(name, () => {
    it("opens the account and shows the authenticated balance", () => {
      auth.profile = { id: "user", full_name: "Cliente teste", credits: 350, is_premium: true }; auth.isAuthenticated = true;
      render(<Page />);
      fireEvent.click(screen.getByRole("button", { name: "Minha conta" }));
      expect(screen.getByText("Conta aberta")).toBeTruthy();
      expect(screen.getByText("350")).toBeTruthy();
      expect(screen.queryByText("Cadastro aberto")).toBeNull();
    });
    it("offers login for a visitor", () => {
      render(<Page />); fireEvent.click(screen.getByRole("button", { name: "Minha conta" }));
      expect(screen.getByText("Login aberto")).toBeTruthy();
    });
    it("opens plans from the credits button", () => {
      render(<Page />); fireEvent.click(screen.getByRole("button", { name: "0" }));
      expect(screen.getByText("Planos abertos")).toBeTruthy();
      expect(screen.queryByText("Cadastro aberto")).toBeNull();
    });
    it("opens plans directly and the X closes without opening another offer", () => {
      render(<Dashboard />);
      fireEvent.click(screen.getByRole("button", { name: "Ver planos" }));
      expect(screen.getByText("browse")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Fechar planos" }));
      expect(screen.queryByText("Planos abertos")).toBeNull();
      expect(screen.queryByText("Oferta de saída")).toBeNull();
      expect(screen.queryByText("Cadastro aberto")).toBeNull();
    });
    it("opens plans from the sidebar without leaving the menu over the modal", () => {
      render(<MemoryRouter initialEntries={["/dashboard"]}><Dashboard /></MemoryRouter>);
      fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
      const menu = screen.getByRole("navigation", { name: "Navegação da dashboard" });
      fireEvent.click(within(menu).getByRole("button", { name: "Adquirir Créditos" }));
      expect(screen.getByText("Planos abertos")).toBeTruthy();
      expect(screen.queryByRole("navigation", { name: "Navegação da dashboard" })).toBeNull();
    });
    it("shows the original credit menu without presenting unavailable actions as working", () => {
      render(<MemoryRouter><Dashboard /></MemoryRouter>);
      fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
      const menu = within(screen.getByRole("navigation", { name: "Navegação da dashboard" }));
      expect(menu.getByRole("button", { name: "Adquirir Créditos" })).not.toBeDisabled();
      for (const name of ["Gerar com Fotos", "Conteúdo Premium", "Resgatar Créditos"]) {
        expect(menu.getByRole("button", { name })).toBeDisabled();
      }
    });
    it("navigates to another page from the sidebar", () => {
      render(<MemoryRouter initialEntries={["/dashboard"]}><Routes><Route path="/dashboard" element={<Dashboard />} /><Route path="/fast-generations" element={<div>Outra página aberta</div>} /></Routes></MemoryRouter>);
      fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Gerações Rápidas" }));
      expect(screen.getByText("Outra página aberta")).toBeTruthy();
    });
    it("waits for session restoration before opening account", () => {
      auth.isLoading = true; render(<Page />);
      expect((screen.getByRole("button", { name: "Minha conta" }) as HTMLButtonElement).disabled).toBe(true);
    });
  });
}


describe("landing page", () => {
  for (const authenticated of [false, true]) {
    it(`keeps visitors on the landing and sends every button to the dashboard (authenticated: ${authenticated})`, () => {
      auth.isAuthenticated = authenticated;
      auth.profile = authenticated ? { id: "user", full_name: "Cliente teste", credits: 350, is_premium: true } : null;
      const mount = () => render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<div data-testid="dashboard-destination" />} />
          </Routes>
        </MemoryRouter>,
      );
      let view = mount();
      expect(screen.queryByTestId("dashboard-destination")).toBeNull();
      expect(view.container.querySelector("main")).not.toBeNull();
      const buttonCount = screen.getAllByRole("button").length;
      expect(buttonCount).toBeGreaterThan(0);
      for (let index = 0; index < buttonCount; index += 1) {
        fireEvent.click(screen.getAllByRole("button")[index]);
        expect(screen.getByTestId("dashboard-destination")).toBeTruthy();
        view.unmount();
        if (index < buttonCount - 1) view = mount();
      }
    });
  }
});
