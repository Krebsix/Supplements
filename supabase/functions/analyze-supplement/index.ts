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

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_IMAGES = 4;
const MAX_BASE64_LENGTH = 6_000_000; // ~4.5 MB pro Bild
const ALLOWED_MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

const SYSTEM_PROMPT = `Du extrahierst Produktdaten von Fotos eines Nahrungsergaenzungsmittels.

Regeln:
- Uebernimm ausschliesslich, was auf den Fotos lesbar ist. Erfinde nichts und ergaenze nichts aus Allgemeinwissen.
- Nicht lesbare oder fehlende Angaben sind null bzw. bleiben weg. Lieber null als geraten.
- Unterscheide die chemische Form (z. B. Magnesiumbisglycinat vs. -citrat vs. -oxid), wenn sie auf dem Etikett steht.
- Gib keine gesundheitlichen Empfehlungen ab. "warnings" enthaelt nur Hinweise, die auf dem Etikett stehen.
- Antworte auf Deutsch.`;

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

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return jsonResponse(500, {
      error: "ANTHROPIC_API_KEY ist nicht als Secret gesetzt.",
    });
  }

  let images: IncomingImage[];
  try {
    const body = await req.json();
    images = Array.isArray(body?.images) ? body.images : [];
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
      model: Deno.env.get("ANALYZE_MODEL") ?? "claude-opus-5",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
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
