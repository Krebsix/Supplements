/**
 * i18n/runtime.js
 * ─────────────────────────────────────────────────────────────
 * Uebersetzung fuer Code AUSSERHALB von React-Komponenten.
 *
 * Die Fachlogik-Module (ConflictLogic, TimingEngine, ReferenceCheck,
 * CureManager, AbsorptionBlocker) erzeugen Texte, koennen aber keinen
 * Hook aufrufen — sie sind bewusst frei von React.
 *
 * WARUM NICHT EINFACH DEN STORE LESEN:
 * useStore.js importiert TimingEngine und AbsorptionBlocker. Wuerden diese
 * Module ihrerseits den Store importieren, entstuende ein Ringschluss
 * (useStore -> TimingEngine -> useStore), bei dem je nach Ladereihenfolge
 * eines der Module beim Import noch undefiniert ist. Deshalb haelt diese
 * Datei die aktive Sprache in einer eigenen Variablen und weiss nichts vom
 * Store.
 *
 * Der Store bleibt die Quelle der Wahrheit und spiegelt seinen Wert hierher
 * (setActiveLanguage) — beim Umschalten und beim Laden der gespeicherten
 * Einstellung. Diese Datei importiert nichts ausser den Katalogen.
 */

import de from './de/index';
import en from './en/index';

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
 * Fallback-Kette: gewaehlte Sprache -> Deutsch -> der Schluessel selbst.
 * Ein unbekannter Schluessel erscheint im Klartext statt als leere Zeile —
 * das faellt beim Testen sofort auf.
 */
export function translate(key, language = DEFAULT_LANGUAGE, vars = null) {
  const primary = CATALOGS[language]?.[key];
  if (typeof primary === 'string') return interpolate(primary, vars);

  const fallback = CATALOGS[DEFAULT_LANGUAGE]?.[key];
  if (typeof fallback === 'string') return interpolate(fallback, vars);

  return key;
}

// Spiegel der Store-Einstellung, siehe Dateikopf.
let activeLanguage = DEFAULT_LANGUAGE;

export function setActiveLanguage(language) {
  activeLanguage = isSupportedLanguage(language) ? language : DEFAULT_LANGUAGE;
}

export function getActiveLanguage() {
  return activeLanguage;
}

/**
 * tr(key, vars)
 * Uebersetzt in der aktuell aktiven Sprache. Fuer Fachlogik-Module.
 * In Komponenten stattdessen useTranslation() nutzen — nur der Hook
 * loest ein Neuzeichnen aus, wenn die Sprache wechselt.
 */
export function tr(key, vars) {
  return translate(key, activeLanguage, vars);
}
