/**
 * analyze-supplement — Supabase Edge Function
 * ─────────────────────────────────────────────────────────────
 * Nimmt 1–4 Produktfotos (base64) entgegen und extrahiert mit der
 * Claude Vision API strukturierte Etikettendaten (Structured Output
 * mit JSON-Schema — die Antwort ist garantiert schemakonform).
 *
 * Secrets (nie in der App!):
 *   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
 * Optional:
 *   supabase secrets set ANALYZE_MODEL=claude-opus-5
 *
 * Deploy:
 *   supabase functions deploy analyze-supplement
 */

import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

// Rate-Limit: Der Anon-Key ist oeffentlich (App-Bundle, Repo) und laesst
// sich ohne diese Sperre per curl beliebig oft aufrufen — jeder Aufruf
// loest einen kostenpflichtigen Claude-API-Call aus. Siehe Migration
// 20260729010000_scan_rate_limit.sql.
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MINUTES = 60;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_IMAGES = 4;
const MAX_BASE64_LENGTH = 6_000_000; // ~4.5 MB pro Bild
const ALLOWED_MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Modell-Override fuer den Qualitaetsvergleich (Haiku-Test, Decision
// 2026-08-09). Bewusst NUR Modelle, die guenstiger sind als der
// Opus-Default — sonst waere der oeffentliche Endpoint ein Kosten-Hebel.
// Der Produktiv-Default bleibt das ANALYZE_MODEL-Secret.
const MODEL_OVERRIDE_WHITELIST = new Set([
  "claude-haiku-4-5-20251001",
  "claude-haiku-4-5",
  "claude-sonnet-5",
]);

// Schema fuer die Extraktion. Grundsatz: Nicht Lesbares ist null/leer —
// das Modell darf nichts erfinden (Regel aus CLAUDE.md der App).
const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "productName",
    "brand",
    "confidence",
    "ingredients",
    "dosage",
    "intakeInstruction",
    "warnings",
    "uncertainties",
    "certifications",
  ],
  properties: {
    productName: {
      anyOf: [{ type: "string" }, { type: "null" }],
      description: "Produktname exakt wie auf der Verpackung, sonst null",
    },
    brand: {
      anyOf: [{ type: "string" }, { type: "null" }],
      description: "Marke/Hersteller wie auf der Verpackung, sonst null",
    },
    confidence: {
      type: "integer",
      description:
        "Gesamtkonfidenz 0-100: Wie vollstaendig und sicher wurden die Etikettendaten erkannt",
    },
    ingredients: {
      type: "array",
      description:
        "Wirkstoffe aus der Naehrstoff-/Zutatentabelle, pro Portion bzw. Tagesdosis",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "form", "amount", "unit"],
        properties: {
          name: {
            type: "string",
            description: "Wirkstoffname, z. B. 'Magnesium'",
          },
          form: {
            anyOf: [{ type: "string" }, { type: "null" }],
            description:
              "Chemische Form, falls angegeben, z. B. 'Bisglycinat', 'Citrat' — sonst null",
          },
          amount: {
            anyOf: [{ type: "string" }, { type: "null" }],
            description: "Menge als String, z. B. '200', sonst null",
          },
          unit: {
            anyOf: [{ type: "string" }, { type: "null" }],
            description: "Einheit, z. B. 'mg', 'µg', 'IE', sonst null",
          },
        },
      },
    },
    dosage: {
      type: "object",
      additionalProperties: false,
      required: ["amount", "unit"],
      description:
        "Empfohlene Verzehrmenge laut Hersteller-Etikett (z. B. 1 Kapsel)",
      properties: {
        amount: { anyOf: [{ type: "string" }, { type: "null" }] },
        unit: {
          anyOf: [{ type: "string" }, { type: "null" }],
          description: "z. B. 'Kapsel', 'Tablette', 'ml', 'Tropfen'",
        },
      },
    },
    intakeInstruction: {
      anyOf: [{ type: "string" }, { type: "null" }],
      description:
        "Einnahmehinweis des Herstellers woertlich vom Etikett (Zeitpunkt, zu Mahlzeiten etc.), sonst null",
    },
    warnings: {
      type: "array",
      items: { type: "string" },
      description:
        "Warn- und Pflichthinweise, die auf dem Etikett stehen (woertlich oder eng paraphrasiert)",
    },
    uncertainties: {
      type: "array",
      items: { type: "string" },
      description:
        "Stellen, die unleserlich, abgeschnitten oder mehrdeutig waren",
    },
    certifications: {
      type: "array",
      items: { type: "string" },
      description:
        "Auf der Verpackung sichtbare Pruefsiegel und Zertifizierungen, woertlich wie abgedruckt (z. B. 'Kölner Liste', 'USP Verified', 'GMP', 'V-Label'). Keine Markennamen, keine Werbeaussagen wie 'Premium' oder 'laborgeprueft'.",
    },
  },
} as const;

const BASE_RULES = `Du extrahierst Produktdaten von Fotos eines Nahrungsergaenzungsmittels.

Regeln:
- Uebernimm ausschliesslich, was auf den Fotos lesbar ist. Erfinde nichts und ergaenze nichts aus Allgemeinwissen.
- Nicht lesbare oder fehlende Angaben sind null bzw. bleiben weg. Lieber null als geraten.
- Unterscheide die chemische Form (z. B. Magnesiumbisglycinat vs. -citrat vs. -oxid), wenn sie auf dem Etikett steht.
- Gib keine gesundheitlichen Empfehlungen ab. "warnings" enthaelt nur Hinweise, die auf dem Etikett stehen.
- productName und brand bleiben unveraendert wie aufgedruckt (Eigennamen werden nicht uebersetzt).`;

// Die Ausgabesprache folgt der App-Einstellung, nicht der Etikettensprache:
// Wer die App auf Englisch bedient, soll ein englisches Etikett nicht
// uebersetzt bekommen und ein deutsches schon.
const LANGUAGE_RULES: Record<string, string> = {
  de: `- Alle Freitextfelder (intakeInstruction, warnings, uncertainties) gibst du auf
  Deutsch aus und uebersetzt sie bei Bedarf sinngemaess.
- ingredients[].name gibst du auf Deutsch an, wenn ein gebraeuchlicher deutscher
  Fachbegriff existiert (z. B. "Iron" -> "Eisen", "Magnesium Citrate" ->
  "Magnesiumcitrat", "Vitamin D3" bleibt "Vitamin D3"); existiert keine
  gebraeuchliche deutsche Bezeichnung, uebernimm den Namen wie auf dem Etikett.
- Antworte in jedem Fall auf Deutsch, unabhaengig von der Etikettensprache.`,

  en: `- Alle Freitextfelder (intakeInstruction, warnings, uncertainties) gibst du auf
  ENGLISCH aus und uebersetzt sie bei Bedarf sinngemaess.
- ingredients[].name gibst du auf Englisch an, wenn ein gebraeuchlicher englischer
  Fachbegriff existiert (z. B. "Eisen" -> "Iron", "Magnesiumcitrat" -> "Magnesium
  citrate", "Vitamin D3" bleibt "Vitamin D3"); existiert keine gebraeuchliche
  englische Bezeichnung, uebernimm den Namen wie auf dem Etikett.
- Formuliere beschreibend, niemals als Empfehlung: "is used for", nicht "take this for".
- Antworte in jedem Fall auf Englisch, unabhaengig von der Etikettensprache.`,
};

function buildSystemPrompt(language: string): string {
  const rules = LANGUAGE_RULES[language] ?? LANGUAGE_RULES.de;
  return `${BASE_RULES}\n${rules}`;
}

type IncomingImage = {
  step?: string;
  mediaType?: string;
  data?: string;
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Nur POST wird unterstuetzt." });
  }

  // Rate-Limit pruefen, BEVOR irgendetwas kostenpflichtiges passiert.
  // SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY sind fuer jede Edge Function
  // automatisch vorhanden — kein manuelles Secret noetig.
  //
  // X-Forwarded-For ist eine Kette "client, proxy1, proxy2, ...": Der
  // ERSTE Eintrag kommt vom Client selbst und ist frei faelschbar (ein
  // Angreifer koennte bei jedem Request einen neuen Fantasiewert senden
  // und so das Limit umgehen). Der LETZTE Eintrag wird vom naechsten,
  // vertrauenswuerdigen Hop (Supabase-Edge) angehaengt und ist die
  // einzige Stelle, die der Client nicht kontrolliert.
  const forwardedFor = req.headers.get("x-forwarded-for");
  const trustedIp = forwardedFor
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .pop();

  const IP_LIKE = /^[0-9a-fA-F:.]{3,45}$/;
  if (!trustedIp || !IP_LIKE.test(trustedIp)) {
    // Ohne verlaessliche Client-Kennung faellt die App geschlossen aus,
    // statt alle nicht identifizierbaren Anfragen in einen gemeinsamen
    // "unknown"-Topf zu werfen -- sonst koennte ein Angreifer diesen
    // gemeinsamen Topf ausschoepfen und damit alle anderen betroffenen
    // Clients blockieren.
    return jsonResponse(503, {
      error: "Dienst vorübergehend nicht verfügbar. Bitte später erneut versuchen.",
    });
  }
  const clientKey = trustedIp;

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: allowed, error: rateLimitError } = await supabaseAdmin.rpc(
      "check_scan_rate_limit",
      {
        p_client_key: clientKey,
        p_max_requests: RATE_LIMIT_MAX_REQUESTS,
        p_window_minutes: RATE_LIMIT_WINDOW_MINUTES,
      }
    );

    if (rateLimitError) {
      // Fail closed: Ohne funktionierende Rate-Limit-Pruefung lieber
      // ablehnen als ungeschuetzt kostenpflichtige Aufrufe zulassen.
      console.error("rate limit check failed:", rateLimitError);
      return jsonResponse(503, {
        error: "Dienst vorübergehend nicht verfügbar. Bitte später erneut versuchen.",
      });
    }

    if (allowed === false) {
      return jsonResponse(429, {
        error: "Zu viele Anfragen. Bitte in einer Stunde erneut versuchen.",
      });
    }
  } catch (error) {
    console.error("rate limit check error:", error);
    return jsonResponse(503, {
      error: "Dienst vorübergehend nicht verfügbar. Bitte später erneut versuchen.",
    });
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return jsonResponse(500, {
      error: "ANTHROPIC_API_KEY ist nicht als Secret gesetzt.",
    });
  }

  let images: IncomingImage[];
  let language = "de";
  let modelOverride: string | null = null;
  try {
    const body = await req.json();
    images = Array.isArray(body?.images) ? body.images : [];
    // Unbekannte Sprachcodes fallen auf Deutsch zurueck, statt den Prompt
    // mit einem beliebigen Wert aus dem Request zu fuettern.
    if (typeof body?.language === "string" && body.language in LANGUAGE_RULES) {
      language = body.language;
    }
    // Nicht gelistete Modelle werden ignoriert, nicht abgelehnt: Der
    // Aufruf laeuft dann einfach auf dem Produktiv-Default.
    if (
      typeof body?.model === "string" &&
      MODEL_OVERRIDE_WHITELIST.has(body.model)
    ) {
      modelOverride = body.model;
    }
  } catch {
    return jsonResponse(400, { error: "Ungueltiger Request-Body." });
  }

  if (images.length === 0 || images.length > MAX_IMAGES) {
    return jsonResponse(400, {
      error: `Es werden 1 bis ${MAX_IMAGES} Bilder erwartet.`,
    });
  }

  for (const image of images) {
    const mediaType = image.mediaType ?? "image/jpeg";
    if (!ALLOWED_MEDIA_TYPES.has(mediaType)) {
      return jsonResponse(400, { error: `Bildformat ${mediaType} wird nicht unterstuetzt.` });
    }
    if (typeof image.data !== "string" || image.data.length === 0) {
      return jsonResponse(400, { error: "Ein Bild enthaelt keine Daten." });
    }
    if (image.data.length > MAX_BASE64_LENGTH) {
      return jsonResponse(413, { error: "Ein Bild ist zu gross." });
    }
  }

  const stepLabels: Record<string, string> = {
    front: "Vorderseite",
    back: "Rueckseite",
    ingredients: "Zutaten-/Naehrstofftabelle",
    dosage: "Dosierung/Einnahmehinweise",
  };

  const content = [
    ...images.flatMap((image) => [
      {
        type: "text" as const,
        text: `Foto (${stepLabels[image.step ?? ""] ?? image.step ?? "unbekannt"}):`,
      },
      {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: (image.mediaType ?? "image/jpeg") as
            | "image/jpeg"
            | "image/png"
            | "image/webp",
          data: image.data as string,
        },
      },
    ]),
    {
      type: "text" as const,
      text: "Extrahiere die Etikettendaten dieses Nahrungsergaenzungsmittels gemaess Schema.",
    },
  ];

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: modelOverride ?? Deno.env.get("ANALYZE_MODEL") ?? "claude-opus-5",
      max_tokens: 16000,
      system: buildSystemPrompt(language),
      output_config: {
        format: { type: "json_schema", schema: RESULT_SCHEMA },
      },
      messages: [{ role: "user", content }],
    });

    if (response.stop_reason === "refusal") {
      return jsonResponse(422, {
        error: "Die Analyse wurde vom Modell abgelehnt. Bitte andere Fotos versuchen.",
      });
    }
    if (response.stop_reason === "max_tokens") {
      return jsonResponse(502, { error: "Die Analyse wurde abgeschnitten. Bitte erneut versuchen." });
    }

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return jsonResponse(502, { error: "Die Analyse hat keinen Text geliefert." });
    }

    const result = JSON.parse(textBlock.text);

    return jsonResponse(200, {
      result,
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("analyze-supplement error:", error);
    const status = (error as { status?: number })?.status;
    if (status === 429) {
      return jsonResponse(429, { error: "Rate-Limit erreicht. Bitte kurz warten." });
    }
    return jsonResponse(502, { error: "Die Analyse ist fehlgeschlagen." });
  }
});
