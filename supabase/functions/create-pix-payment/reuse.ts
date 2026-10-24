export const PIX_REUSE_WINDOW_MS = 2 * 60 * 1000;

export interface ReusablePix {
  amount: number;
  status: string;
  created_at: string;
  pix_qrcode: string | null;
  pix_expiration_date: string | null;
}

export function canReusePix(transaction: ReusablePix, amount: number, now = Date.now()): boolean {
  const age = now - Date.parse(transaction.created_at);
  const expiration = transaction.pix_expiration_date ? Date.parse(transaction.pix_expiration_date) : null;
  return transaction.amount === amount
    && transaction.status === "waiting_payment"
    && Boolean(transaction.pix_qrcode)
    && age >= 0 && age < PIX_REUSE_WINDOW_MS
    && (expiration === null || (!Number.isNaN(expiration) && expiration > now));
}