// Tests fuer data/en/substances.js: das englische Text-Overlay zur
// kanonischen (deutschen) Wirkstoff-Datenbank data/substances.js.
//
// Prueft drei Dinge:
//   1. Vollstaendigkeit: jede Substanz-ID hat einen Overlay-Eintrag, und
//      jedes im DE-Original vorhandene Freitextfeld ist im Overlay
//      vorhanden, nicht leer, und (bei useCases/forms) strukturell deckungs-
//      gleich mit dem Original -- siehe Header-Kommentar in data/en/
//      substances.js fuer die genaue Feldreferenz.
//   2. Verbotswoerter: keine Wirkversprechen im EN-Text (cure, treats, ...).
//   3. Kein Gedankenstrich im EN-Text.
//
// Ein still fehlendes oder mistranslatiertes Feld waere hier besonders
// riskant: es sind Gesundheitstexte, und ein leeres oder falsches Feld
// faellt in der UI nicht sofort auf.

import { substances } from '../data/substances.js';
import overlay from '../data/en/substances.js';

let failures = 0;

function check(name, condition) {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name}`);
  }
}

console.log('— substances-en: Vollstaendigkeit —');

const sourceIds = substances.map((s) => s.id);
const overlayIds = Object.keys(overlay);

check('jede Substanz-ID hat einen Overlay-Eintrag', sourceIds.every((id) => id in overlay));
check('keine ueberzaehligen Overlay-Eintraege ohne DE-Gegenstueck', overlayIds.every((id) => sourceIds.includes(id)));

for (const substance of substances) {
  const entry = overlay[substance.id];
  if (!entry) continue; // oben bereits als FAIL erfasst

  // what: bei allen 126 Substanzen im DE-Original vorhanden.
  if (typeof substance.what === 'string') {
    check(`${substance.id}: what vorhanden und nicht leer`, typeof entry.what === 'string' && entry.what.trim().length > 0);
  }

  // cautionNote: nur wenn im DE-Original vorhanden.
  const hasCaution = 'cautionNote' in substance;
  check(`${substance.id}: cautionNote-Praesenz stimmt mit DE ueberein`, hasCaution === ('cautionNote' in entry));
  if (hasCaution) {
    check(`${substance.id}: cautionNote nicht leer`, typeof entry.cautionNote === 'string' && entry.cautionNote.trim().length > 0);
  }

  // overdoseNote (BfR-Durchgang 2026-09-02): nur wenn im DE-Original vorhanden.
  const hasOverdose = 'overdoseNote' in substance;
  check(`${substance.id}: overdoseNote-Praesenz stimmt mit DE ueberein`, hasOverdose === ('overdoseNote' in entry));
  if (hasOverdose) {
    check(`${substance.id}: overdoseNote nicht leer`, typeof entry.overdoseNote === 'string' && entry.overdoseNote.trim().length > 0);
  }

  // useCases: gleiche Laenge und je Eintrag topic+note vorhanden.
  const sourceUseCases = substance.useCases ?? [];
  const overlayUseCases = entry.useCases ?? [];
  check(`${substance.id}: useCases gleiche Laenge wie DE (${sourceUseCases.length})`, overlayUseCases.length === sourceUseCases.length);
  check(
    `${substance.id}: jeder useCases-Eintrag hat topic und note`,
    overlayUseCases.every((uc) => typeof uc.topic === 'string' && uc.topic.trim().length > 0
      && typeof uc.note === 'string' && uc.note.trim().length > 0)
  );

  // forms: nur Formen mit note-Text im DE-Original brauchen einen
  // Overlay-Eintrag. Der Schluessel ist der exakte DE-Formname.
  const sourceFormsWithNote = (substance.forms ?? []).filter(
    (form) => typeof form.note === 'string' && form.note.trim().length > 0
  );
  const sourceFormNames = new Set((substance.forms ?? []).map((form) => form.name));
  const overlayForms = entry.forms ?? {};
  const overlayFormNames = Object.keys(overlayForms);

  check(
    `${substance.id}: jede DE-Form mit note-Text hat einen Overlay-Eintrag`,
    sourceFormsWithNote.every((form) => form.name in overlayForms)
  );
  check(
    `${substance.id}: forms-Overlay enthaelt keine unbekannten oder note-losen Formnamen`,
    overlayFormNames.every(
      (name) => sourceFormNames.has(name) && sourceFormsWithNote.some((form) => form.name === name)
    )
  );
  check(
    `${substance.id}: alle Overlay-Formtexte nicht leer`,
    overlayFormNames.every((name) => typeof overlayForms[name] === 'string' && overlayForms[name].trim().length > 0)
  );

  // unitConversion.note: kommt in der gesamten Datenbank nur bei vitamin-d3 vor.
  if (substance.unitConversion?.note) {
    check(`${substance.id}: unitConversion.note vorhanden und nicht leer`, typeof entry.unitConversion?.note === 'string' && entry.unitConversion.note.trim().length > 0);
  } else {
    check(`${substance.id}: kein erfundenes unitConversion im Overlay`, entry.unitConversion === undefined);
  }
}

console.log('— substances-en: Compliance —');

// Alle EN-Freitexte des Overlays einsammeln (nur String-Werte, keine Keys/IDs).
function collectStrings(value, out) {
  if (typeof value === 'string') {
    out.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((entry) => collectStrings(entry, out));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((entry) => collectStrings(entry, out));
  }
}

const allTexts = [];
collectStrings(overlay, allTexts);
check('Overlay enthaelt Texte', allTexts.length > 0);

// Verbotswoerter: Wirkversprechen/Direktansprache, die die deskriptive
// Formulierung der App unterlaufen wuerden. Wortgrenzen per \b.
const FORBIDDEN_PATTERN = /\b(cure|cures|heals|healing|treats|treatment of|boosts|recommended dose|you should|guarantees)\b/i;

const forbiddenHits = allTexts.filter((text) => FORBIDDEN_PATTERN.test(text));
check('keine Verbotswoerter in EN-Texten (cure/cures/heals/healing/treats/"treatment of"/boosts/"recommended dose"/"you should"/guarantees)', forbiddenHits.length === 0);
if (forbiddenHits.length > 0) {
  forbiddenHits.forEach((text) => console.error(`       Treffer: "${text}"`));
}

const emDashHits = allTexts.filter((text) => text.includes('—'));
check('kein Gedankenstrich ("—") in EN-Texten', emDashHits.length === 0);
if (emDashHits.length > 0) {
  emDashHits.forEach((text) => console.error(`       Treffer: "${text}"`));
}

if (failures > 0) {
  console.error(`\n${failures} TEST(S) FEHLGESCHLAGEN`);
  process.exit(1);
}
console.log('\nALLE TESTS BESTANDEN');
