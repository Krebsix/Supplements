/**
 * i18n/index.js
 * ─────────────────────────────────────────────────────────────
 * Zweisprachigkeit (Deutsch/Englisch) ohne zusaetzliche Bibliothek.
 *
 * WARUM KEINE LIBRARY:
 * Bei rund 430 Oberflaechen-Texten waere i18next mehr Abhaengigkeit als
 * Nutzen. Was hier gebraucht wird — Nachschlagen, Platzhalter einsetzen,
 * auf Deutsch zurueckfallen — passt in wenige Zeilen und bleibt damit
 * nachvollziehbar. Die App haelt es an anderen Stellen genauso.
 *
 * ZWEI ZUGAENGE:
 *   useTranslation()  in Komponenten — reagiert auf die Umschaltung
 *   tr() aus runtime  in Fachlogik-Modulen, die keinen Hook nutzen koennen
 *
 * Die eigentliche Uebersetzungsmechanik liegt in runtime.js, weil sie ohne
 * Store-Abhaengigkeit auskommen muss (sonst entstuende ein Ringschluss mit
 * useStore, das seinerseits TimingEngine importiert).
 *
 * ABGRENZUNG:
 * Hier stehen nur Oberflaechen-Texte. Die Wirkstoff-Fachtexte in data/
 * bleiben vorerst deutsch (bewusste Entscheidung: eine unsaubere englische
 * Uebersetzung von "wird eingesetzt bei" klingt schnell praeskriptiv und
 * waere ein Compliance-Risiko, kein blosser Lokalisierungsfehler).
 */

import { useStore } from '../useStore';

import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  isSupportedLanguage,
  translate,
} from './runtime';

export {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  isSupportedLanguage,
  translate,
  tr,
  setActiveLanguage,
  getActiveLanguage,
} from './runtime';

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
