import { describe, expect, it, vi } from "vitest";
import { sequentialPaymentAttempts } from "./paymentAttempt";

describe("PIX attempts", () => {
  it("never overlaps requests", async () => {
    let active = 0;
    let maximum = 0;
    let calls = 0;
    const result = await sequentialPaymentAttempts(async () => {
      calls += 1;
      active += 1;
      maximum = Math.max(maximum, active);
      await Promise.resolve();
      active -= 1;
      if (calls === 1) throw new Error("failed");
      return "pix";
    });
    expect(result).toBe("pix");
    expect(maximum).toBe(1);
    expect(calls).toBe(2);
  });
  it("stops after two failed attempts", async () => {
    const request = vi.fn().mockRejectedValue(new Error("offline"));
    await expect(sequentialPaymentAttempts(request)).rejects.toThrow("offline");
    expect(request).toHaveBeenCalledTimes(2);
  });
});