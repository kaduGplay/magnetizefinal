export interface ServerPlan {
  name: string;
  amount: number;
  credits: number;
  isLifetime: boolean;
  isPremium: boolean;
}

export const PLAN_CATALOG: Record<string, ServerPlan> = {
  "credit-pack-500": { name: "500 Créditos", amount: 990, credits: 500, isLifetime: false, isPremium: false },
  "lifetime-unlimited": { name: "Plano Vitalício", amount: 1490, credits: 999999, isLifetime: true, isPremium: true },
  "lifetime-downsell-990": {
    name: "Acesso Ilimitado (Oferta Relâmpago)",
    amount: 990,
    credits: 999999,
    isLifetime: true,
    isPremium: true,
  },
  "priority-lifetime-890": {
    name: "Gerações Infinitas",
    amount: 890,
    credits: 999999,
    isLifetime: true,
    isPremium: true,
  },
  account_deletion: { name: "Exclusão de conta", amount: 1490, credits: 0, isLifetime: false, isPremium: false },
};

export function getCatalogPlan(id: string): ServerPlan | null {
  return Object.prototype.hasOwnProperty.call(PLAN_CATALOG, id) ? PLAN_CATALOG[id] : null;
}
