import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useSitePresence } from "./useSitePresence";
const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("@/lib/siteAnalytics", () => ({
  analyticsEnabled: true,
  analyticsVisitorId: () => "2c354bda-5b42-4f4b-9cb7-83654c793fe6",
  analyticsPath: (path: string) => path === "/analise" ? null : path,
  analyticsRequest: request,
}));
function Tracker() { useSitePresence(); return null; }
const mount = (path = "/") => render(<MemoryRouter initialEntries={[path]}><Tracker /></MemoryRouter>);
beforeEach(() => { vi.useFakeTimers(); vi.spyOn(document, "hidden", "get").mockReturnValue(false); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); request.mockReset(); });
describe("site presence lifecycle", () => {
  it("waits for the previous request to settle before scheduling the next heartbeat", async () => {
    let resolve: (value: unknown) => void;
    request.mockImplementationOnce(() => new Promise((done) => { resolve = done; })).mockResolvedValue({ success: true });
    mount();
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(request).toHaveBeenCalledTimes(1);
    await act(async () => { resolve({ success: true }); });
    await act(async () => { await vi.advanceTimersByTimeAsync(19_999); });
    expect(request).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(request).toHaveBeenCalledTimes(2);
  });
  it("does not count the analysis page or hidden tabs", () => {
    const view = mount("/analise");
    expect(request).not.toHaveBeenCalled();
    view.unmount();
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    mount();
    expect(request).not.toHaveBeenCalled();
  });
  it("aborts pending requests when the route unmounts", () => {
    request.mockImplementation(() => new Promise(() => {}));
    const view = mount();
    const signal = request.mock.calls[0][2] as AbortSignal;
    view.unmount();
    expect(signal.aborted).toBe(true);
  });
});
