// Tests fuer data/healthConditions.js und die Erkrankungs-Schicht in
// ProfileCheck.js. Kernstueck ist die Zitat-Integritaet: Jedes quote
// muss WOERTLICH im cautionNote der referenzierten Substanz stehen —
// sonst behauptet die App etwas, das die Quelle nicht mehr hergibt
// (gleiche Disziplin wie tests fuer medicationClasses).

import {
  HEALTH_CONDITIONS,
  conditionInteractions,
  getHealthCondition,
  getInteractionsForConditions,
} from '../data/healthConditions';
import { getSubstance } from '../data/substances';
import { checkProfileAgainstStack } from '../ProfileCheck';

let failures = 0;

function check(name, condition, extra = '') {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name} ${extra}`);
  }
}

console.log('— Zitat-Integritaet —');
const VALID_SEVERITIES = new Set(['contraindicated', 'medical', 'attention']);
const conditionIds = new Set(HEALTH_CONDITIONS.map((c) => c.id));
for (const entry of conditionInteractions) {
  const substance = getSubstance(entry.substanceId);
  check(
    `${entry.conditionId}/${entry.substanceId}: Substanz existiert, Zitat steht woertlich im ${entry.sourceField}`,
    Boolean(substance) &&
      typeof substance[entry.sourceField] === 'string' &&
      substance[entry.sourceField].includes(entry.quote),
    substance ? `Zitat nicht gefunden: "${entry.quote.slice(0, 60)}..."` : 'Substanz fehlt'
  );
  if (!VALID_SEVERITIES.has(entry.severity)) {
    check(`${entry.conditionId}/${entry.substanceId}: gueltige Severity`, false, entry.severity);
  }
  if (!conditionIds.has(entry.conditionId)) {
    check(`${entry.substanceId}: conditionId registriert`, false, entry.conditionId);
  }
}

console.log('— Struktur —');
check('Mindestens 8 Erkrankungen definiert', HEALTH_CONDITIONS.length >= 8);
check('Mindestens 20 belegte Bezuege', conditionInteractions.length >= 20);
check('getHealthCondition findet Bluthochdruck', getHealthCondition('hypertension')?.label === 'Bluthochdruck');
check('getHealthCondition(unbekannt) → null', getHealthCondition('gibts-nicht') === null);
check('Filter liefert nur gewuenschte Erkrankungen',
  getInteractionsForConditions(['hypertension']).every((e) => e.conditionId === 'hypertension'));
check('Leere Auswahl → leere Liste', getInteractionsForConditions([]).length === 0);

console.log('— EN-Overlay-Integritaet —');
const { HEALTH_CONDITIONS_EN, CONDITION_QUOTES_EN } = await import('../data/en/healthConditions.js');
const substancesEN = (await import('../data/en/substances.js')).default;
for (const condition of HEALTH_CONDITIONS) {
  check(`EN-Label fuer ${condition.id}`, Boolean(HEALTH_CONDITIONS_EN[condition.id]?.label));
}
for (const entry of conditionInteractions) {
  const enQuote = CONDITION_QUOTES_EN[entry.conditionId]?.[entry.substanceId];
  const enCaution = substancesEN[entry.substanceId]?.cautionNote ?? '';
  check(
    `EN ${entry.conditionId}/${entry.substanceId}: Zitat woertlich im EN-cautionNote`,
    Boolean(enQuote) && enCaution.includes(enQuote),
    enQuote ? 'Substring fehlt' : 'EN-Zitat fehlt'
  );
}

console.log('— ProfileCheck-Verdrahtung —');
const stack = [
  { name: 'Suessholz-Tee', detectedIngredients: [], ingredientDetails: [{ name: 'Süßholzwurzel' }] },
];
const findings = checkProfileAgainstStack({ conditions: ['hypertension'] }, stack);
check('Bluthochdruck + Suessholz im Bestand → Treffer', findings.length >= 1, JSON.stringify(findings[0] ?? null));
check('Treffer traegt kind condition und contextLabel',
  findings.every((f) => f.kind === 'condition' && Boolean(f.contextLabel)));
check('Treffer-Zitat stammt woertlich aus der Quelle',
  findings.every((f) => getSubstance(f.substanceId)?.cautionNote?.includes(f.quote)));
const none = checkProfileAgainstStack({ conditions: ['hypertension'] }, [
  { name: 'Vitamin C', ingredientDetails: [{ name: 'Vitamin C' }] },
]);
check('Ohne betroffene Substanz → kein Treffer', none.length === 0);
const empty = checkProfileAgainstStack({}, stack);
check('Ohne Profil-Angaben → keine Treffer', empty.length === 0);

if (failures > 0) {
  console.error(`\n${failures} Fehlschlaege`);
  process.exit(1);
}
console.log('\nALLE TESTS BESTANDEN');
