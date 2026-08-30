/**
 * Sprachregister. Eine neue Sprache: Woerterbuch anlegen, hier eintragen,
 * locales in astro.config.mjs ergaenzen, Seite unter src/pages/<locale>/
 * anlegen. Der Typ Dictionary erzwingt Vollstaendigkeit beim Bauen.
 */
import type { Dictionary } from './types.ts';
import { de } from './de.ts';
import { en } from './en.ts';

export const LOCALES = ['de', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'de';

const dictionaries: Record<Locale, Dictionary> = { de, en };

/** Anzeigename der Sprache in der Sprache selbst (fuer den Sprachwechsel). */
export const LOCALE_NAMES: Record<Locale, string> = { de: 'Deutsch', en: 'English' };

/** BCP-47-Tag fuer <html lang> und Open Graph. */
export const LOCALE_TAGS: Record<Locale, string> = { de: 'de', en: 'en' };
export const OG_LOCALES: Record<Locale, string> = { de: 'de_DE', en: 'en_US' };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Pfad einer Seite in einer Sprache. Default-Sprache ohne Praefix. */
export function localePath(locale: Locale, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? clean : `/${locale}${clean}`;
}

/** Die jeweils andere Sprache (bei zwei Sprachen eindeutig, sonst die erste andere). */
export function otherLocale(locale: Locale): Locale {
  return LOCALES.find((l) => l !== locale) ?? DEFAULT_LOCALE;
}
