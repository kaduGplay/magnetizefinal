import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Analysis from "./Analysis";

const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("@/lib/siteAnalytics", () => ({ analyticsEnabled: true, analyticsRequest: request }));
afterEach(() => { cleanup(); request.mockReset(); });
const mount = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter><Analysis /></MemoryRouter></QueryClientProvider>);

describe("public analytics panel", () => {
  it("shows real counts, changes windows and keeps zero separate from missing data", async () => {
    request.mockResolvedValue({ generatedAt: "2026-10-25T12:00:00Z", online: 0, last2Hours: 17, last4Hours: 25, visitors: [] });
    mount();
    expect(await screen.findByText("17")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("25")).toBeTruthy();
    expect(screen.getByText("Nenhum visitante registrado neste período.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Últimas 4h" }));
    await waitFor(() => expect(request).toHaveBeenCalledWith({ action: "snapshot", hours: 4 }, undefined, expect.any(AbortSignal)));
  });
  it("reports a backend failure without displaying fabricated zero counts", async () => {
    request.mockRejectedValue(new Error("Coleta indisponível"));
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent("Coleta indisponível");
    expect(screen.queryByText("0")).toBeNull();
    expect(screen.getAllByText("—")).toHaveLength(3);
  });
});
