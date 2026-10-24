import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransactionMetadata {
  planId?: string;
  planName?: string;
  credits?: number;
  isLifetime?: boolean;
  isPremium?: boolean;
  identifier?: string;
  userId?: string | null;
}

interface UtmParams {
  src?: string | null;
  sck?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_medium?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const VOIDPAY_SECRET_KEY = Deno.env.get("VOIDPAY_SECRET_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !VOIDPAY_SECRET_KEY) {
      throw new Error("Database configuration error");
    }

    const expectedToken = await sha256(`magnetize-webhook:${VOIDPAY_SECRET_KEY}`);
    const suppliedToken = new URL(req.url).searchParams.get("token") || "";
    if (!suppliedToken || suppliedToken !== expectedToken) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    console.log("Received VoidPay webhook:", JSON.stringify(body));

    // VoidPay webhook payload:
    // {
    //   event: "TRANSACTION_CREATED" | "TRANSACTION_PAID" | "TRANSACTION_CANCELED" | "TRANSACTION_REFUNDED" | "TRANSACTION_CHARGED_BACK",
    //   token: "...",
    //   client: { ... },
    //   transaction: { id, identifier, status, amount, paidAt, metadata, ... },
    //   ...
    // }

    const event: string = body.event || "";
    // VoidPay may deliver the transaction fields either nested under
    // `transaction` or at the top-level of the payload. Support both.
    const tx = body.transaction || body.data || body;
    const voidpayTxId = String(tx.id || tx.transactionId || body.transactionId || "");
    const identifier: string =
      tx.identifier || body.identifier || tx.reference || "";
    const rawStatus: string = tx.status || body.status || "";
    const paidAt: string | null =
      tx.paidAt || tx.paid_at || body.paidAt || body.paid_at || null;

    // Parse metadata - might be object or JSON string
    let parsedMetadata: TransactionMetadata = {};
    if (tx.metadata) {
      try {
        parsedMetadata = typeof tx.metadata === "string"
          ? JSON.parse(tx.metadata)
          : tx.metadata;
      } catch {
        console.log("Could not parse metadata:", tx.metadata);
      }
    }

    const metaIdentifier = parsedMetadata.identifier || identifier;

    console.log("Event:", event, "VoidPay TX ID:", voidpayTxId, "Status:", rawStatus, "Identifier:", metaIdentifier);

    if (!voidpayTxId && !metaIdentifier) {
      console.error("No transaction ID or identifier found");
      return new Response(
        JSON.stringify({ success: true, message: "No transaction ID found, ignored" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Determine normalized status — prefer event over raw status
    let normalizedStatus = "waiting_payment";
    const eventUpper = event.toUpperCase();
    const statusUpper = (rawStatus || "").toUpperCase();

    if (eventUpper === "TRANSACTION_PAID" || statusUpper === "OK" || statusUpper === "PAID" || statusUpper === "APPROVED") {
      normalizedStatus = "paid";
    } else if (eventUpper === "TRANSACTION_CREATED" || statusUpper === "PENDING") {
      normalizedStatus = "waiting_payment";
    } else if (eventUpper === "TRANSACTION_CANCELED" || statusUpper === "CANCELED" || statusUpper === "REJECTED" || statusUpper === "FAILED") {
      normalizedStatus = "refused";
    } else if (eventUpper === "TRANSACTION_REFUNDED" || eventUpper === "TRANSACTION_CHARGED_BACK") {
      normalizedStatus = "refunded";
    }

    console.log("Normalized status:", normalizedStatus);

    // Find transaction - try by korepay_id (VoidPay transactionId), then by identifier in metadata
    let existingTx = null;

    if (voidpayTxId) {
      const { data, error } = await supabase
        .from("pix_transactions")
        .select("*")
        .eq("korepay_id", voidpayTxId)
        .maybeSingle();
      if (!error && data) existingTx = data;
    }

    if (!existingTx && metaIdentifier) {
      const { data, error } = await supabase
        .from("pix_transactions")
        .select("*")
        .contains("metadata", { identifier: metaIdentifier })
        .maybeSingle();
      if (!error && data) existingTx = data;
    }

    // Last-resort: match by the raw identifier used on our end as korepay_id
    if (!existingTx && metaIdentifier) {
      const { data, error } = await supabase
        .from("pix_transactions")
        .select("*")
        .eq("korepay_id", metaIdentifier)
        .maybeSingle();
      if (!error && data) existingTx = data;
    }

    if (!existingTx) {
      console.log("Transaction not found for VoidPay ID:", voidpayTxId, "identifier:", metaIdentifier);
      return new Response(
        JSON.stringify({ success: true, message: "Transaction not found, ignored" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const updateData: Record<string, unknown> = {
      status: normalizedStatus,
    };

    if (voidpayTxId && existingTx.korepay_id !== voidpayTxId) {
      updateData.korepay_id = voidpayTxId;
    }

    if (paidAt) {
      updateData.paid_at = paidAt;
    } else if (normalizedStatus === "paid") {
      updateData.paid_at = new Date().toISOString();
    }

    const { data: transaction, error: dbError } = await supabase
      .from("pix_transactions")
      .update(updateData)
      .eq("id", existingTx.id)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to update transaction");
    }

    console.log("Transaction updated:", transaction?.id, "Status:", normalizedStatus);

    if (normalizedStatus === "paid" && transaction) {
      await processPaymentConfirmation(supabase, transaction, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error processing webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});

// deno-lint-ignore no-explicit-any
async function processPaymentConfirmation(
  supabase: any,
  transaction: Record<string, unknown>,
  supabaseUrl: string,
  serviceRoleKey: string
) {
  console.log("Payment confirmed for transaction:", transaction.id);

  const metadata = transaction.metadata as TransactionMetadata | null;
  const userId = transaction.user_id as string | null;

  if (!userId || !metadata) {
    console.log("No userId or metadata, skipping credit processing");
    return;
  }

  const credits = metadata.credits || 0;
  const planId = metadata.planId || "unknown";
  const planName = metadata.planName || "Plano";
  const isLifetime = metadata.isLifetime || false;
  const isPremium = metadata.isPremium || false;

  console.log("Processing credits for user:", userId, "Credits:", credits);

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id, credits, is_premium")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    console.error("Error fetching user:", userError);
    return;
  }

  const newCredits = (userData.credits || 0) + credits;
  const updateUserData: Record<string, unknown> = { credits: newCredits };

  if (isPremium) {
    updateUserData.is_premium = true;
    if (isLifetime) {
      updateUserData.premium_expires_at = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      updateUserData.premium_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  const { error: updateError } = await supabase.from("users").update(updateUserData).eq("id", userId);
  if (updateError) {
    console.error("Error updating user credits:", updateError);
  } else {
    console.log("User credits updated. New balance:", newCredits);
  }

  const { error: planError } = await supabase.from("user_plans").insert({
    user_id: userId,
    plan_id: planId,
    plan_name: planName,
    credits_purchased: credits,
    amount_paid: transaction.amount as number,
    is_lifetime: isLifetime,
  });
  if (planError) console.error("Error recording plan:", planError);

  const { error: txError } = await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount: credits,
    transaction_type: "purchase",
    description: `Compra: ${planName}`,
    pix_transaction_id: transaction.id as string,
  });
  if (txError) console.error("Error recording credit transaction:", txError);


  // Send Purchase event to Meta Conversions API
  const amountInBRL = (transaction.amount as number) / 100;
  const metaPayload = {
    event_name: "Purchase",
    event_id: `purchase_${transaction.id}`,
    event_source_url: "https://magnetize.site/thank-you",
    user_email: transaction.customer_email || undefined,
    user_phone: transaction.customer_phone || undefined,
    user_name: transaction.customer_name || undefined,
    value: amountInBRL,
    currency: "BRL",
    content_name: planName,
    order_id: transaction.id as string,
  };

  fetch(`${supabaseUrl}/functions/v1/meta-conversions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify(metaPayload),
  })
    .then((res) => res.json())
    .then((data) => console.log("[Meta CAPI] Purchase event sent:", data))
    .catch((err) => console.error("[Meta CAPI] Error sending Purchase:", err));
}
