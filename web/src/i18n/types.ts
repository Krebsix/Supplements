/**
 * Struktur eines Woerterbuchs. Jede Sprache liefert genau diese Form
 * (`satisfies Dictionary`). Listen sind Tupel fester Laenge, damit eine
 * Sprache nicht still einen Punkt weniger hat als die andere.
 */

export type Tone = 'caution' | 'affirm';

export interface Trick {
  readonly title: string;
  readonly body: string;
}

export interface Pillar {
  readonly icon: IconName;
  readonly title: string;
  readonly body: string;
}

export interface FaqItem {
  readonly q: string;
  readonly a: string;
}

export interface MockupRow {
  readonly name: string;
  readonly amount: string;
  readonly limit: string;
  readonly tone: Tone;
}

export interface MockupSlotItem {
  readonly name: string;
  readonly dose: string;
  readonly done: boolean;
}

export type IconName =
  | 'bar-chart'
  | 'layers'
  | 'book-open'
  | 'search'
  | 'lock'
  | 'file-text'
  | 'tag'
  | 'activity'
  | 'database'
  | 'slash'
  | 'globe'
  | 'check'
  | 'arrow-right'
  | 'sun'
  | 'camera'
  | 'menu';

export interface Dictionary {
  readonly meta: {
    readonly title: string;
    readonly description: string;
    readonly ogHeadline: string;
    readonly ogAlt: string;
  };
  readonly header: {
    readonly switchLabel: string;
    readonly switchAria: string;
    readonly skipLink: string;
    readonly nav: {
      readonly data: string;
      readonly pricing: string;
      readonly faq: string;
      readonly beta: string;
    };
  };
  readonly hero: {
    readonly eyebrow: string;
    readonly headline: string;
    readonly subline: string;
    readonly note: string;
  };
  readonly mockup: {
    readonly aria: string;
    readonly screenTitle: string;
    readonly screenDate: string;
    readonly sumsTitle: string;
    readonly sumsSub: string;
    readonly limitLabel: string;
    readonly rows: readonly [MockupRow, MockupRow, MockupRow];
    readonly slotTitle: string;
    readonly slotTime: string;
    readonly slotItems: readonly [MockupSlotItem, MockupSlotItem];
    readonly doneLabel: string;
    readonly openLabel: string;
    readonly tabs: readonly [string, string, string, string];
  };
  readonly tricks: {
    readonly eyebrow: string;
    readonly title: string;
    readonly items: readonly [Trick, Trick, Trick];
    readonly closing: string;
  };
  readonly pillars: {
    readonly eyebrow: string;
    readonly title: string;
    readonly items: readonly [Pillar, Pillar, Pillar, Pillar];
  };
  readonly data: {
    readonly eyebrow: string;
    readonly title: string;
    readonly paragraphs: readonly [string, string, string];
    readonly facts: readonly [string, string, string];
  };
  readonly report: {
    readonly eyebrow: string;
    readonly title: string;
    readonly body: string;
    readonly sections: readonly [string, string, string, string];
  };
  readonly notList: {
    readonly eyebrow: string;
    readonly title: string;
    readonly items: readonly [string, string, string, string];
  };
  readonly pricing: {
    readonly eyebrow: string;
    readonly title: string;
    readonly free: { readonly title: string; readonly items: readonly string[] };
    readonly pro: { readonly title: string; readonly items: readonly string[] };
    readonly why: { readonly title: string; readonly body: string };
  };
  readonly faq: {
    readonly eyebrow: string;
    readonly title: string;
    readonly items: readonly [FaqItem, FaqItem, FaqItem, FaqItem, FaqItem];
  };
  readonly form: {
    readonly eyebrow: string;
    readonly title: string;
    readonly body: string;
    readonly label: string;
    readonly placeholder: string;
    readonly cta: string;
    readonly consent: string;
    readonly pending: string;
    readonly sending: string;
    readonly success: string;
    readonly error: string;
    readonly noscript: string;
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
