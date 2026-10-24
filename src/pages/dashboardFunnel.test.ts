import { beforeEach, describe, expect, it } from "vitest";
import { clearGenerationIntent, consumeGenerationIntent, saveGenerationIntent } from "@/lib/generationIntent";

describe("post-signup funnel", () => {
  beforeEach(() => sessionStorage.clear());
  it("resumes the chosen template exactly once after authentication", () => {
    saveGenerationIntent("template-b");
    expect(consumeGenerationIntent(["template-a", "template-b"])).toBe(1);
    expect(consumeGenerationIntent(["template-a", "template-b"])).toBeNull();
  });
  it("does not choose a template for an unrelated login", () => {
    expect(consumeGenerationIntent(["template-a"])).toBeNull();
  });
  it("lets users abandon the selection and choose another video", () => {
    saveGenerationIntent("template-a");
    clearGenerationIntent();
    expect(consumeGenerationIntent(["template-a"])).toBeNull();
  });
  it("does not reopen removed templates", () => {
    saveGenerationIntent("removed");
    expect(consumeGenerationIntent(["template-a"])).toBeNull();
  });
});
