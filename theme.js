/**
 * theme.js
 * ─────────────────────────────────────────────────────────────
 * Design-Tokens. Farben und Groessen gehoeren hierher, nicht in die
 * Komponenten.
 *
 * WARUM DIE PALETTE 2026-08-12 GEWECHSELT HAT:
 * Die Vorgaengerpalette hiess "Papier und Tinte": warmes Off-White
 * (#f6f3ed), Serifenschrift fuer Titel, gedeckte Erdtoene fuer Warnungen.
 * Sie war als Gegenentwurf zu den Tailwind-Standardwerten gedacht — und
 * war das zum Zeitpunkt der Entscheidung auch.
 *
 * Inzwischen ist genau diese Kombination zum Erkennungsmerkmal maschinell
 * gebauter Oberflaechen geworden: warmes Creme um #F4F1EA, kontraststarke
 * Serife, Terrakotta-Akzent. Wer die App heute sieht, ordnet sie diesem
 * Muster zu, unabhaengig davon, wie sorgfaeltig sie gebaut ist.
 *
 * Die Richtung heisst deshalb jetzt: native iOS-Anmutung.
 *   - Neutrale Systemgrautoene statt warmem Creme
 *   - Systemschrift (SF Pro auf iOS, Roboto auf Android) statt geladener
 *     Google-Fonts: nativ, kein Download, kleinere App
 *   - Apple-Schriftgroessen: Fliesstext 17 statt 14. Das ist der groesste
 *     einzelne Unterschied zwischen "wirkt gebaut" und "wirkt fertig"
 *   - Weisse Flaechen auf grauem Grund statt umrandeter Karten. Der
 *     Rahmen um jede Karte war das zweite Erkennungsmerkmal
 *
 * WAS BLEIBT: das tiefe Petrol als Akzent. Es traegt das App-Icon und ist
 * damit die einzige Farbe, die die Marke wirklich ausmacht.
 *
 * WAS INHALTLICH BLEIBT: Warnungen bleiben gedeckt. Eine
 * Grenzwertueberschreitung ist ein Hinweis, kein Alarm — Signalampel
 * wuerde die Einordnung uebertoenen. Die Statusfarben sind gegenueber
 * vorher nur klarer geworden, nicht lauter.
 */

export const colors = {
  // Flaechen: Apples Systemgrau-Logik. Der Bildschirmgrund ist grau,
  // Inhaltsbloecke sind weiss — der Kontrast ersetzt den Rahmen.
  canvas: '#f2f2f7',        // systemGroupedBackground
  surface: '#ffffff',       // Karten, Listenzeilen
  surfaceSunken: '#e9e9ee', // Eingabefelder, eingelassene Bereiche
  overlay: '#ffffff',

  // Schrift
  ink: '#0b2239',        // Navy, wie Website-Text (mysuplea.com --ink)
  inkMuted: '#44586e',   // Website --ink-muted (Kontrast siehe Test)
  inkFaint: '#6e6e74',  // 2026-08-31 abgedunkelt: 4.5:1 auch auf canvas (WCAG AA, Bedienregeln)      // tertiaryLabel, systemGray

  // Linien: navy-getoenter Ton statt iOS-Grau, wie die Website
  rule: '#dde3ea',
  ruleStrong: '#c3ccd6',

  // Akzent: Azur, dieselbe Familie wie App-Icon und Website
  // (mysuplea.com, web/src/styles/tokens.css). Eine Stufe dunkler als
  // das Website-Azur (#1e6fd9), weil #1e6fd9 auf dem App-Bildschirmgrund
  // (canvas) nur 4.35:1 erreicht, unter der eigenen 4,5:1-Regel.
  accent: '#1a63c4',
  accentSoft: '#e6eefa',
  accentInk: '#0b2239',

  // Statusfarben: klar genug, um unterscheidbar zu sein, gedaempft genug,
  // um nicht zu alarmieren.
  alert: '#b3382c',         // Ueberschreitung, Kontraindikation
  alertSoft: '#fbebe9',
  caution: '#96661a',       // Aufmerksamkeit, aerztlich abklaeren
  cautionSoft: '#fdf3e3',
  affirm: '#2c6b4f',        // unauffaellig, im Bereich
  affirmSoft: '#e8f2ec',
};

/**
 * Toene auf dunklem Azur/Navy (accentInk als Flaeche): Text und Grafik der
 * Tagesplan-Buehne. Aufhellungen von Azur/Navy statt Petrol,
 * gleiches Vorgehen wie beim Petrol-Refresh vom 2026-08-31 (abgeleitete
 * Toene, keine dritte Palette).
 */
export const onDark = {
  ink: '#ffffff',
  inkMuted: '#a9c4e8',
  accent: '#8fbdf0',
  rule: '#1e4a7a',
  checkInk: colors.accentInk,
};

/**
 * Schriften: Fliesstext und Bedienelemente bleiben Systemschrift (SF Pro
 * auf iOS, Roboto auf Android) — das laesst die App zur Plattform gehoeren.
 * Headlines und Sektionslabels bekommen seit Phase 2 der Website-Angleichung
 * (mysuplea.com) eigene Schnitte: Space Grotesk fuer Ueberschriften, IBM Plex
 * Mono fuer Eyebrow-Labels. Beide werden in app/_layout.jsx per useFonts
 * geladen; bis dahin faellt React Native auf die Systemschrift zurueck.
 *
 * In React Native heisst das: KEINE fontFamily setzen und das Gewicht ueber
 * fontWeight steuern. Nur dort, wo fontFamily auf einen eigenen Schnitt
 * zeigt (type.display/heading/subheading/eyebrow/eyebrowAccent unten), bleibt
 * fontWeight bewusst weg (Android-Faux-Bold).
 */
export const weight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const fonts = {
  displayBold: 'SpaceGrotesk_700Bold',
  displaySemi: 'SpaceGrotesk_600SemiBold',
  mono: 'IBMPlexMono_500Medium',
};

/**
 * Groessen nach Apples Type Scale. Fliesstext liegt bei 17 Punkt — die
 * frueheren 14 waren der Hauptgrund, warum die Oberflaeche gedraengt wirkte.
 */
export const type = {
  // Large Title: steht einmal oben auf dem Screen
  display: {
    fontSize: 34,
    lineHeight: 41,
    fontFamily: fonts.displayBold,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  // Title 3
  heading: {
    fontSize: 20,
    lineHeight: 25,
    fontFamily: fonts.displaySemi,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  // Headline
  subheading: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.displaySemi,
    color: colors.ink,
  },

  // Body
  body: { fontSize: 17, lineHeight: 24, fontWeight: weight.regular, color: colors.inkMuted },
  bodyStrong: { fontSize: 17, lineHeight: 24, fontWeight: weight.semibold, color: colors.ink },
  // Subheadline
  small: { fontSize: 15, lineHeight: 20, fontWeight: weight.regular, color: colors.inkMuted },
  // Footnote
  tiny: { fontSize: 13, lineHeight: 18, fontWeight: weight.regular, color: colors.inkFaint },

  // Abschnittsmarke ueber einer Gruppe, wie die Ueberschrift einer
  // gruppierten Liste in den iOS-Einstellungen. Mono-Uppercase wie auf
  // der Website (mysuplea.com).
  eyebrow: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.mono,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
  // Eyebrow in Akzentfarbe statt inkMuted, fuer hervorgehobene Marken
  // (z. B. den JETZT-Slot im Tagesplan).
  eyebrowAccent: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.mono,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: weight.medium,
    color: colors.inkFaint,
  },
  // Zahlen: tabellarisch, damit Ziffern in Listen untereinander stehen
  numeral: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: weight.semibold,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  quote: { fontSize: 17, lineHeight: 25, fontStyle: 'italic', color: colors.ink },
};

export const space = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 22, xxl: 30,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,   // Karten und Listengruppen
  xl: 20,   // Sheets, grosse Flaechen
  // Nur fuer Elemente, die wirklich rund sein muessen (Punkte, Marken).
  full: 999,
};

export const border = {
  hairline: 1,
  strong: 2,
};

/**
 * Wiederkehrende Bausteine. Screens setzen darauf auf, statt jede Karte
 * neu zu definieren.
 *
 * Seit Phase 2 der Website-Angleichung (mysuplea.com) bekommen Karten
 * wieder eine harte Haarlinie statt sich nur ueber die Flaeche vom
 * grauen Grund abzusetzen. Das ist die gleiche Optik wie auf der Website.
 */
export const surfaces = {
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: 48 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: border.hairline,
    borderColor: colors.rule,
    padding: space.lg,
    marginBottom: space.md,
  },

  // Gruppierte Liste: ein weisser Block, dessen Zeilen durch Haarlinien
  // getrennt sind. Das Muster der iOS-Einstellungen.
  listGroup: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: border.hairline,
    borderColor: colors.rule,
    overflow: 'hidden',
    marginBottom: space.lg,
  },
  listRow: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md + 2,
    minHeight: 48,
    justifyContent: 'center',
  },
  // Trennlinie zwischen zwei Zeilen. Sie beginnt eingerueckt, damit die
  // Gruppe als Block zusammenhaengt.
  listDivider: {
    height: border.hairline,
    backgroundColor: colors.rule,
    marginLeft: space.lg,
  },

  input: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontSize: 17,
    color: colors.ink,
  },

  buttonPrimary: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimaryText: { fontWeight: weight.semibold, color: '#ffffff', fontSize: 17 },

  buttonQuiet: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonQuietText: { fontWeight: weight.semibold, color: colors.accent, fontSize: 17 },

  chip: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: 8,
    // Tippflaeche 44 pt (CLAUDE.md Bedienregeln): Chips sind projektweit
    // tappbar (Sortierung, Einheiten, Haeufigkeit, Slots, Schwellen).
    minHeight: 44,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { fontWeight: weight.medium, color: colors.inkMuted, fontSize: 15 },
  chipTextActive: { color: '#ffffff' },
};

// Randfarben der Statusflaechen: jeweils der Ton selbst, aufgehellt.
const alertRule = '#f0cfca';
const cautionRule = '#eedcb8';
const affirmRule = '#c9dfd2';

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
