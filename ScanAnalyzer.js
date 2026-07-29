/**
 * ScanAnalyzer.js
 * ─────────────────────────────────────────────────────────────
 * Echte Foto-Analyse: schickt die vier Produktaufnahmen an die
 * Supabase Edge Function `analyze-supplement`, die sie mit der
 * Claude Vision API auswertet und strukturierte Produktdaten
 * zurueckgibt.
 *
 * Regeln (siehe CLAUDE.md):
 *   - Keine erfundenen Werte: Nicht Erkanntes bleibt leer.
 *   - Ergebnis traegt analysisMode 'vision' fuer Nachvollziehbarkeit.
 *   - Logik NIEMALS in UI-Komponenten.
 */

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import { getActiveLanguage, tr } from './i18n/runtime';
import { SCAN_ANALYZE_URL, SUPABASE_ANON_KEY } from './scanConfig';

// Kantenlaenge fuer den Upload: gross genug fuer lesbare Zutatentabellen,
// klein genug, um die Request-Groesse im Rahmen zu halten.
const UPLOAD_MAX_WIDTH = 1600;
const UPLOAD_COMPRESSION = 0.7;
const REQUEST_TIMEOUT_MS = 90000;

export function isAnalyzerConfigured() {
  return SCAN_ANALYZE_URL.trim().length > 0;
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function clampConfidence(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

// Zutat als lesbaren String aufbereiten, ohne fehlende Teile zu erfinden.
function formatIngredient(ingredient) {
  const name = cleanText(ingredient?.name);
  if (!name) return '';
  const amount = cleanText(ingredient?.amount);
  const unit = cleanText(ingredient?.unit);
  const form = cleanText(ingredient?.form);

  let label = name;
  if (form) label += ` (${form})`;
  if (amount && unit) label += ` – ${amount} ${unit}`;
  else if (amount) label += ` – ${amount}`;
  return label;
}

async function prepareImage(stepId, capture) {
  const resized = await manipulateAsync(
    capture.uri,
    [{ resize: { width: UPLOAD_MAX_WIDTH } }],
    { compress: UPLOAD_COMPRESSION, format: SaveFormat.JPEG, base64: true }
  );

  if (!resized?.base64) {
    throw new Error(tr('analyzer.prepareFailed', { step: stepId }));
  }

  return {
    step: stepId,
    mediaType: 'image/jpeg',
    data: resized.base64,
  };
}

/**
 * analyzeCaptures(captures)
 * captures: { front: {uri,...}, back: {...}, ingredients: {...}, dosage: {...} }
 * Rueckgabe: Scan-Ergebnis im Format von results.jsx / SupplementResultCard.
 */
export async function analyzeCaptures(captures) {
  if (!isAnalyzerConfigured()) {
    throw new Error(tr('analyzer.notConfigured'));
  }

  const entries = Object.entries(captures || {}).filter(
    ([, capture]) => Boolean(capture?.uri)
  );
  if (entries.length === 0) {
    throw new Error(tr('analyzer.noCaptures'));
  }

  const images = [];
  for (const [stepId, capture] of entries) {
    images.push(await prepareImage(stepId, capture));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(SCAN_ANALYZE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SUPABASE_ANON_KEY
          ? {
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              apikey: SUPABASE_ANON_KEY,
            }
          : {}),
      },
      // Sprache mitschicken: die Vision-Auswertung formuliert ihre
      // Freitextfelder in der Sprache, in der die App gerade laeuft.
      body: JSON.stringify({ images, language: getActiveLanguage() }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(tr('analyzer.timeout'));
    }
    throw new Error(tr('analyzer.unreachable'));
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let serverMessage = '';
    try {
      const body = await response.json();
      serverMessage = cleanText(body?.error);
    } catch {
      // Antwort war kein JSON — generische Meldung verwenden
    }
    throw new Error(
      serverMessage || tr('analyzer.failedWithStatus', { status: response.status })
    );
  }

  const payload = await response.json();
  const result = payload?.result;
  if (!result || typeof result !== 'object') {
    throw new Error(tr('analyzer.noResult'));
  }

  const ingredients = Array.isArray(result.ingredients) ? result.ingredients : [];
  const labelWarnings = Array.isArray(result.warnings)
    ? result.warnings.map(cleanText).filter(Boolean)
    : [];
  const uncertainties = Array.isArray(result.uncertainties)
    ? result.uncertainties.map(cleanText).filter(Boolean)
    : [];
  const detectedCertifications = Array.isArray(result.certifications)
    ? result.certifications.map(cleanText).filter(Boolean)
    : [];

  const intakeInstruction = cleanText(result.intakeInstruction);

  return {
    productName: cleanText(result.productName),
    brand: cleanText(result.brand),
    confidence: clampConfidence(result.confidence),
    detectedIngredients: ingredients.map(formatIngredient).filter(Boolean),
    // Rohdaten fuer den Substanz-Datenbank-Abgleich aufbewahren
    ingredientDetails: ingredients,
    // Erkannte Pruefsiegel (Phase 4) — Abgleich in data/certifications.js
    detectedCertifications,
    dosage: {
      amount: cleanText(result.dosage?.amount),
      unit: cleanText(result.dosage?.unit),
    },
    timingSuggestion: intakeInstruction
      ? tr('analyzer.manufacturerNote', { text: intakeInstruction })
      : '',
    warnings: [
      ...labelWarnings,
      ...uncertainties.map((item) => tr('analyzer.uncertain', { text: item })),
    ],
    uncertaintyNote: tr('analyzer.uncertaintyNote'),
    analysisMode: 'vision',
    analyzedAt: new Date().toISOString(),
  };
}
