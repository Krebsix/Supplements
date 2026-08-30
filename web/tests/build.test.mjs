// Prueft das gebaute Output (dist/). Vorher `npm run build` ausfuehren.
//
//   1. Alle erwarteten Seiten existieren (Landing DE/EN, drei Rechtsseiten).
//   2. Genau eine H1 je Seite.
//   3. Keine externen Skripte, Stylesheets oder Schriften: Die Seite laedt
//      nichts nach, sonst widerspraeche sie ihrem Inhalt ("kein Tracking").
//   4. hreflang fuer de, en und x-default auf den Landingpages.
//   5. Keine Gedankenstriche im sichtbaren Text der Landingpages.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const LANDING = ['dist/index.html', 'dist/en/index.html'];
const LEGAL = ['dist/datenschutz/index.html', 'dist/impressum/index.html', 'dist/nutzung/index.html'];

for (const page of [...LANDING, ...LEGAL]) {
  test(`${page}: vorhanden, eine H1, nichts Externes`, () => {
    assert.ok(existsSync(page), `${page} fehlt, erst npm run build`);
    const html = readFileSync(page, 'utf8');
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, 'genau eine H1');
    assert.doesNotMatch(html, /<script[^>]+src=["']https?:/, 'externes Skript');
    assert.doesNotMatch(html, /<link[^>]+href=["']https?:\/\/(?!mysuplea\.com)/, 'externes Stylesheet');
    assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic/, 'Google Fonts');
  });
}

for (const page of LANDING) {
  test(`${page}: hreflang de, en, x-default`, () => {
    const html = readFileSync(page, 'utf8');
    for (const lang of ['de', 'en', 'x-default']) {
      assert.match(html, new RegExp(`hreflang="${lang}"`), `hreflang ${lang}`);
    }
  });

  test(`${page}: keine Gedankenstriche im Text`, () => {
    const html = readFileSync(page, 'utf8');
    const text = html
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]+>/g, ' ');
    assert.doesNotMatch(text, /[—–]/);
  });

  test(`${page}: JSON-LD fuer SoftwareApplication und FAQPage`, () => {
    const html = readFileSync(page, 'utf8');
    assert.match(html, /"@type":"SoftwareApplication"/);
    assert.match(html, /"@type":"FAQPage"/);
  });
}
