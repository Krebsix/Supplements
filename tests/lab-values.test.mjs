// Tests fuer LabValues.js: anlegen und bearbeiten. Bearbeiten behaelt die
// ID und createdAt, validiert wie anlegen und laesst unbekannte IDs in Ruhe.
import { createLabValue, updateLabValue } from '../LabValues';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}

console.log('— updateLabValue —');
const first = createLabValue({ markerId: 'ferritin', value: '45', unit: 'ng/ml', measuredAt: '2026-08-01', labName: 'Labor A' });
const second = createLabValue({ markerId: 'vitamin-d', value: '30', unit: 'ng/ml', measuredAt: '2026-08-02' });
const list = [second, first];

const updated = updateLabValue(list, first.id, { markerId: 'ferritin', value: '52', unit: 'µg/l', measuredAt: '2026-08-03', labName: 'Labor B', referenceMin: '30', referenceMax: '300' });
const entry = updated.find((e) => e.id === first.id);
check('ID bleibt', entry.id === first.id);
check('createdAt bleibt', entry.createdAt === first.createdAt);
check('Wert, Einheit, Datum, Labor uebernommen', entry.value === 52 && entry.unit === 'µg/l' && entry.dateKey === '2026-08-03' && entry.labName === 'Labor B');
check('Referenzbereich aus Eingabe', entry.referenceMin === 30 && entry.referenceMax === 300);
check('anderer Eintrag unveraendert', updated.find((e) => e.id === second.id) === second);
check('Reihenfolge bleibt', updated[0].id === second.id && updated[1].id === first.id);
check('ungueltiger Wert: Liste unveraendert (gleiche Referenz)', updateLabValue(list, first.id, { value: 'abc', measuredAt: '2026-08-03' }) === list);
check('unbekannte ID: Liste unveraendert', updateLabValue(list, 'nope', { value: '1', measuredAt: '2026-08-03' }) === list);
check('Eingabe wird nicht mutiert', first.value === 45);

if (failures > 0) { console.error(`\n${failures} Fehler`); process.exit(1); }
console.log('\nAlle LabValues-Tests bestanden.');
