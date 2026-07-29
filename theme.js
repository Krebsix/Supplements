/**
 * theme.js
 * ─────────────────────────────────────────────────────────────
 * Design-Tokens. Farben und Groessen gehoeren hierher, nicht in die
 * Komponenten.
 *
 * WARUM DIE PALETTE SO AUSSIEHT:
 * Vorher lief alles auf den Tailwind-Standardwerten — slate-900 als Text,
 * slate-500 fuer Sekundaeres, teal-700 als Akzent. Das ist die Palette,
 * die praktisch jedes schnell gebaute Projekt verwendet; man erkennt sie
 * auf einen Blick wieder, und die App sah aus wie tausend andere.
 *
 * Die neue Richtung ist "Papier und Tinte": warmes Off-White statt
 * blaustichigem Grau, ein tiefes Petrol als Akzent statt des ueblichen
 * Teal, gedeckte Erdtoene fuer Warnungen statt der Signalampel. Das passt
 * inhaltlich besser zu einer App, die Quellen zitiert und Zahlen einordnet
 * — sie soll wie ein sorgfaeltig gefuehrtes Nachschlagewerk wirken, nicht
 * wie ein Wellness-Dashboard.
 *
 * TYPOGRAFIE:
 * Ueberschriften laufen auf einer Serifenschrift. Das ist der sichtbarste
 * Unterschied zum Einheitslook, kostet nichts (Systemschriften, kein
 * Font-Download) und unterstuetzt den redaktionellen Charakter. Fliesstext
 * bleibt auf der Systemschrift, weil sie auf kleinen Groessen besser liest.
 *
 * RADIEN:
 * Die vollrunden Pillen (borderRadius 999) sind raus. Moderate Radien
 * wirken weniger nach Framework-Vorgabe und mehr nach Dokument.
 */

import { Platform } from 'react-native';

export const colors = {
  // Flaechen
  canvas: '#f6f3ed',        // warmes Papier statt blaustichigem Grau
  surface: '#fffdf9',       // Karten, minimal waermer als Weiss
  surfaceSunken: '#efeae1', // eingelassene Bereiche, Eingabefelder
  overlay: '#ffffff',

  // Schrift
  ink: '#1f1b16',           // fast schwarz, warm
  inkMuted: '#6b6157',      // Sekundaertext
  inkFaint: '#9a9085',      // Beschriftungen, Fussnoten

  // Linien
  rule: '#ded5c7',
  ruleStrong: '#c9bda9',

  // Akzent: tiefes Petrol. Seriös ohne Klinik-Kaelte, und nicht das
  // Teal, das jede zweite App verwendet.
  accent: '#1c4f5c',
  accentSoft: '#e3ecee',
  accentInk: '#0f3742',

  // Statusfarben bewusst gedeckt: Eine Grenzwertueberschreitung ist ein
  // Hinweis, kein Alarm. Signalrot wuerde die Einordnung uebertoenen.
  alert: '#8a3324',         // Ueberschreitung, Kontraindikation
  alertSoft: '#f7ebe7',
  caution: '#8a6420',       // Aufmerksamkeit, aerztlich abklaeren
  cautionSoft: '#f9f1e2',
  affirm: '#2f5741',        // unauffaellig, im Bereich
  affirmSoft: '#e8efe9',
};

const serif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
});

export const type = {
  // Ueberschriften: Serife, das Unterscheidungsmerkmal
  display: { fontFamily: serif, fontSize: 27, lineHeight: 34, color: colors.ink },
  heading: { fontFamily: serif, fontSize: 19, lineHeight: 25, color: colors.ink },
  subheading: { fontFamily: serif, fontSize: 15, lineHeight: 21, color: colors.ink },

  // Fliesstext: Systemschrift, liest sich klein besser
  body: { fontSize: 14, lineHeight: 21, color: colors.inkMuted },
  bodyStrong: { fontSize: 14, lineHeight: 21, color: colors.ink, fontWeight: '600' },
  small: { fontSize: 12, lineHeight: 18, color: colors.inkMuted },
  tiny: { fontSize: 11, lineHeight: 16, color: colors.inkFaint },

  // Bereichsmarke ueber einer Ueberschrift. Gesperrt gesetzt, wie eine
  // Rubrik im Print.
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.accent,
    fontWeight: '700',
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    fontWeight: '700',
  },
  // Zahlen und Zitate
  numeral: { fontFamily: serif, fontSize: 21, color: colors.ink },
  quote: { fontFamily: serif, fontSize: 14, lineHeight: 22, color: colors.ink },
};

export const space = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 22, xxl: 30,
};

export const radius = {
  sm: 3,
  md: 6,
  lg: 10,
  // Fuer runde Elemente, die es wirklich sein muessen (Marken, Punkte).
  // NICHT fuer Schaltflaechen.
  full: 999,
};

export const border = {
  hairline: 1,
  strong: 2,
};

/**
 * Wiederkehrende Bausteine. Screens setzen darauf auf, statt jede Karte
 * neu zu definieren — so bleibt das Erscheinungsbild einheitlich, auch
 * wenn spaeter jemand anderes einen Screen ergaenzt.
 */
export const surfaces = {
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: space.xl, paddingTop: space.xxl, paddingBottom: 48 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.rule,
    borderWidth: border.hairline,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
  },
  input: {
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.rule,
    borderWidth: border.hairline,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonPrimaryText: { color: colors.surface, fontSize: 15, fontWeight: '700' },
  buttonQuiet: {
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.rule,
    borderWidth: border.hairline,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonQuietText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  chip: {
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.rule,
    borderWidth: border.hairline,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.inkMuted, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: colors.surface },
};

// Randfarben der Statusflaechen: jeweils der Ton selbst, aufgehellt.
const alertRule = '#e6cec6';
const cautionRule = '#e8d9b8';
const affirmRule = '#cddbd1';

/**
 * Farbpaar fuer eine Statusstufe.
 *
 * Deckt bewusst alle Stufen ab, die im Projekt vorkommen — die
 * Schweregrade aus data/lifeStageAdvisories.js (contraindicated, medical,
 * attention, increased) ebenso wie die Warnstufen aus StackAnalyzer.js
 * (critical, notice, info). Faellt eine Stufe durch, erscheint sie neutral
 * grau, und ein Hinweis verliert still seine Kennzeichnung.
 */
export function toneFor(level) {
  switch (level) {
    case 'alert':
    case 'critical':
    case 'contraindicated':
      return { ink: colors.alert, surface: colors.alertSoft, rule: alertRule };
    case 'caution':
    case 'notice':
    case 'medical':
      return { ink: colors.caution, surface: colors.cautionSoft, rule: cautionRule };
    case 'affirm':
    case 'ok':
    case 'increased':
      return { ink: colors.affirm, surface: colors.affirmSoft, rule: affirmRule };
    // Aufmerksamkeitsstufe: kein Warnton, aber auch nicht unmarkiert —
    // sie bekommt den Akzent, so wie vor der Umstellung.
    case 'attention':
    case 'info':
      return { ink: colors.accentInk, surface: colors.accentSoft, rule: colors.rule };
    default:
      return { ink: colors.inkMuted, surface: colors.surfaceSunken, rule: colors.rule };
  }
}
