/**
 * tests/complaint-search.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Beschwerdesuche.
 *
 * Der Schwerpunkt liegt nicht auf dem Finden, sondern auf dem, was die
 * Antwort NICHT sagen darf. Der Kernsatz des Produktkonzepts lautet:
 * "Müdigkeit allein zeigt keinen Eisenmangel." Eine Suche, die bei
 * "müde" mit einer Eisenempfehlung antwortet, wäre genau der Fehler,
 * den diese App vermeiden soll.
 */

import {
  buildComplaintView,
  findComplaints,
  findUnknownSubstanceRefs,
} from '../ComplaintSearch.js';
import { COMPLAINTS, getComplaint } from '../data/complaints.js';
import { LAB_MARKERS } from '../data/labMarkers.js';
import { substanceById } from '../data/substances.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

console.log('\n— Alltagssprache wird gefunden —');
const cases = [
  ['ich bin ständig müde', 'fatigue'],
  ['immer müde', 'fatigue'],
  ['schlapp', 'fatigue'],
  ['wadenkrämpfe', 'muscle-cramps'],
  ['krampf im bein', 'muscle-cramps'],
  ['schlafe schlecht', 'sleep-problems'],
  ['kann nicht einschlafen', 'sleep-problems'],
  ['haare gehen aus', 'hair-loss'],
  ['blähbauch', 'digestive-issues'],
  ['kann mich nicht konzentrieren', 'brain-fog'],
  ['ständig erkältet', 'frequent-infections'],
  ['antriebslos', 'low-mood'],
];
for (const [query, expected] of cases) {
  const hits = findComplaints(query);
  check(`"${query}"`, hits[0]?.id === expected, hits[0]?.id ?? '(nichts)');
}

console.log('\n— Umlaut-Schreibweisen —');
check('"muede" ohne Umlaut', findComplaints('muede')[0]?.id === 'fatigue');
check('"bruechige naegel"', findComplaints('bruechige naegel')[0]?.id === 'brittle-nails');
check('Groß- und Kleinschreibung egal', findComplaints('MÜDE')[0]?.id === 'fatigue');

console.log('\n— Kein Treffer bleibt kein Treffer —');
check('Unsinn findet nichts', findComplaints('quatsch mit soße').length === 0);
check('Zu kurze Eingabe findet nichts', findComplaints('ab').length === 0);
check('Leere Eingabe findet nichts', findComplaints('').length === 0);

console.log('\n— Der spezifischere Treffer steht vorn —');
const cramps = findComplaints('wadenkrämpfe');
check('"wadenkrämpfe" trifft Muskelkrämpfe', cramps[0]?.id === 'muscle-cramps', cramps[0]?.id);

console.log('\n— Die Antwort führt mit der Einordnung, nicht mit Nährstoffen —');
const fatigue = buildComplaintView(getComplaint('fatigue'), []);
check('Es gibt eine Einordnung', fatigue.intro.length > 50);
check('Die Einordnung nennt die Beschwerde unspezifisch',
  /unspezifisch/i.test(fatigue.intro));
check('Die Einordnung schließt einen Mangel-Rückschluss aus',
  /lässt sich keine Ursache und kein Nährstoffmangel ableiten/i.test(fatigue.intro));
check('Es gibt mehr Ursachenbereiche als Nährstoffe',
  fatigue.contextAreas.length >= fatigue.nutrients.length,
  `${fatigue.contextAreas.length} Bereiche vs ${fatigue.nutrients.length} Nährstoffe`);
check('Die Ursachenbereiche sind nicht nährstofflastig',
  fatigue.contextAreas.some((area) => /schlaf|stress|medikament/i.test(area)));

console.log('\n— Warnsignale —');
check('Jede Beschwerde hat Warnsignale',
  COMPLAINTS.every((c) => Array.isArray(c.redFlags) && c.redFlags.length >= 2),
  COMPLAINTS.filter((c) => (c.redFlags ?? []).length < 2).map((c) => c.id).join(','));
check('Müdigkeit nennt ungewollten Gewichtsverlust',
  fatigue.redFlags.some((f) => /Gewichtsverlust/i.test(f)));
check('Warnsignale sind beobachtend formuliert, nicht deutend',
  !COMPLAINTS.some((c) => c.redFlags.some((f) => /deutet auf|weist hin auf|bedeutet dass/i.test(f))));
check('Niedergeschlagenheit nennt eine erreichbare Hilfe',
  getComplaint('low-mood').redFlags.some((f) => /Telefonseelsorge|0800/i.test(f)));

console.log('\n— Keine Heilversprechen in den Nährstoff-Hinweisen —');
const promise = /(hilft gegen|beseitigt|heilt|behebt den mangel|wirkt gegen|kuriert)/i;
const offenders = [];
for (const complaint of COMPLAINTS) {
  for (const entry of complaint.relatedNutrients ?? []) {
    if (promise.test(entry.note)) offenders.push(`${complaint.id}/${entry.substanceId}`);
  }
}
check('Keine Wirkversprechen', offenders.length === 0, offenders.join(', '));

// Ehrlichkeit über dünne Evidenz ist Teil des Konzepts.
const honest = COMPLAINTS.flatMap((c) => c.relatedNutrients ?? [])
  .filter((e) => /uneinheitlich|nicht belegt|schwach|dünn|nicht eindeutig|nicht durchgängig|niedriger Qualität|reichen.*nicht aus/i.test(e.note));
check('Dünne Studienlage wird mehrfach offengelegt', honest.length >= 8, honest.length);

console.log('\n— Verknüpfung mit dem eigenen Bestand —');
const withStack = buildComplaintView(getComplaint('fatigue'), [
  { id: 'u1', name: 'Eisen Bisglycinat' },
  { id: 'u2', name: 'Vitamin D3' },
]);
check('Eisen wird als vorhanden erkannt',
  withStack.nutrients.find((n) => n.substanceId === 'iron')?.inStack === true);
check('Das Produkt wird namentlich genannt',
  withStack.nutrients.find((n) => n.substanceId === 'iron')?.productNames.includes('Eisen Bisglycinat'));
check('Nicht vorhandenes bleibt unmarkiert',
  withStack.nutrients.find((n) => n.substanceId === 'vitamin-b12')?.inStack === false);
check('Bereits abgedeckte Nährstoffe werden gesammelt',
  withStack.alreadyCovered.length === 2, withStack.alreadyCovered.length);

const multi = buildComplaintView(getComplaint('fatigue'), [
  { id: 'm', name: 'Multi', ingredientDetails: [{ name: 'Eisen', amount: '14', unit: 'mg' }] },
]);
check('Wirkstoff aus einem Multivitamin wird erkannt',
  multi.nutrients.find((n) => n.substanceId === 'iron')?.inStack === true);

console.log('\n— Fragen für das Gespräch —');
check('Jede Beschwerde bereitet Fragen vor',
  COMPLAINTS.every((c) => (c.questionsForProfessional ?? []).length >= 2));
check('Die Fragen sind Fragen',
  COMPLAINTS.every((c) => c.questionsForProfessional.every((q) => q.trim().endsWith('?'))));

console.log('\n— Datenintegrität —');
check('Alle Nährstoff-Verweise existieren in der Substanz-Datenbank',
  findUnknownSubstanceRefs().length === 0,
  JSON.stringify(findUnknownSubstanceRefs()));

const knownMarkers = LAB_MARKERS.map((m) => m.id);
const badMarkers = COMPLAINTS.flatMap((c) =>
  (c.labMarkers ?? []).filter((m) => !knownMarkers.includes(m)).map((m) => `${c.id}/${m}`)
);
check('Alle Laborwert-Verweise existieren', badMarkers.length === 0, badMarkers.join(', '));

check('Jede Beschwerde hat Suchbegriffe',
  COMPLAINTS.every((c) => (c.synonyms ?? []).length >= 3));
check('Jede Beschwerde nennt Quellen',
  COMPLAINTS.every((c) => (c.sources ?? []).length >= 1 && c.sources.every((s) => s.url?.startsWith('http'))));

const ids = COMPLAINTS.map((c) => c.id);
check('Keine doppelten Beschwerde-IDs', new Set(ids).size === ids.length);

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
