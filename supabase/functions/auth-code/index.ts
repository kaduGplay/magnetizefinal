import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-access-token",
};

type Action = "identity" | "generate-code" | "login-code" | "session" | "logout" | "account-data" | "transaction-status" | "deduct-credits" | "delete";

interface RequestBody {
  action?: Action;
  code?: string;
  transactionId?: string;
  pixTransactionId?: string;
  amount?: number;
}

const SESSION_DAYS = 30;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function toB64(bytes: Uint8Array): string {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value);
}

function fromB64(value: string): Uint8Array {
  const decoded = atob(value);
  return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifyLegacyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, iterStr, saltB64, hashB64] = stored.split("$");
    if (scheme !== "pbkdf2") return false;
    const expected = fromB64(hashB64);
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
    const bits = new Uint8Array(await crypto.subtle.deriveBits({
      name: "PBKDF2",
      salt: fromB64(saltB64),
      iterations: Number(iterStr),
      hash: "SHA-256",
    }, key, expected.length * 8));
    if (bits.length !== expected.length) return false;
    let diff = 0;
    for (let index = 0; index < bits.length; index++) diff |= bits[index] ^ expected[index];
    return diff === 0;
  } catch {
    return false;
  }
}

function profilePayload(user: Record<string, unknown>) {
  return {
    userId: user.id,
    fullName: typeof user.full_name === "string" && user.full_name.trim() ? user.full_name.trim() : "Cliente Magnetize",
    phone: typeof user.phone === "string" ? user.phone : null,
    email: typeof user.email === "string" ? user.email : null,
    credits: user.credits,
    isPremium: user.is_premium,
    premiumExpiresAt: user.premium_expires_at,
    accessCodeLast4: user.access_code_last4 ?? null,
  };
}

function generateAccessCode(): string {
  const bytes = crypto.getRandomValues(new Uint32Array(1));
  return String(1000000 + (bytes[0] % 9000000));
}

async function createSession(db: ReturnType<typeof createClient>, pepper: string, userId: string) {
  const token = `${crypto.randomUUID()}${toB64(crypto.getRandomValues(new Uint8Array(32))).replace(/[^a-zA-Z0-9]/g, "")}`;
  const tokenHash = await sha256(`${pepper}:${token}`);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  const { error } = await db.from("access_sessions").insert({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt });
  return { token, expiresAt, error };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Método inválido." }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const pepper = Deno.env.get("ACCESS_CODE_PEPPER");
    if (!url || !serviceKey || !pepper) return json({ success: false, error: "Acesso indisponível." }, 503);

    const db = createClient(url, serviceKey);
    const body = await req.json() as RequestBody;
    const action = body.action;

    if (action === "identity") {
      const authHeader = req.headers.get("Authorization") || "";
      const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      const { data: authData, error: authError } = await db.auth.getUser(accessToken);
      const authUser = authData.user;
      if (authError || !authUser) return json({ success: false, error: "Sessão inválida." }, 401);

      const email = (authUser.email || "").trim().toLowerCase();
      const metadata = (authUser.user_metadata || {}) as Record<string, unknown>;
      const metadataName = String(metadata.full_name || metadata.name || metadata.given_name || "").trim();
      const fields = "id, full_name, phone, email, credits, is_premium, premium_expires_at, access_code_last4";
      let { data: user } = await db.from("users").select(fields).eq("auth_user_id", authUser.id).maybeSingle();

      if (user && metadataName && (!user.full_name || user.full_name === "Cliente Magnetize")) {
        const { data: namedUser } = await db.from("users")
          .update({ full_name: metadataName, email: email || user.email || null })
          .eq("id", user.id)
          .select(fields)
          .single();
        if (namedUser) user = namedUser;
      }

      // Se a pessoa ainda estiver na sessão antiga por código, transforma esse
      // mesmo cadastro na nova conta para manter créditos, planos e compras.
      const legacyToken = req.headers.get("x-access-token") || "";
      if (!user && legacyToken.length >= 32) {
        const legacyTokenHash = await sha256(`${pepper}:${legacyToken}`);
        const { data: legacySession } = await db.from("access_sessions")
          .select("user_id, expires_at, revoked_at")
          .eq("token_hash", legacyTokenHash)
          .maybeSingle();
        if (legacySession && !legacySession.revoked_at && new Date(legacySession.expires_at).getTime() > Date.now()) {
          const { data: linked } = await db.from("users").update({
            auth_user_id: authUser.id,
            email: email || null,
            full_name: metadataName || "Cliente Magnetize",
          }).eq("id", legacySession.user_id).select(fields).single();
          user = linked;
        }
      }

      if (!user && email) {
        const { data: matchingUsers } = await db.from("users").select(fields).ilike("email", email).limit(1);
        const matchingUser = matchingUsers?.[0];
        if (matchingUser) {
          const { data: linked } = await db.from("users").update({ auth_user_id: authUser.id }).eq("id", matchingUser.id).select(fields).single();
          user = linked;
        }
      }

      if (!user) {
        const fallbackName = metadataName || (email ? email.split("@")[0] : "Cliente Magnetize");
        const { data: created, error: createError } = await db.from("users").insert({
          full_name: fallbackName,
          email: email || null,
          auth_user_id: authUser.id,
        }).select(fields).single();
        if (createError || !created) {
          console.error("Identity profile creation error:", createError);
          return json({ success: false, error: "Não foi possível preparar sua conta." }, 500);
        }
        user = created;
      }

      const session = await createSession(db, pepper, user.id);
      if (session.error) return json({ success: false, error: "Não foi possível iniciar o acesso." }, 500);
      return json({ success: true, token: session.token, expiresAt: session.expiresAt, ...profilePayload(user) });
    }

    if (action === "generate-code") {
      const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const fingerprintHash = await sha256(`${forwarded}:${req.headers.get("user-agent") || "unknown"}:${pepper}`);
      const dayStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await db.from("access_attempts").select("id", { count: "exact", head: true })
        .eq("fingerprint_hash", fingerprintHash).eq("succeeded", true).gte("attempted_at", dayStart);
      if ((count ?? 0) >= 5) return json({ success: false, error: "Limite de códigos atingido. Use um código já gerado." }, 429);

      let code = "";
      let codeHash = "";
      for (let attempt = 0; attempt < 5; attempt++) {
        code = generateAccessCode();
        codeHash = await sha256(`${pepper}:${code}`);
        const { count: matches } = await db.from("users").select("id", { count: "exact", head: true }).eq("access_code_hash", codeHash);
        if ((matches ?? 0) === 0) break;
        code = "";
      }
      if (!code) return json({ success: false, error: "Não foi possível gerar o código. Tente novamente." }, 500);

      const { data: user, error: userError } = await db.from("users").insert({
        full_name: "Cliente Magnetize",
        access_code_hash: codeHash,
        access_code_last4: code.slice(-4),
      }).select("id, credits, is_premium, premium_expires_at, access_code_last4").single();
      if (userError || !user) return json({ success: false, error: "Não foi possível gerar o código." }, 500);

      const session = await createSession(db, pepper, user.id);
      if (session.error) {
        await db.from("users").delete().eq("id", user.id);
        return json({ success: false, error: "Não foi possível iniciar o acesso." }, 500);
      }
      await db.from("access_attempts").insert({ fingerprint_hash: fingerprintHash, succeeded: true });
      return json({ success: true, code, token: session.token, expiresAt: session.expiresAt, ...profilePayload(user) });
    }

    if (action === "login-code") {
      const code = String(body.code ?? "").trim();
      if (!/^\d{7}$/.test(code)) return json({ success: false, error: "Digite um código de 7 dígitos." }, 400);

      const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const fingerprintHash = await sha256(`${forwarded}:${req.headers.get("user-agent") || "unknown"}:${pepper}`);
      const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { count } = await db.from("access_attempts").select("id", { count: "exact", head: true })
        .eq("fingerprint_hash", fingerprintHash).eq("succeeded", false).gte("attempted_at", windowStart);
      if ((count ?? 0) >= 10) return json({ success: false, error: "Muitas tentativas. Aguarde 15 minutos." }, 429);

      const codeHash = await sha256(`${pepper}:${code}`);
      const fields = "id, full_name, phone, credits, is_premium, premium_expires_at, access_code_last4, password_hash";
      let { data: user } = await db.from("users").select(fields).eq("access_code_hash", codeHash).maybeSingle();

      // Compatibilidade: a senha antiga passa a ser o código individual no primeiro acesso.
      if (!user) {
        const { data: legacyUsers } = await db.from("users").select(fields).is("access_code_hash", null).not("password_hash", "is", null).limit(500);
        for (const candidate of legacyUsers ?? []) {
          if (candidate.password_hash && await verifyLegacyPassword(code, candidate.password_hash)) {
            user = candidate;
            await db.from("users").update({ access_code_hash: codeHash, access_code_last4: code.slice(-4) }).eq("id", candidate.id);
            break;
          }
        }
      }

      await db.from("access_attempts").insert({ fingerprint_hash: fingerprintHash, succeeded: Boolean(user) });
      if (!user) return json({ success: false, error: "Código de acesso inválido." }, 401);

      const session = await createSession(db, pepper, user.id);
      if (session.error) return json({ success: false, error: "Não foi possível iniciar o acesso." }, 500);
      return json({ success: true, token: session.token, expiresAt: session.expiresAt, ...profilePayload({ ...user, access_code_last4: code.slice(-4) }) });
    }

    const rawToken = req.headers.get("x-access-token") || "";
    if (rawToken.length < 32) return json({ success: false, error: "Acesso expirado." }, 401);
    const tokenHash = await sha256(`${pepper}:${rawToken}`);
    const { data: session } = await db.from("access_sessions").select("id, user_id, expires_at, revoked_at")
      .eq("token_hash", tokenHash).maybeSingle();
    if (!session || session.revoked_at || new Date(session.expires_at).getTime() <= Date.now()) {
      return json({ success: false, error: "Acesso expirado." }, 401);
    }
    await db.from("access_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", session.id);

    if (action === "logout") {
      await db.from("access_sessions").update({ revoked_at: new Date().toISOString() }).eq("id", session.id);
      return json({ success: true });
    }

    if (action === "session") {
      const { data: user } = await db.from("users").select("id, full_name, phone, email, credits, is_premium, premium_expires_at, access_code_last4").eq("id", session.user_id).maybeSingle();
      if (!user) return json({ success: false, error: "Acesso não encontrado." }, 404);
      return json({ success: true, ...profilePayload(user) });
    }

    if (action === "account-data") {
      const [plans, transactions] = await Promise.all([
        db.from("user_plans").select("id, plan_id, plan_name, credits_purchased, amount_paid, is_lifetime, acquired_at").eq("user_id", session.user_id).order("acquired_at", { ascending: false }),
        db.from("credit_transactions").select("id, amount, transaction_type, description, created_at").eq("user_id", session.user_id).order("created_at", { ascending: false }).limit(20),
      ]);
      return json({ success: true, plans: plans.data ?? [], transactions: transactions.data ?? [] });
    }

    if (action === "transaction-status") {
      if (!body.transactionId) return json({ success: false, error: "Transação inválida." }, 400);
      const { data } = await db.from("pix_transactions").select("status").eq("id", body.transactionId).eq("user_id", session.user_id).maybeSingle();
      return json({ success: true, status: data?.status ?? null });
    }

    if (action === "deduct-credits") {
      const amount = Math.floor(Number(body.amount));
      if (!Number.isFinite(amount) || amount < 1 || amount > 1000) return json({ success: false, error: "Valor inválido." }, 400);
      const { data: user } = await db.from("users").select("credits").eq("id", session.user_id).maybeSingle();
      if (!user || user.credits < amount) return json({ success: false, error: "Créditos insuficientes." }, 402);
      const { data: updated } = await db.from("users").update({ credits: user.credits - amount }).eq("id", session.user_id).eq("credits", user.credits).select("id").maybeSingle();
      if (!updated) return json({ success: false, error: "Saldo alterado. Tente novamente." }, 409);
      return json({ success: true });
    }

    if (action === "delete") {
      if (!body.pixTransactionId) return json({ success: false, error: "Dados inválidos." }, 400);
      const { data: tx } = await db.from("pix_transactions").select("id, user_id, amount, status").eq("id", body.pixTransactionId).eq("user_id", session.user_id).maybeSingle();
      if (!tx || tx.status !== "paid" || tx.amount !== 1490) return json({ success: false, error: "Pagamento não confirmado." }, 402);
      await db.from("credit_transactions").delete().eq("user_id", session.user_id);
      await db.from("user_plans").delete().eq("user_id", session.user_id);
      await db.from("pix_transactions").delete().eq("user_id", session.user_id);
      await db.from("users").delete().eq("id", session.user_id);
      return json({ success: true });
    }

    return json({ success: false, error: "Ação inválida." }, 400);
  } catch (error) {
    console.error("Access function error:", error instanceof Error ? error.message : "unknown");
    return json({ success: false, error: "Erro inesperado. Tente novamente." }, 500);
  }
});