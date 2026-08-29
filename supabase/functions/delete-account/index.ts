/**
 * delete-account — Supabase Edge Function
 * ─────────────────────────────────────────────────────────────
 * Loescht das Konto der anfragenden Nutzerin (Apple 5.1.1(v), Google
 * Play: Konto-Loeschung muss in der App moeglich sein). Der Client darf
 * auth.users nicht selbst loeschen; hier wird das Nutzer-Token geprueft
 * und mit Service-Role geloescht. public.user_keys faellt per Cascade.
 *
 * Keine Secrets im Code: SUPABASE_URL, SUPABASE_ANON_KEY und
 * SUPABASE_SERVICE_ROLE_KEY stellt die Laufzeit bereit.
 *
 * Deploy:
 *   supabase functions deploy delete-account
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json({ error: "misconfigured" }, 500);

  // Wer ist das? Mit dem Nutzer-Token, nicht mit Service-Role.
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData?.user) return json({ error: "unauthorized" }, 401);

  const admin = createClient(url, serviceKey);
  const { error: deleteError } = await admin.auth.admin.deleteUser(userData.user.id);
  if (deleteError) {
    console.error("delete-account: Loeschung fehlgeschlagen", deleteError.message);
    return json({ error: "delete_failed" }, 500);
  }

  return json({ ok: true }, 200);
});
