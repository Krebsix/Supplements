/**
 * i18n/index.js
 * ─────────────────────────────────────────────────────────────
 * Zweisprachigkeit (Deutsch/Englisch) ohne zusaetzliche Bibliothek.
 *
 * WARUM KEINE LIBRARY:
 * Bei rund 300 Oberflaechen-Texten waere i18next mehr Abhaengigkeit als
 * Nutzen. Was hier gebraucht wird — Nachschlagen, Platzhalter einsetzen,
 * auf Deutsch zurueckfallen — passt in wenige Zeilen und bleibt damit
 * nachvollziehbar. Die App haelt es an anderen Stellen genauso.
 *
 * FALLBACK-KETTE:
 *   gewaehlte Sprache -> Deutsch -> der Schluessel selbst
 * Deutsch ist die Pflegesprache: neue Texte entstehen dort zuerst. Fehlt
 * eine englische Uebersetzung, erscheint der deutsche Satz statt einer
 * leeren Zeile oder eines technischen Schluessels. Das ist gewollt — so
 * blockiert eine fehlende Uebersetzung kein neues Feature.
 *
 * ABGRENZUNG:
 * Hier stehen nur Oberflaechen-Texte. Die Wirkstoff-Fachtexte in data/
 * bleiben vorerst deutsch (bewusste Entscheidung: eine unsaubere englische
 * Uebersetzung von "wird eingesetzt bei" klingt schnell praeskriptiv und
 * waere ein Compliance-Risiko, kein blosser Lokalisierungsfehler).
 */

import { useStore } from '../useStore';

import de from './de';
import en from './en';

export const LANGUAGES = [
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'en', label: 'English', short: 'EN' },
];

export const DEFAULT_LANGUAGE = 'de';

const CATALOGS = { de, en };

export function isSupportedLanguage(code) {
  return Object.prototype.hasOwnProperty.call(CATALOGS, code);
}

/**
 * Setzt Platzhalter ein: "{count} Produkte" + {count: 3} → "3 Produkte".
 * Fehlt ein Wert, bleibt der Platzhalter stehen — sichtbar falsch ist
 * besser als stillschweigend "undefined" im Satz.
 */
function interpolate(text, vars) {
  if (!vars || typeof text !== 'string') return text;
  return text.replace(/\{(\w+)\}/g, (placeholder, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : placeholder
  );
}

/**
 * translate(key, language, vars)
 * Direkt nutzbar ausserhalb von Komponenten (z. B. in Alert-Texten).
 */
export function translate(key, language = DEFAULT_LANGUAGE, vars = null) {
  const primary = CATALOGS[language]?.[key];
  if (typeof primary === 'string') return interpolate(primary, vars);

  const fallback = CATALOGS[DEFAULT_LANGUAGE]?.[key];
  if (typeof fallback === 'string') return interpolate(fallback, vars);

  // Weder uebersetzt noch auf Deutsch vorhanden: den Schluessel zeigen.
  // Das faellt beim Testen sofort auf, statt sich als leere Zeile zu
  // verstecken.
  return key;
}

/**
 * useTranslation()
 * Hook fuer Komponenten. Reagiert auf die Sprachumschaltung, weil die
 * Sprache im zustand-Store liegt und dieser die Komponente neu rendert.
 */
export function useTranslation() {
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);

  const active = isSupportedLanguage(language) ? language : DEFAULT_LANGUAGE;

  return {
    t: (key, vars) => translate(key, active, vars),
    language: active,
    setLanguage,
    languages: LANGUAGES,
  };
}
