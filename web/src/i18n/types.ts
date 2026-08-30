/**
 * Struktur eines Woerterbuchs. Jede Sprache liefert genau diese Form
 * (`satisfies Dictionary`). Listen sind Tupel fester Laenge, damit eine
 * Sprache nicht still einen Punkt weniger hat als die andere.
 *
 * Struktur folgt dem Redesign "Evidenz-Dossier" (design_handoff_mysuplea_landing/,
 * 2026-08-30): Sektionen heissen Befund 01 / Prinzip 02 / Protokoll 03 /
 * Modell 04 / Anhang 05.
 */

export type Tone = 'caution' | 'affirm';

export interface Trick {
  readonly number: string;
  readonly title: string;
  readonly text: string;
  readonly counter: string;
}

export interface Stance {
  readonly tag: string;
  readonly title: string;
  readonly text: string;
}

export interface FaqItem {
  readonly q: string;
  readonly a: string;
}

export interface Fact {
  readonly key: string;
  readonly value: string;
}

export interface MockupRow {
  readonly name: string;
  readonly amount: string;
  readonly limit: string;
  readonly pct: number;
  readonly tone: Tone;
}

export interface Dictionary {
  readonly meta: {
    readonly title: string;
    readonly description: string;
    readonly ogHeadline: string;
    readonly ogAlt: string;
  };
  readonly header: {
    readonly tagline: string;
    readonly skipLink: string;
    readonly switchLabel: string;
    readonly switchAria: string;
    readonly nav: {
      readonly data: string;
      readonly pricing: string;
      readonly faq: string;
      readonly beta: string;
    };
  };
  readonly hero: {
    readonly badge: string;
    readonly headlinePlain: string;
    readonly headlineHighlight: string;
    readonly subline: string;
    readonly storeSoon: string;
    readonly storeApple: string;
    readonly storeGoogle: string;
  };
  readonly mockup: {
    readonly aria: string;
    readonly date: string;
    readonly title: string;
    readonly sumsTitle: string;
    readonly sumsSub: string;
    readonly limitLabel: string;
    readonly rows: readonly [MockupRow, MockupRow, MockupRow];
    readonly item1Name: string;
    readonly item1Dose: string;
    readonly item1State: string;
    readonly item2Name: string;
    readonly item2Dose: string;
    readonly item2State: string;
  };
  readonly stamp: {
    readonly ring: string;
    readonly center: string;
  };
  readonly ticker: readonly string[];
  readonly tricks: {
    tag: string;
    context: string;
    readonly title: string;
    readonly otherAppsLabel: string;
    readonly counterLabel: string;
    readonly items: readonly [Trick, Trick, Trick];
    readonly closingPlain: string;
    readonly closingHighlight: string;
  };
  readonly stance: {
    tag: string;
    context: string;
    readonly title: string;
    readonly items: readonly [Stance, Stance, Stance, Stance];
    readonly quote: string;
    readonly quoteCaption: string;
  };
  readonly data: {
    tag: string;
    context: string;
    readonly title: string;
    readonly paragraphs: readonly [string, string, string];
    readonly facts: readonly [Fact, Fact, Fact, Fact];
    readonly reportTag: string;
    readonly reportTitle: string;
    readonly reportBody: string;
    readonly reportItems: readonly [string, string, string, string];
    readonly limitsTag: string;
    readonly limitsTitle: string;
    readonly limitsItems: readonly [string, string, string];
  };
  readonly pricing: {
    tag: string;
    context: string;
    readonly title: string;
    readonly freeTag: string;
    readonly freeTitle: string;
    readonly freeItems: readonly string[];
    readonly proTag: string;
    readonly proTitle: string;
    readonly proItems: readonly string[];
    readonly whyTag: string;
    readonly whyTitle: string;
    readonly whyBody: string;
  };
  readonly faq: {
    tag: string;
    context: string;
    readonly title: string;
    readonly items: readonly [FaqItem, FaqItem, FaqItem, FaqItem, FaqItem];
  };
  readonly form: {
    readonly label: string;
    readonly placeholder: string;
    readonly cta: string;
    readonly ctaDone: string;
    readonly consentPrefix: string;
    readonly consentLink: string;
    readonly pending: string;
    readonly error: string;
  };
  readonly beta: {
    readonly title: string;
    readonly body: string;
  };
  readonly footer: {
    readonly madeBy: string;
    readonly privacy: string;
    readonly imprint: string;
    readonly terms: string;
    readonly contact: string;
    readonly odbl: string;
  };
}
