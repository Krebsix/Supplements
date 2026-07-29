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

export const SCAN_ANALYZE_URL =
  'https://zeflyivnxbmkyiacogzu.supabase.co/functions/v1/analyze-supplement';

export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZmx5aXZueGJta3lpYWNvZ3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyODM5NjcsImV4cCI6MjEwMDg1OTk2N30.1AAlXC9jtVb8NS0aE3QXCq6r6boreX6VkkFS-CcHU9M';
