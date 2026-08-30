/**
 * beta-signup — Supabase Edge Function
 * ─────────────────────────────────────────────────────────────
 * Nimmt die Beta-Anmeldung von der Website (web/) entgegen und schreibt
 * die E-Mail-Adresse in public.beta_signups. Kein Mailversand: Die
 * Einladung verschickt Apple ueber TestFlight, sobald die Adresse dort
 * eingetragen wird. Deshalb gibt es auch kein Double-Opt-In.
 *
 * Schutz: Honeypot-Feld ("company", fuer Menschen unsichtbar) und das
 * bestehende IP-Rate-Limit (check_scan_rate_limit, Schluessel mit
 * Praefix "beta:", damit Scans und Anmeldungen getrennte Toepfe haben).
 * Doppelte Adressen werden still ignoriert, damit niemand ueber die
 * Antwort pruefen kann, ob eine Adresse schon eingetragen ist.
 *
 * Keine Secrets im Code: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY
 * stellt die Laufzeit bereit.
 *
 * Deploy:
 *   supabase functions deploy beta-signup --no-verify-jwt
 * (--no-verify-jwt, weil die Website keinen Supabase-Client und keinen
 *  Anon-Key hat; die Function ist bewusst oeffentlich erreichbar.)
 */

import { createClient } from "npm:@supabase/supabase-js@2";

// Nur die eigene Website darf das Formular absenden. Vercel-Previews
// (*.vercel.app) und die lokale Astro-Vorschau sind fuer Tests erlaubt.
const ALLOWED_ORIGINS = [
  "https://mysuplea.com",
  "https://www.mysuplea.com",
  "http://localhost:4321",
  "http://127.0.0.1:4321",
];
const VERCEL_PREVIEW = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MINUTES = 60;

const EMAIL_LIKE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LOCALES = new Set(["de", "en"]);
const IP_LIKE = /^[0-9a-fA-F:.]{3,45}$/;

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && (ALLOWED_ORIGINS.includes(origin) || VERCEL_PREVIEW.test(origin))
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

interface SignupBody {
  email?: unknown;
  locale?: unknown;
  source?: unknown;
  company?: unknown;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405, origin);

  let body: SignupBody;
  try {
    body = (await req.json()) as SignupBody;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400, origin);
  }

  // Honeypot gefuellt: Bot. Erfolg vortaeuschen, nichts speichern.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return json({ ok: true }, 200, origin);
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !EMAIL_LIKE.test(email)) {
    return json({ ok: false, error: "invalid_email" }, 400, origin);
  }
  const locale = typeof body.locale === "string" && LOCALES.has(body.locale) ? body.locale : "de";
  const source = typeof body.source === "string" ? body.source.slice(0, 40) : "website";

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ ok: false, error: "misconfigured" }, 500, origin);
  const admin = createClient(url, serviceKey);

  // Rate-Limit je IP, fail closed (gleiche Logik wie analyze-supplement).
  const trustedIp = req.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .pop();
  if (!trustedIp || !IP_LIKE.test(trustedIp)) {
    return json({ ok: false, error: "unavailable" }, 503, origin);
  }
  const { data: allowed, error: rateLimitError } = await admin.rpc("check_scan_rate_limit", {
    p_client_key: `beta:${trustedIp}`,
    p_max_requests: RATE_LIMIT_MAX_REQUESTS,
    p_window_minutes: RATE_LIMIT_WINDOW_MINUTES,
  });
  if (rateLimitError) {
    console.error("beta-signup: rate limit check failed", rateLimitError.message);
    return json({ ok: false, error: "unavailable" }, 503, origin);
  }
  if (allowed === false) return json({ ok: false, error: "rate_limited" }, 429, origin);

  // Doppelte Adresse: still ignorieren (ignoreDuplicates), Antwort bleibt ok.
  const { error: insertError } = await admin
    .from("beta_signups")
    .upsert({ email, locale, source }, { onConflict: "email", ignoreDuplicates: true });
  if (insertError) {
    console.error("beta-signup: insert failed", insertError.message);
    return json({ ok: false, error: "store_failed" }, 500, origin);
  }

  return json({ ok: true }, 200, origin);
});
