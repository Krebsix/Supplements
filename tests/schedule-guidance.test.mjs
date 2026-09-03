// Tests fuer ScheduleGuidance.js: Erklaerungen je Tagesplan-Eintrag aus
// belegten Regeln. Kein Satz ohne Regel, keine Regel ohne Quelle.
import { buildEntryGuidance } from '../ScheduleGuidance';
import { INTAKE_GUIDANCE, PAIR_RULES } from '../data/interactions';
import { INTAKE_NOTES_EN, PAIR_NOTES_EN } from '../data/en/interactions';
import { getSubstance } from '../data/substances';
import { setActiveLanguage } from '../i18n/runtime';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}

// Anpassung ggue. Brief: Nutzer-Praeparate tragen ihre Wirkstoffe unter
// `ingredientDetails` (siehe StackAnalyzer.js extractPositions,
// ScanAnalyzer.js, useStore.js) -- nicht unter `ingredients`.
const sup = (name, ingredients) => ({
  id: `user-${name}`,
  name,
  status: 'active',
  ingredientDetails: ingredients.map(([n, amount, unit]) => ({ name: n, amount, unit })),
});

console.log('— Einnahme-Hinweise —');
const iron = sup('Eisen Kapseln', [['Eisen', '14', 'mg']]);
const g1 = buildEntryGuidance(iron, [iron]);
check('Eisen liefert einen Hinweis mit Quelle', g1.notes.length === 1 && g1.notes[0].substanceId === 'iron' && g1.notes[0].sources.length > 0);
check('Hinweistext ist der hinterlegte', g1.notes[0].text === INTAKE_GUIDANCE.iron.note);
const plain = sup('Nur Vitamin C', [['Vitamin C', '200', 'mg']]);
const g2 = buildEntryGuidance(plain, [plain]);
check('ohne hinterlegten Hinweis: keine Notiz (kein Fuelltext)', Array.isArray(g2.notes) && g2.notes.every((n) => INTAKE_GUIDANCE[n.substanceId]));
const many = sup('Multi', [['Eisen', '5', 'mg'], ['Flohsamenschalen', '3', 'g'], ['Koffein', '80', 'mg']]);
check('maximal zwei Hinweise', buildEntryGuidance(many, [many]).notes.length <= 2);

console.log('— Konflikte —');
const rule = PAIR_RULES[0];
// Substanz-IDs sind keine Anzeigenamen; der Matcher braucht Namen. Ueber
// die Substanz-Datenbank den Anzeigenamen holen:
const aN = sup('A', [[getSubstance(rule.a).name, '1', 'mg']]);
const bN = sup('B', [[getSubstance(rule.b).name, '1', 'mg']]);
const g3 = buildEntryGuidance(aN, [aN, bN]);
check('Paar-Regel zwischen zwei Praeparaten wird gefunden', g3.conflicts.some((c) => c.partnerSupplementName === 'B' && c.severity === rule.severity && c.sources.length > 0));
check('kein Konflikt mit sich selbst', buildEntryGuidance(aN, [aN]).conflicts.length === 0);
check('archivierte Praeparate zaehlen nicht', buildEntryGuidance(aN, [aN, { ...bN, status: 'archived' }]).conflicts.length === 0);
check(
  'leeres Praeparat: leere Struktur',
  (() => {
    const g = buildEntryGuidance({ id: 'x', name: 'x', ingredientDetails: [] }, []);
    return g.notes.length === 0 && g.conflicts.length === 0 && g.synergies.length === 0;
  })()
);

console.log('— Synergien —');
// Eisen + Vitamin C ist im Datenbestand als severity 'synergy' hinterlegt
// (data/interactions.js: { a: 'iron', b: 'vitamin-c', severity: 'synergy' }).
// Eine foerderliche Kombination ist das Gegenteil eines Konflikts und darf
// nicht als "Getrennt von ..." erscheinen.
const synergyRule = PAIR_RULES.find(
  (r) => r.severity === 'synergy' && ((r.a === 'iron' && r.b === 'vitamin-c') || (r.a === 'vitamin-c' && r.b === 'iron'))
);
check('Testvoraussetzung: Eisen/Vitamin-C-Synergie existiert im Datenbestand', Boolean(synergyRule));

const ironSup = sup('Eisen Kapseln', [[getSubstance('iron').name, '14', 'mg']]);
const vitCSup = sup('Vitamin C Kapseln', [[getSubstance('vitamin-c').name, '200', 'mg']]);
const g4 = buildEntryGuidance(ironSup, [ironSup, vitCSup]);
check(
  'Eisen/Vitamin-C-Paar erscheint in synergies',
  g4.synergies.some(
    (s) =>
      s.partnerSupplementName === 'Vitamin C Kapseln' &&
      s.severity === 'synergy' &&
      s.sources.length > 0
  )
);
check(
  'Eisen/Vitamin-C-Paar erscheint NICHT in conflicts',
  !g4.conflicts.some((c) => c.partnerSupplementName === 'Vitamin C Kapseln')
);

console.log('— Verschiebungs-Vorschlag (alwaysSeparate) —');
// Eisen/Calcium traegt alwaysSeparate: true (data/interactions.js).
// Zink/Kupfer ist eine Regel OHNE alwaysSeparate (langfristiges
// Mengenverhaeltnis, keine Tageszeit-Aussage) -- dort darf kein
// Vorschlag entstehen, auch mit passendem Tagesplan.
import { SLOTS } from '../TimingEngine';

const ironCalciumRule = PAIR_RULES.find(
  (r) => r.alwaysSeparate && ((r.a === 'iron' && r.b === 'calcium') || (r.a === 'calcium' && r.b === 'iron'))
);
check('Testvoraussetzung: Eisen/Calcium hat alwaysSeparate', Boolean(ironCalciumRule));

const ironForMove = sup('Eisen', [[getSubstance('iron').name, '14', 'mg']]);
const calciumForMove = sup('Calcium', [[getSubstance('calcium').name, '500', 'mg']]);
const scheduleWithAlternative = [
  { slot: SLOTS.morning, supplements: [ironForMove, calciumForMove] },
  { slot: SLOTS.evening, supplements: [{ id: 'user-other' }] },
];
const gMove = buildEntryGuidance(ironForMove, [ironForMove, calciumForMove], scheduleWithAlternative);
const moveConflict = gMove.conflicts.find((c) => c.partnerSupplementName === 'Calcium');
check('alwaysSeparate-Konflikt traegt einen Verschiebungs-Vorschlag', Boolean(moveConflict?.move));
check('Vorschlag zeigt auf einen heute bereits genutzten Slot', moveConflict?.move?.slotId === 'evening');

check(
  'ohne Tagesplan (dailySchedule-Default): kein Absturz, move bleibt leer',
  buildEntryGuidance(ironForMove, [ironForMove, calciumForMove]).conflicts.find(
    (c) => c.partnerSupplementName === 'Calcium'
  )?.move == null
);

const zincSup = sup('Zink', [[getSubstance('zinc').name, '10', 'mg']]);
const copperSup = sup('Kupfer', [[getSubstance('copper').name, '1', 'mg']]);
const gNoMove = buildEntryGuidance(zincSup, [zincSup, copperSup], [
  { slot: SLOTS.morning, supplements: [zincSup, copperSup] },
  { slot: SLOTS.evening, supplements: [{ id: 'user-other' }] },
]);
const noMoveConflict = gNoMove.conflicts.find((c) => c.partnerSupplementName === 'Kupfer');
check(
  'Zink/Kupfer ohne alwaysSeparate: Konflikt erscheint, aber ohne Verschiebungs-Vorschlag',
  Boolean(noMoveConflict) && noMoveConflict.move == null
);

console.log('— EN-Overlay —');
setActiveLanguage('en');
const g5 = buildEntryGuidance(iron, [iron]);
check('EN: Einnahme-Hinweis kommt aus dem Overlay', g5.notes[0]?.text === INTAKE_NOTES_EN.iron);
const g6 = buildEntryGuidance(aN, [aN, bN]);
check(
  'EN: Paar-Regel-Hinweis kommt aus dem Overlay',
  g6.conflicts.some((c) => c.text === PAIR_NOTES_EN[`${rule.a}|${rule.b}`])
);
setActiveLanguage('de');

if (failures > 0) { console.error(`\n${failures} Fehler`); process.exit(1); }
console.log('\nAlle ScheduleGuidance-Tests bestanden.');
