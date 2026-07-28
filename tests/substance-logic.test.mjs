import { matchIngredient } from '../SubstanceMatcher.js';
import { buildSubstanceProfile, checkAgainstReference } from '../ReferenceCheck.js';
import { substances } from '../data/substances.js';
import { referenceValues, LIFE_STAGE_IDS } from '../data/referenceValues.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

console.log('\n— Matching —');
const m1 = matchIngredient({ name: 'Magnesiumbisglycinat', amount: '200', unit: 'mg' });
check('Magnesiumbisglycinat → magnesium', m1.substanceId === 'magnesium', JSON.stringify(m1.substanceId));
check('Form Bisglycinat erkannt', m1.form?.name === 'Bisglycinat', m1.form?.name);

const m2 = matchIngredient('Magnesium (Citrat) – 400 mg');
check('Freitext → magnesium', m2.substanceId === 'magnesium');
check('Form Citrat aus Freitext', m2.form?.name === 'Citrat', m2.form?.name);

const m3 = matchIngredient({ name: 'Vitamin D3', amount: '25', unit: 'mcg' });
check('mcg → µg normalisiert', m3.unit === 'µg', m3.unit);

const m4 = matchIngredient({ name: 'Irgendein Kräuterblend', amount: '', unit: '' });
check('Unbekanntes bleibt unmatched', m4.matched === false);

const m5 = matchIngredient({ name: 'MK-7', amount: '100', unit: 'µg' });
check('MK-7 → vitamin-k2', m5.substanceId === 'vitamin-k2', m5.substanceId);

console.log('\n— Referenzwert-Abgleich —');
const c1 = checkAgainstReference(m1, 'adult-woman');
check('200mg Mg Frau → below (Ref 300)', c1.status === 'below', c1.status);

const c2 = checkAgainstReference(m2, 'adult-woman');
check('400mg Mg → above_limit (UL 250)', c2.status === 'above_limit', c2.status);

// Vitamin D Einheitenumrechnung: 25 µg = 1000 IE, Referenz 800 IE, UL 4000
const c3 = checkAgainstReference(m3, 'adult-woman');
check('25µg VitD → 1000 IE umgerechnet', Math.round(c3.amount) === 1000, c3.amount);
check('1000 IE → above_reference', c3.status === 'above_reference', c3.status);

// Kind: engere Grenzen
const c4 = checkAgainstReference(m3, 'child-4-10');
check('1000 IE bei Kind → above_reference (UL 2000)', c4.status === 'above_reference', c4.status);

const mZinc = matchIngredient({ name: 'Zink', amount: '15', unit: 'mg' });
check('15mg Zink Kind → above_limit (UL 10)', checkAgainstReference(mZinc, 'child-4-10').status === 'above_limit');
check('15mg Zink Frau → above_reference (Ref 8, UL 25)', checkAgainstReference(mZinc, 'adult-woman').status === 'above_reference');

// Ohne Menge: kein Absturz, Status unknown
const mNoAmount = matchIngredient({ name: 'Selen' });
check('Ohne Menge → unknown', checkAgainstReference(mNoAmount, 'adult-woman').status === 'unknown');

console.log('\n— Profil —');
const p = buildSubstanceProfile(m1, 'menopause');
check('Profil hat Anwendungsgebiete', p.useCases.length > 0);
check('Krämpfe als Anwendungsgebiet', p.useCases.some(u => u.topic.toLowerCase().includes('krämpfe')));

console.log('\n— Falsch-Treffer-Schutz —');
for (const junk of ['Irgendein Kräuterblend', 'Kokosöl', 'Reismehl', 'Kieselerde', 'Inulin']) {
  const r = matchIngredient({ name: junk });
  check(`"${junk}" nicht falsch zugeordnet`, r.matched === false, r.substanceId ?? '');
}
const zinkMg = matchIngredient('Zink 10 mg');
check('"Zink 10 mg" → zinc, nicht magnesium', zinkMg.substanceId === 'zinc', zinkMg.substanceId);
check('"Zink 10 mg" Menge geparst', zinkMg.amount === 10 && zinkMg.unit === 'mg');
check('allForms für Vergleich vorhanden', p.allForms.length >= 5, p.allForms.length);

console.log('\n— Datenintegrität —');
const ids = substances.map(s => s.id);
check('Substanz-IDs eindeutig', new Set(ids).size === ids.length);
check('Alle Substanzen haben useCases', substances.every(s => s.useCases?.length > 0));
check('Alle Substanzen haben forms', substances.every(s => s.forms?.length > 0));
check('Alle Substanzen haben what', substances.every(s => s.what?.length > 20));

for (const [sid, entry] of Object.entries(referenceValues)) {
  if (!ids.includes(sid)) { console.log(`  FAIL Referenzwert für unbekannte Substanz: ${sid}`); failed++; }
  const missing = LIFE_STAGE_IDS.filter(ls => !entry.values[ls]);
  if (missing.length) { console.log(`  FAIL ${sid} fehlen Lebensphasen: ${missing}`); failed++; }
}
check('Referenzwerte vollständig über alle Lebensphasen', true);

// Referenzwert-Einheit muss zur Substanz-Einheit passen
for (const [sid, entry] of Object.entries(referenceValues)) {
  const sub = substances.find(s => s.id === sid);
  if (sub && sub.unit !== entry.unit) {
    console.log(`  FAIL Einheiten-Mismatch ${sid}: Substanz ${sub.unit} vs Referenz ${entry.unit}`);
    failed++;
  }
}
check('Einheiten konsistent zwischen Substanz und Referenzwert', true);

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
