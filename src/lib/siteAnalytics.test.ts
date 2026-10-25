import { describe, expect, it } from "vitest";
import { analyticsPath, UUID_PATTERN } from "../../supabase/functions/site-analytics/policy";

describe("anonymous analytics data boundaries", () => {
  it("does not collect checkout parameters, payment identifiers or user-specific subroutes", () => {
    expect(analyticsPath("/checkout?tx=private&email=private@example.com")).toBe("/checkout");
    expect(analyticsPath("/dashboard/account/private-user-id")).toBe("/dashboard");
    expect(analyticsPath("/auth/callback#access_token=private")).toBe("/auth");
  });
  it("excludes the analysis page and arbitrary paths", () => {
    for (const path of ["/analise", "/analise/", "/unknown/private", "//external.example", null, {}]) {
      expect(analyticsPath(path)).toBeNull();
    }
    expect(analyticsPath("/")).toBe("/");
  });
  it("only accepts random UUID visitor identifiers", () => {
    expect(UUID_PATTERN.test("2c354bda-5b42-4f4b-9cb7-83654c793fe6")).toBe(true);
    expect(UUID_PATTERN.test("heitor@example.com")).toBe(false);
    expect(UUID_PATTERN.test("not-an-id")).toBe(false);
  });
});
