// BR phone formatting helpers.
export function maskPhone(input: string): string {
  const digits = (input || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function phoneDigits(input: string): string {
  return (input || "").replace(/\D/g, "");
}

export function isValidBRPhone(input: string): boolean {
  const d = phoneDigits(input);
  return d.length === 10 || d.length === 11;
}