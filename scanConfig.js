/**
 * scanConfig.js
 * ─────────────────────────────────────────────────────────────
 * Konfiguration fuer die echte Scan-Analyse (Supabase Edge Function).
 *
 * WICHTIG: Hier stehen KEINE Secrets. Der Claude-API-Key liegt
 * ausschliesslich als Secret in Supabase (Edge Function), nie in der App.
 * Supabase-URL und Anon-Key sind oeffentliche (publishable) Werte.
 *
 * Setup:
 *   1. supabase functions deploy analyze-supplement
 *   2. supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
 *   3. Werte unten eintragen.
 *
 * Solange SCAN_ANALYZE_URL leer ist, faellt der Scanner auf das
 * gekennzeichnete Mock-Ergebnis zurueck (analysisMode: 'mock').
 */

export const SCAN_ANALYZE_URL = '';
// Beispiel: 'https://abcdefgh.supabase.co/functions/v1/analyze-supplement'

export const SUPABASE_ANON_KEY = '';
