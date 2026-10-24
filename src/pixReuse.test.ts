import { describe, expect, it } from "vitest";
import { canReusePix } from "../supabase/functions/create-pix-payment/reuse";

const created = Date.UTC(2026, 9, 24, 9, 33);
const pix = { amount: 990, status: "waiting_payment", created_at: new Date(created).toISOString(), pix_qrcode: "test-pix", pix_expiration_date: null };

describe("PIX reuse rules", () => {
  it("reuses the same value before two minutes", () => {
    expect(canReusePix(pix, 990, created + 119999)).toBe(true);
  });
  it("stops reusing at exactly two minutes from original creation", () => {
    expect(canReusePix(pix, 990, created + 120000)).toBe(false);
  });
  it("does not reuse a different value", () => {
    expect(canReusePix(pix, 1290, created + 1000)).toBe(false);
  });
  it("does not reuse a paid PIX", () => {
    expect(canReusePix({ ...pix, status: "paid" }, 990, created + 1000)).toBe(false);
  });
  it("does not reuse an expired PIX", () => {
    expect(canReusePix({ ...pix, pix_expiration_date: new Date(created + 500).toISOString() }, 990, created + 1000)).toBe(false);
  });
});