// Never start a second charge request until the previous request has settled.
export async function sequentialPaymentAttempts<T>(request: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try { return await request(); } catch (error) { lastError = error; }
  }
  throw lastError;
}