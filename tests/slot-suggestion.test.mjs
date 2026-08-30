// Tests fuer SlotSuggestion.js: Vorschlag des Einnahmezeitpunkts aus
// belegten Regeln und Ableitung der Slots aus der Haeufigkeit.
import {
  adjustSlots,
  DEFAULT_SLOT,
  expandSlots,
  SLOT_BY_GUIDANCE,
  substanceIdsFromDetails,
  suggestPrimarySlot,
  suggestSlots,
} from '../SlotSuggestion';
import { INTAKE_GUIDANCE } from '../data/interactions';
import { SLOT_ORDER } from '../TimingEngine';
import { setActiveLanguage } from '../i18n/runtime';

let failures = 0;

function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name}${detail ? ` (${detail})` : ''}`);
  }
}

console.log('— SLOT_BY_GUIDANCE zeigt nur auf belegte Regeln —');
for (const [substanceId, slot] of Object.entries(SLOT_BY_GUIDANCE)) {
  const rule = INTAKE_GUIDANCE[substanceId];
  check(`${substanceId}: Regel mit Quelle vorhanden`, Boolean(rule?.note) && Array.isArray(rule?.sources) && rule.sources.length > 0);
  check(`${substanceId}: Slot ${slot} existiert`, SLOT_ORDER.includes(slot));
}

console.log('— suggestPrimarySlot: Einnahme-Hinweise —');
const iron = suggestPrimarySlot(['iron']);
check('iron → fasted', iron.slot === 'fasted');
check('iron: reason.key guidance', iron.reason?.key === 'guidance' && iron.reason.substanceId === 'iron');
check('iron: Text ist die Regel', iron.reason?.text === INTAKE_GUIDANCE.iron.note);
check('iron: Quelle mit Label', Array.isArray(iron.reason?.sources) && typeof iron.reason.sources[0]?.label === 'string');

check('melatonin → evening', suggestPrimarySlot(['melatonin']).slot === 'evening');
check('caffeine → morning', suggestPrimarySlot(['caffeine']).slot === 'morning');
check('psyllium: kein Vorschlag (Hinweis ohne Zeitpunkt)', suggestPrimarySlot(['psyllium']).reason === null);

console.log('— suggestPrimarySlot: fettloeslich —');
const vitD = suggestPrimarySlot(['vitamin-d3']);
check('vitamin-d3 → morning', vitD.slot === 'morning');
check('vitamin-d3: reason.key fatSoluble', vitD.reason?.key === 'fatSoluble' && vitD.reason.substanceId === 'vitamin-d3');
check('vitamin-d3: Text nennt die Substanz', typeof vitD.reason?.text === 'string' && vitD.reason.text.includes('Vitamin D'));
check('vitamin-d3: Quelle normalisiert', Array.isArray(vitD.reason?.sources) && vitD.reason.sources.length > 0 && typeof vitD.reason.sources[0].label === 'string');

setActiveLanguage('en');
const vitDEn = suggestPrimarySlot(['vitamin-d3']);
check('EN: fettloeslich-Satz auf Englisch', /fat-soluble/i.test(vitDEn.reason?.text ?? ''));
check('EN: kein Gedankenstrich', !(vitDEn.reason?.text ?? '').includes('—'));
setActiveLanguage('de');

console.log('— suggestPrimarySlot: Prioritaet und Default —');
check('Hinweis schlaegt fettloeslich', suggestPrimarySlot(['vitamin-d3', 'iron']).slot === 'fasted');
const mg = suggestPrimarySlot(['magnesium']);
check('magnesium → Default morning', mg.slot === DEFAULT_SLOT && mg.reason === null);
check('leer → Default', suggestPrimarySlot([]).slot === DEFAULT_SLOT);
check('unbekannte ID → Default', suggestPrimarySlot(['gibt-es-nicht']).slot === DEFAULT_SLOT);

console.log('— expandSlots —');
check('1x morning', JSON.stringify(expandSlots('morning', 1)) === '["morning"]');
check('2x morning → morning+evening', JSON.stringify(expandSlots('morning', 2)) === '["morning","evening"]');
check('2x evening → morning+evening', JSON.stringify(expandSlots('evening', 2)) === '["morning","evening"]');
check('2x fasted → fasted+evening', JSON.stringify(expandSlots('fasted', 2)) === '["fasted","evening"]');
check('3x morning → morning+midday+evening', JSON.stringify(expandSlots('morning', 3)) === '["morning","midday","evening"]');
check('3x fasted → fasted+midday+evening', JSON.stringify(expandSlots('fasted', 3)) === '["fasted","midday","evening"]');
check('0 wird 1', expandSlots('morning', 0).length === 1);
check('7 wird 3', expandSlots('morning', 7).length === 3);
check('Reihenfolge folgt SLOT_ORDER', JSON.stringify(expandSlots('evening', 3)) === '["morning","midday","evening"]');

console.log('— adjustSlots —');
check(
  'abgewaehlter Slot kommt nicht zurueck, Luecke wird in SLOT_ORDER aufgefuellt',
  JSON.stringify(adjustSlots(['evening'], 'fasted', 2)) === '["morning","evening"]',
);
check(
  '2 Luecken werden aufgefuellt',
  JSON.stringify(adjustSlots(['evening'], 'fasted', 3)) === '["morning","midday","evening"]',
);
check(
  'Ueberschuss: nur die ersten timesPerDay in SLOT_ORDER-Reihenfolge',
  JSON.stringify(adjustSlots(['morning', 'midday', 'evening'], 'morning', 1)) === '["morning"]',
);
check(
  'ungewoehnlicher Slot bleibt erhalten, Luecke wird ergaenzt',
  JSON.stringify(adjustSlots(['pre_sport'], 'morning', 2)) === '["morning","pre_sport"]',
);
check(
  'Ueberschuss mit ungewoehnlichen Slots: erste zwei in SLOT_ORDER-Reihenfolge',
  JSON.stringify(adjustSlots(['pre_sport', 'post_sport', 'evening'], 'morning', 2)) === '["pre_sport","post_sport"]',
);
check(
  'leere Auswahl entspricht expandSlots',
  JSON.stringify(adjustSlots([], 'fasted', 2)) === JSON.stringify(expandSlots('fasted', 2)),
);
check('Klemmen nach unten: 0 wird 1', JSON.stringify(adjustSlots(['morning'], 'morning', 0)) === '["morning"]');
check('Klemmen nach oben: 9 wird 3', adjustSlots(['morning'], 'morning', 9).length === 3);

console.log('— substanceIdsFromDetails —');
const ids = substanceIdsFromDetails([
  { name: 'Magnesiumcitrat', amount: '300', unit: 'mg', form: null },
  { name: 'Eisen(II)-bisglycinat', amount: '14', unit: 'mg', form: null },
  { name: 'Magnesium', amount: '50', unit: 'mg', form: null },
]);
check('erkennt magnesium und iron, ohne Duplikate', JSON.stringify(ids) === '["magnesium","iron"]');
check('leere Liste → []', substanceIdsFromDetails([]).length === 0);
check('undefined → []', substanceIdsFromDetails(undefined).length === 0);

console.log('— suggestSlots —');
const combo = suggestSlots({ substanceIds: ['iron'], timesPerDay: 2 });
check('iron 2x → fasted+evening mit reason', JSON.stringify(combo.slots) === '["fasted","evening"]' && combo.reason?.key === 'guidance');
check('ohne Angaben → morning ohne reason', JSON.stringify(suggestSlots().slots) === '["morning"]' && suggestSlots().reason === null);

if (failures > 0) {
  console.error(`\n${failures} Test(s) fehlgeschlagen`);
  process.exit(1);
}
console.log('\nSlotSuggestion: alle Tests bestanden');
