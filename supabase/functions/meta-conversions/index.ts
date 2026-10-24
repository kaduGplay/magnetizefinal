import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PIXEL_ID = "814730385061712";
const API_VERSION = "v21.0";

interface EventData {
  event_name: string;
  event_time?: number;
  event_source_url?: string;
  event_id?: string;
  user_data?: {
    em?: string; // email (will be hashed)
    ph?: string; // phone (will be hashed)
    fn?: string; // first name (will be hashed)
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // fb click id
    fbp?: string; // fb browser id
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_ids?: string[];
    content_type?: string;
    order_id?: string;
  };
  action_source?: string;
}

interface RequestBody {
  event_name: string;
  event_id?: string;
  event_source_url?: string;
  user_email?: string;
  user_phone?: string;
  user_name?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string;
  fbp?: string;
  value?: number;
  currency?: string;
  content_name?: string;
  order_id?: string;
}

async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ACCESS_TOKEN = Deno.env.get("META_CONVERSIONS_API_TOKEN");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!ACCESS_TOKEN || !SERVICE_ROLE_KEY) {
      console.error("Missing META_CONVERSIONS_API_TOKEN");
      throw new Error("Meta Conversions API configuration error");
    }

    if (req.headers.get("Authorization") !== `Bearer ${SERVICE_ROLE_KEY}`) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const body: RequestBody = await req.json();
    console.log("[Meta CAPI] Received event:", body.event_name, "Order:", body.order_id);

    // Build user_data with hashed PII
    const userData: EventData["user_data"] = {};

    if (body.user_email) {
      userData.em = await hashSHA256(body.user_email);
    }
    if (body.user_phone) {
      const cleanPhone = body.user_phone.replace(/\D/g, "");
      userData.ph = await hashSHA256(cleanPhone);
    }
    if (body.user_name) {
      const firstName = body.user_name.split(" ")[0];
      userData.fn = await hashSHA256(firstName);
    }
    if (body.client_ip_address) {
      userData.client_ip_address = body.client_ip_address;
    }
    if (body.client_user_agent) {
      userData.client_user_agent = body.client_user_agent;
    }
    if (body.fbc) userData.fbc = body.fbc;
    if (body.fbp) userData.fbp = body.fbp;

    // Build event
    const eventData: EventData = {
      event_name: body.event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: body.event_id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      action_source: "website",
      user_data: userData,
    };

    if (body.event_source_url) {
      eventData.event_source_url = body.event_source_url;
    }

    // Custom data
    if (body.value !== undefined || body.content_name || body.order_id) {
      eventData.custom_data = {};
      if (body.value !== undefined) eventData.custom_data.value = body.value;
      if (body.currency) eventData.custom_data.currency = body.currency;
      if (body.content_name) eventData.custom_data.content_name = body.content_name;
      if (body.order_id) eventData.custom_data.order_id = body.order_id;
    }

    // Send to Meta
    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;
    const payload = {
      data: [eventData],
      access_token: ACCESS_TOKEN,
    };

    console.log("[Meta CAPI] Sending to:", url);
    console.log("[Meta CAPI] Payload:", JSON.stringify(payload.data));

    const metaResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const metaData = await metaResponse.json();
    console.log("[Meta CAPI] Response:", JSON.stringify(metaData), "Status:", metaResponse.status);

    if (!metaResponse.ok) {
      console.error("[Meta CAPI] Error:", metaData);
      return new Response(JSON.stringify({ success: false, error: metaData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Event ${body.event_name} sent successfully`,
        events_received: metaData.events_received,
        fbtrace_id: metaData.fbtrace_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error: unknown) {
    console.error("[Meta CAPI] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
