// Tests fuer data/bfrMaxAmounts.js und das EN-Overlay:
// Struktur-Invarianten (echte Substanz-IDs, Einheit nur mit Menge,
// Menge oder Notiz vorhanden) und Sprach-Paritaet der Notizen.

import { BFR_MAX_AMOUNTS, getBfrMaxAmount } from '../data/bfrMaxAmounts';
import { BFR_MAX_NOTES_EN } from '../data/en/bfrMaxAmounts';
import { substanceById } from '../data/substances';

let failures = 0;

function check(name, condition, extra = '') {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name} ${extra}`);
  }
}

console.log('— BfR-Hoechstmengen: Struktur —');
const entries = Object.entries(BFR_MAX_AMOUNTS);
check('29 Eintraege (alle BfR-bewerteten Vitamine und Mineralstoffe)', entries.length === 29, String(entries.length));
check('Jede ID existiert in substances.js', entries.every(([id]) => substanceById.has(id)));
check(
  'Einheit nur zusammen mit Menge (mg oder µg)',
  entries.every(([, e]) =>
    e.amount === null ? e.unit === null : typeof e.amount === 'number' && ['mg', 'µg'].includes(e.unit)
  )
);
check('Ohne Menge gibt es immer eine Notiz', entries.every(([, e]) => e.amount !== null || (typeof e.note === 'string' && e.note.length > 0)));
check('Jahr ist 2021, 2023 oder 2024', entries.every(([, e]) => [2021, 2023, 2024].includes(e.year)));
check('Keine Gedankenstriche in DE-Notizen', entries.every(([, e]) => !e.note || !e.note.includes('—')));
check(
  'Keine praeskriptiven Formulierungen ("nimm", "sollten Sie")',
  entries.every(([, e]) => !e.note || !/\bnimm\b|sollten sie\b/i.test(e.note))
);

console.log('— Aktualisierte Werte (EFSA 2023/2024) —');
check('Vitamin B6: 0,9 mg (2024)', BFR_MAX_AMOUNTS['vitamin-b6'].amount === 0.9 && BFR_MAX_AMOUNTS['vitamin-b6'].year === 2024);
check('Selen: 40 µg (2024)', BFR_MAX_AMOUNTS.selenium.amount === 40 && BFR_MAX_AMOUNTS.selenium.year === 2024);

console.log('— getBfrMaxAmount —');
check('Magnesium liefert 250 mg', getBfrMaxAmount('magnesium')?.amount === 250);
check('Unbekannte ID → null', getBfrMaxAmount('gibts-nicht') === null);

console.log('— EN-Overlay-Paritaet —');
const withNote = entries.filter(([, e]) => typeof e.note === 'string' && e.note.length > 0);
check(
  'Jede DE-Notiz hat eine EN-Uebersetzung',
  withNote.every(([id]) => typeof BFR_MAX_NOTES_EN[id] === 'string' && BFR_MAX_NOTES_EN[id].length > 0),
  withNote.filter(([id]) => !BFR_MAX_NOTES_EN[id]).map(([id]) => id).join(', ')
);
check(
  'Keine ueberzaehligen EN-Eintraege',
  Object.keys(BFR_MAX_NOTES_EN).every((id) => withNote.some(([deId]) => deId === id)),
  Object.keys(BFR_MAX_NOTES_EN).filter((id) => !withNote.some(([deId]) => deId === id)).join(', ')
);
check('Keine Gedankenstriche in EN-Notizen', Object.values(BFR_MAX_NOTES_EN).every((n) => !n.includes('—')));
check(
  'Keine Wirkversprechen in EN-Notizen',
  Object.values(BFR_MAX_NOTES_EN).every((n) => !/\b(cure|cures|heals|treats|boosts|recommended|you should)\b/i.test(n))
);

if (failures > 0) {
  console.error(`\n${failures} Fehlschlaege`);
  process.exit(1);
}
console.log('\nALLE TESTS BESTANDEN');
