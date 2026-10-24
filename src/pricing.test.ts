import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// O preço anunciado deve corresponder ao catálogo cobrado pelo servidor.
const root = resolve(__dirname, "..");
const creditsModal = readFileSync(resolve(root, "src/components/CreditsModal.tsx"), "utf8");
const insufficient = readFileSync(resolve(root, "src/components/InsufficientCreditsModal.tsx"), "utf8");
const pixFunction = readFileSync(resolve(root, "supabase/functions/create-pix-payment/index.ts"), "utf8");

const quickPlanBlock = creditsModal.slice(
  creditsModal.indexOf('id: "credit-pack-500"'),
  creditsModal.indexOf("interface CreditsModalProps"),
);
const creditsPlanBlock = insufficient.slice(
  insufficient.indexOf('id: "credit-pack-500"'),
  insufficient.indexOf("lifetime: {"),
);
const catalogLine = pixFunction.split("\n").find((line) => line.includes('"credit-pack-500"')) ?? "";

describe("preço do plano 1 (500 créditos)", () => {
  it("custa R$ 9,90 no modal de planos", () => {
    expect(quickPlanBlock).toContain("amountCents: 990");

  });

  it("custa R$ 9,90 no modal de créditos insuficientes", () => {
    expect(creditsPlanBlock).toContain("amountCents: 990");
    expect(creditsPlanBlock).toContain('price: "R$ 9,90"');
  });

  it("cobra R$ 9,90 no backend que gera o PIX", () => {
    expect(catalogLine).toContain("amount: 990");

  });
});
