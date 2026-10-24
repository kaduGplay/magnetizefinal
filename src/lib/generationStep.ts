export function generationStep(authenticated: boolean, credits: number, cost: number): "account" | "queue" | "plans" {
  if (!authenticated) return "account";
  return credits >= cost ? "queue" : "plans";
}