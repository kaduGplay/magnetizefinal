import { createClient } from "npm:@supabase/supabase-js@2.116.0";
import { analyticsPath, UUID_PATTERN } from "./policy.ts";

Deno.serve(async (req: Request) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return json({ error: "Método inválido." }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return json({ error: "Análise indisponível." }, 503);
  try {
    const text = await req.text();
    if (text.length > 2048) return json({ error: "Pedido inválido." }, 400);
    const body = JSON.parse(text);
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    if (body.action === "heartbeat") {
      const path = analyticsPath(body.path);
      if (!path || typeof body.visitorId !== "string" || !UUID_PATTERN.test(body.visitorId)) return json({ error: "Pedido inválido." }, 400);
      const { error } = await db.rpc("record_site_presence", { p_visitor_id: body.visitorId, p_path: path });
      if (error) return json({ error: "Coleta indisponível." }, 503);
      return json({ success: true });
    }
    if (body.action !== "snapshot" || ![2, 4].includes(body.hours)) return json({ error: "Pedido inválido." }, 400);
    const { data: snapshot, error } = await db.rpc("site_analytics_snapshot", { p_hours: body.hours });
    if (error) return json({ error: "A coleta ainda não está disponível. Tente novamente mais tarde." }, 503);
    return json(snapshot);
  } catch {
    return json({ error: "Não foi possível processar a análise." }, 400);
  }
});
