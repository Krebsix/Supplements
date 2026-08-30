// Compliance-Test fuer die Woerterbuecher, nach dem Muster der App-Tests
// (tests/substances-en.test.mjs im Repo-Root):
//   1. DE und EN haben exakt dieselben Schluessel.
//   2. Kein Gedankenstrich in irgendeinem Nutzertext.
//   3. Verbotswoerter aus der Health-Claims-Disziplin kommen nicht vor.
//   4. Deutsch nutzt echte Umlaute, keine ae/oe/ue-Ersatzschreibung.
//   5. Die Positionierung heisst "ohne Konto nutzbar", nicht "kein Konto".
//
// Node 24 laedt die .ts-Dateien per Type-Stripping; `satisfies` ist dabei
// erlaubt, weil es zur Laufzeit wegfaellt.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { de } from '../src/i18n/de.ts';
import { en } from '../src/i18n/en.ts';

function flatten(value, prefix = '') {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flatten(item, `${prefix}${index}.`));
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, child]) => flatten(child, `${prefix}${key}.`));
  }
  return [[prefix.replace(/\.$/, ''), value]];
}

const FORBIDDEN = {
  de: [
    /\bhilft\b/i,
    /\bwirkt\b/i,
    /\bheilt\b/i,
    /\bbehebt\b/i,
    /\bempfohlen\b/i,
    /\bkein Konto\b/i,
    /\bohne Konto\b(?! nutzbar)/i,
    /\bmedikament/i,
    /keine Werbung.{0,20}kein Shop/i,
  ],
  en: [
    /\bcures?\b/i,
    /\bheals?\b/i,
    /\btreats?\b/i,
    /\bboosts?\b/i,
    /\brecommended\b/i,
    /\byou should\b/i,
    /\bno account\b/i,
    /\bmedication\b/i,
  ],
};

// Typische Ersatzschreibungen, die beim Kopieren aus den launch/-Notizen
// haengen bleiben. Woerter wie "Quelle" oder "neue" sind bewusst nicht drin.
const ASCII_UMLAUT = /(aendern|ueber|fuer|koennt|praeparat|naehr|zusaetz|waehl|spaeter|loesch|veroeffentlicht|schluessel|verschluesselt|obergrenz\w*ue|woertlich|maerk|vollstaendig|persoenlich|aerzt)/i;

test('DE und EN haben dieselben Schluessel', () => {
  const keysDe = flatten(de).map(([key]) => key);
  const keysEn = flatten(en).map(([key]) => key);
  assert.deepEqual(keysDe, keysEn);
});

for (const [lang, dict] of [
  ['de', de],
  ['en', en],
]) {
  test(`${lang}: keine Gedankenstriche, keine Verbotswoerter`, () => {
    for (const [key, value] of flatten(dict)) {
      if (typeof value !== 'string') continue;
      assert.doesNotMatch(value, /[—–]/, `${key} enthaelt einen Gedankenstrich`);
      for (const pattern of FORBIDDEN[lang]) {
        assert.doesNotMatch(value, pattern, `${key} trifft ${pattern}`);
      }
    }
  });
}

test('de: echte Umlaute statt ae/oe/ue', () => {
  for (const [key, value] of flatten(de)) {
    if (typeof value !== 'string') continue;
    assert.doesNotMatch(value, ASCII_UMLAUT, `${key} nutzt Ersatzschreibung`);
  }
});

test('Listen fester Laenge sind gleich lang', () => {
  assert.equal(de.tricks.items.length, en.tricks.items.length);
  assert.equal(de.stance.items.length, en.stance.items.length);
  assert.equal(de.faq.items.length, en.faq.items.length);
  assert.equal(de.data.facts.length, en.data.facts.length);
  assert.equal(de.data.reportItems.length, en.data.reportItems.length);
  assert.equal(de.data.limitsItems.length, en.data.limitsItems.length);
  assert.equal(de.pricing.freeItems.length, en.pricing.freeItems.length);
  assert.equal(de.pricing.proItems.length, en.pricing.proItems.length);
  assert.equal(de.ticker.length, en.ticker.length);
});
