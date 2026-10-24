import { beforeEach, describe, expect, it } from "vitest";
import { clearPendingCheckout, readPendingCheckout, savePendingCheckout } from "./pendingCheckout";

const checkout = { userId: "customer", transactionId: "pix-1", path: "/checkout?amount=1290", amount: 1290 };
describe("pending checkout resume", () => {
  beforeEach(() => localStorage.clear());
  it("is available before two minutes, not at two minutes", () => {
    savePendingCheckout(checkout, false, 1000);
    expect(readPendingCheckout("customer", 120999)?.transactionId).toBe("pix-1");
    expect(readPendingCheckout("customer", 121000)).toBeNull();
  });
  it("never extends the window when the same PIX is reused", () => {
    savePendingCheckout(checkout, false, 1000);
    savePendingCheckout(checkout, true, 60000);
    expect(readPendingCheckout("customer", 60000)?.firstSeenAt).toBe(1000);
    expect(readPendingCheckout("customer", 121000)).toBeNull();
  });
  it("does not reveal another customer's checkout", () => {
    savePendingCheckout(checkout, false, 1000);
    expect(readPendingCheckout("other", 2000)).toBeNull();
  });
  it("does not start a new window for an unknown reused PIX", () => {
    savePendingCheckout(checkout, true, 1000);
    expect(readPendingCheckout("customer", 2000)).toBeNull();
  });
  it("clears the reminder when payment is completed", () => {
    savePendingCheckout(checkout, false, 1000);
    clearPendingCheckout();
    expect(readPendingCheckout("customer", 2000)).toBeNull();
  });
});