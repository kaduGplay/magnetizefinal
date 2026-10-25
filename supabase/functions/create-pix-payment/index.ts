import { getCatalogPlan } from "../_shared/planCatalog.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { canReusePix, PIX_REUSE_WINDOW_MS } from "./reuse.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-access-token",
};

interface UtmParams {
  src?: string | null;
  sck?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_medium?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}

interface CreatePixPaymentRequest {
  planId: string;
  planName: string;
  amount: number; // in cents from frontend
  credits?: number;
  isLifetime?: boolean;
  isPremium?: boolean;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerDocument?: string;
  utmParams?: UtmParams;
}


async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

const DEFAULT_CUSTOMER = {
  email: "clienteia@gmail.com",
  document: "08594352700",
  phone: "31999676138",
} as const;

// Nomes fictícios realistas (BR) para mascarar quando o cliente não informa nome
const FICTITIOUS_NAMES = [
  "Ana Carolina Silva",
  "Bruno Henrique Souza",
  "Camila Oliveira Santos",
  "Daniel Pereira Lima",
  "Eduarda Martins Costa",
  "Felipe Rodrigues Alves",
  "Gabriela Ferreira Rocha",
  "Henrique Almeida Dias",
  "Isabela Barbosa Mendes",
  "João Victor Cardoso",
  "Larissa Gomes Ribeiro",
  "Mateus Carvalho Nunes",
  "Natália Ramos Teixeira",
  "Otávio Moreira Pinto",
  "Patrícia Castro Moura",
  "Rafael Souza Andrade",
  "Sabrina Lopes Freitas",
  "Thiago Nascimento Cruz",
  "Vanessa Correia Pires",
  "William Araújo Batista",
];

function pickRandomName(): string {
  return FICTITIOUS_NAMES[Math.floor(Math.random() * FICTITIOUS_NAMES.length)];
}

// Disfarce dos produtos enviados ao gateway (recibo) — nomes do dia a dia baratos
// para evitar clonagem da oferta. Não afeta o que o usuário vê no checkout.
const PRODUCT_DISGUISES = [
  "Receita de Pão Caseiro",
  "E-book Bolo de Cenoura",
  "Receita de Brigadeiro Gourmet",
  "Guia de Pães Artesanais",
  "Receita de Pudim de Leite",
  "E-book Doces Caseiros",
  "Guia de Sopas e Caldos",
  "Receita de Pizza de Frigideira",
  "E-book Marmitas Fit",
  "Receita de Coxinha Caseira",
];

function pickRandomProductName(): string {
  return PRODUCT_DISGUISES[Math.floor(Math.random() * PRODUCT_DISGUISES.length)];
}

const VOIDPAY_API_URL = "https://dash.voidpayments.com/api/v1/gateway/pix/receive";

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 8, delayMs = 1000): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`VoidPay request attempt ${attempt}/${maxRetries}`);
      const response = await fetch(url, options);
      const contentType = response.headers.get("content-type") || "";

      // Treat HTML responses (geo-blocked AWS NAT IPs) as retryable
      if (response.status === 403 && contentType.includes("text/html")) {
        console.log(`VoidPay geo-block on attempt ${attempt} (403 HTML), retrying with new IP...`);
        lastError = new Error("Geo-blocked: AWS NAT IP not allowed by VoidPay");
      } else if (response.ok || response.status < 500) {
        return response;
      } else {
        const errorData = await response
          .clone()
          .json()
          .catch(() => ({}));
        console.log(`VoidPay server error (attempt ${attempt}):`, errorData);
        lastError = new Error(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.log(`VoidPay network error (attempt ${attempt}):`, error);
      lastError = error instanceof Error ? error : new Error("Network error");
    }

    if (attempt < maxRetries) {
      console.log(`Waiting ${delayMs}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs = Math.min(delayMs * 1.5, 5000);
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VOIDPAY_PUBLIC_KEY = Deno.env.get("VOIDPAY_PUBLIC_KEY");
    const VOIDPAY_SECRET_KEY = Deno.env.get("VOIDPAY_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const ACCESS_CODE_PEPPER = Deno.env.get("ACCESS_CODE_PEPPER");

    if (!VOIDPAY_PUBLIC_KEY || !VOIDPAY_SECRET_KEY) {
      console.error("Missing VoidPay API keys");
      throw new Error("Payment configuration error");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ACCESS_CODE_PEPPER) {
      console.error("Missing Supabase configuration");
      throw new Error("Database configuration error");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: CreatePixPaymentRequest = await req.json();
    console.log("Received payment request:", JSON.stringify(body));

    const { planId, customerName, customerEmail, customerPhone, customerDocument } = body;

    const accessToken = req.headers.get("x-access-token") || "";
    if (accessToken.length < 32) {
      return new Response(JSON.stringify({ success: false, error: "Acesso expirado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const tokenHash = await sha256(`${ACCESS_CODE_PEPPER}:${accessToken}`);
    const { data: accessSession } = await supabase
      .from("access_sessions")
      .select("user_id, expires_at, revoked_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (!accessSession || accessSession.revoked_at || new Date(accessSession.expires_at).getTime() <= Date.now()) {
      return new Response(JSON.stringify({ success: false, error: "Acesso expirado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    body.userId = accessSession.user_id;

    const selectedPlan = getCatalogPlan(planId);
    if (!selectedPlan) {
      return new Response(JSON.stringify({ success: false, error: "Plano inválido." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { name: planName, amount, credits, isLifetime, isPremium } = selectedPlan;

    // Server-side reuse is scoped to the verified identity and catalog amount,
    // not client-provided prices. Opening again never extends created_at.
    const now = Date.now();
    const { data: recentPix, error: reuseError } = await supabase
      .from("pix_transactions")
      .select("id, korepay_id, amount, status, created_at, pix_qrcode, pix_expiration_date, secure_url")
      .eq("user_id", accessSession.user_id)
      .eq("amount", amount)
      .eq("status", "waiting_payment")
      .gt("created_at", new Date(now - PIX_REUSE_WINDOW_MS).toISOString())
      .order("created_at", { ascending: false })
      .limit(5);

    if (reuseError) {
      // Do not create another charge when we cannot establish whether one exists.
      throw new Error("Não foi possível verificar seu PIX pendente. Tente novamente.");
    }
    const reusable = recentPix?.find((transaction) => canReusePix(transaction, amount, now));
    if (reusable) {
      return new Response(
        JSON.stringify({
          success: true,
          reused: true,
          transactionId: reusable.id,
          korepayId: reusable.korepay_id,
          pixQrcode: reusable.pix_qrcode,
          pixExpirationDate: reusable.pix_expiration_date,
          secureUrl: reusable.secure_url,
          status: "PENDING",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Abuse guard: block users creating too many PIX with the same amount.
    // Sellers were repeatedly generating fake charges — cap at 5 open PIX
    // of the same amount per user in the last 24h.
    if (body.userId) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count, error: countError } = await supabase
        .from("pix_transactions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", body.userId)
        .eq("amount", Math.round(amount))
        .eq("status", "waiting_payment")
        .gte("created_at", since);

      if (countError) {
        console.error("Abuse-check query failed:", countError);
      } else if ((count ?? 0) >= 5) {
        console.log(`Abuse limit hit for user ${body.userId} amount ${amount}: ${count}`);
        return new Response(
          JSON.stringify({
            success: false,
            code: "ABUSE_LIMIT",
            error:
              "Detectamos múltiplos pagamentos PIX pendentes com o mesmo valor na sua conta. Por segurança, sua sessão foi encerrada. Faça login novamente para continuar.",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 429,
          },
        );
      }
    }

    // Frontend sends amount in cents (e.g., 990 = R$ 9,90)
    // VoidPay expects amount in REAIS (e.g., 9.90)
    const amountInCents = Math.round(amount);
    const amountInReais = Number((amountInCents / 100).toFixed(2));

    // Resolve customer data
    const resolvedName = (customerName || pickRandomName()).trim();
    const resolvedEmail = (
      customerEmail
        ? customerEmail
        : body.userId
          ? `clienteia+${body.userId}@gmail.com`
          : `clienteia+${crypto.randomUUID()}@gmail.com`
    ).trim();

    const resolvedPhoneRaw = (customerPhone || DEFAULT_CUSTOMER.phone).trim();
    const resolvedPhone = resolvedPhoneRaw.replace(/\D/g, "");

    const resolvedCpfRaw = (customerDocument || DEFAULT_CUSTOMER.document).trim();
    const resolvedCpf = resolvedCpfRaw.replace(/\D/g, "");
    if (resolvedCpf.length !== 11 && resolvedCpf.length !== 14) {
      throw new Error("CPF/CNPJ inválido");
    }

    // Generate unique identifier for this transaction
    const identifier = crypto.randomUUID();

    const metadataObj = {
      planId,
      planName,
      credits,
      isLifetime,
      isPremium,
      userId: body.userId || null,
      identifier,
    };

    // VoidPay uses callbackUrl (we keep the existing webhook function path)
    const webhookToken = await sha256(`magnetize-webhook:${VOIDPAY_SECRET_KEY}`);
    const callbackUrl = `${SUPABASE_URL}/functions/v1/korepay-webhook?token=${encodeURIComponent(webhookToken)}`;

    // Disfarce do produto enviado ao gateway (recibo VoidPay)
    const disguisedProductName = pickRandomProductName();

    const voidpayPayload: Record<string, unknown> = {
      identifier,
      amount: amountInReais,
      productName: disguisedProductName,
      description: disguisedProductName,
      client: {
        name: resolvedName,
        email: resolvedEmail,
        phone: resolvedPhone,
        document: resolvedCpf,
      },
      metadata: { ...metadataObj, disguisedProductName },
      callbackUrl,
    };

    console.log("Sending request to VoidPay:", JSON.stringify(voidpayPayload));

    const voidpayResponse = await fetchWithRetry(
      VOIDPAY_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-public-key": VOIDPAY_PUBLIC_KEY,
          "x-secret-key": VOIDPAY_SECRET_KEY,
        },
        body: JSON.stringify(voidpayPayload),
      },
      3,
      1000,
    );

    const voidpayData = await voidpayResponse.json();
    console.log("VoidPay response:", JSON.stringify(voidpayData));

    if (!voidpayResponse.ok) {
      console.error("VoidPay error:", voidpayData);
      throw new Error(voidpayData.message || voidpayData.errorDescription || "Failed to create payment");
    }

    // VoidPay response shape:
    // { transactionId, status: "OK"|"PENDING"|..., order: { id, url, receiptUrl }, pix: { code, base64, image } }
    const transactionId = String(voidpayData.transactionId || "");
    const txStatus = voidpayData.status || "PENDING";
    const orderObj = voidpayData.order || {};
    const secureId = orderObj.id || null;
    const secureUrl = orderObj.url || null;

    const pixObj = voidpayData.pix || {};
    const pixCode = pixObj.code || null;
    const pixBase64 = pixObj.base64 || null;
    const pixImage = pixObj.image || null;
    const pixExpirationDate = pixObj.expiresAt || pixObj.expirationDate || null;

    const userId = body.userId || null;
    const utmParamsFromRequest = body.utmParams || null;

    // Normalize status (VoidPay enum: OK | FAILED | PENDING | REJECTED | CANCELED)
    const statusUpper = txStatus.toUpperCase();
    let normalizedStatus = "waiting_payment";
    if (statusUpper === "OK" || statusUpper === "PAID" || statusUpper === "APPROVED") {
      // OK on creation usually means "pix gerado com sucesso", not paid yet.
      // Keep as waiting_payment so polling waits for the webhook.
      normalizedStatus = "waiting_payment";
    } else if (statusUpper === "PENDING") {
      normalizedStatus = "waiting_payment";
    } else if (statusUpper === "REJECTED" || statusUpper === "CANCELED" || statusUpper === "FAILED") {
      normalizedStatus = "refused";
    }

    // Save transaction to database
    const { data: transaction, error: dbError } = await supabase
      .from("pix_transactions")
      .insert({
        korepay_id: transactionId, // reusing existing column to store VoidPay transactionId
        amount: amountInCents,
        status: normalizedStatus,
        pix_qrcode: pixCode,
        pix_expiration_date: pixExpirationDate,
        customer_name: resolvedName,
        customer_email: resolvedEmail,
        customer_phone: resolvedPhone,
        customer_document: resolvedCpf,
        secure_url: secureUrl,
        secure_id: secureId,
        postback_url: callbackUrl,
        user_id: userId,
        utm_params: utmParamsFromRequest,
        metadata: metadataObj,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save transaction");
    }

    console.log("Transaction saved:", transaction.id);

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: transaction.id,
        korepayId: transactionId,
        pixQrcode: pixCode,
        pixExpirationDate,
        pixBase64,
        pixImage,
        secureUrl,
        status: txStatus,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: unknown) {
    console.error("Error creating PIX payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
