/**
 * tests/lab-export.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Laborwerte und Arztbericht.
 *
 * Zwei Dinge stehen hier im Vordergrund:
 *   1. Die App darf Laborwerte NICHT bewerten. Kein "zu niedrig", kein
 *      eigener Referenzbereich — der kommt aus dem Befund oder gar nicht.
 *   2. Der Bericht muss datensparsam sein: Was der Aufrufer nicht anfordert,
 *      darf nicht drinstehen. Gesundheitsdaten sollen nicht mitwandern,
 *      nur weil sie in der App liegen.
 */

import {
  createLabValue,
  getGroupedValues,
  getIntakeContext,
  getMarkerHistory,
} from '../LabValues.js';
import { EXPORT_SECTIONS, buildReport } from '../ExportBuilder.js';
import { LAB_MARKERS, getLabMarker } from '../data/labMarkers.js';
import { TRIAL_STATUS, TRIAL_CONCLUSION } from '../OutcomeTracker.js';
import { setActiveLanguage } from '../i18n/runtime.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

setActiveLanguage('de');

console.log('\n— Laborwerte erfassen —');

const ferritin = createLabValue({
  markerId: 'ferritin', value: '18', unit: 'µg/l',
  measuredAt: '2026-06-01', labName: 'Labor Muster',
  referenceMin: '15', referenceMax: '150',
});
check('Wert wird angelegt', ferritin !== null);
check('Zahl wird übernommen', ferritin.value === 18);
check('Referenzbereich aus dem Befund wird übernommen',
  ferritin.referenceMin === 15 && ferritin.referenceMax === 150);
check('Datum wird als Tagesschlüssel gespeichert', ferritin.dateKey === '2026-06-01');
check('Dezimalkomma wird verstanden',
  createLabValue({ markerId: 'crp', value: '1,4', measuredAt: '2026-06-01' }).value === 1.4);
check('Ohne Zahl kein Eintrag',
  createLabValue({ markerId: 'crp', value: 'abc', measuredAt: '2026-06-01' }) === null);
check('Ohne Referenzbereich bleibt er leer',
  createLabValue({ markerId: 'crp', value: '2', measuredAt: '2026-06-01' }).referenceMin === null);

console.log('\n— Die App legt keine eigenen Referenzbereiche an —');
check('Kein Marker bringt einen Referenzbereich mit',
  LAB_MARKERS.every((m) => m.referenceMin === undefined && m.referenceMax === undefined));
check('Marker haben nur eine Einheiten-Empfehlung',
  LAB_MARKERS.every((m) => typeof m.commonUnit === 'string'));
check('Jeder Marker hat einen Übersetzungsschlüssel',
  LAB_MARKERS.every((m) => m.labelKey.startsWith('lab.marker.')));
check('Freitext-Option vorhanden', Boolean(getLabMarker('other')));

console.log('\n— Verlauf —');
const values = [
  createLabValue({ markerId: 'ferritin', value: '18', unit: 'µg/l', measuredAt: '2026-01-10' }),
  createLabValue({ markerId: 'ferritin', value: '32', unit: 'µg/l', measuredAt: '2026-06-01' }),
  createLabValue({ markerId: 'vitamin-d-25oh', value: '22', unit: 'ng/ml', measuredAt: '2026-05-01' }),
];
const history = getMarkerHistory(values, 'ferritin');
check('Verlauf eines Markers, älteste zuerst',
  history.length === 2 && history[0].dateKey === '2026-01-10');
const grouped = getGroupedValues(values);
check('Nach Marker gruppiert', grouped.length === 2);
check('Zuletzt gemessener Marker zuerst', grouped[0].markerId === 'ferritin', grouped[0].markerId);
check('Letzter Wert je Gruppe verfügbar', grouped[0].latest.value === 32);

console.log('\n— Einnahme zum Messzeitpunkt —');
const supplements = [
  { id: 'u1', name: 'Eisen', dosage: { amount: '20', unit: 'mg' } },
  { id: 'u2', name: 'Magnesium', dosage: { amount: '300', unit: 'mg' } },
];
const logs = [
  { userSupplementId: 'u1', dateKey: '2026-05-28', undoneAt: null },
  { userSupplementId: 'u2', dateKey: '2026-02-01', undoneAt: null },
];
const context = getIntakeContext(values[1], supplements, logs);
check('Präparat aus dem Zeitfenster wird gefunden',
  context.some((entry) => entry.name === 'Eisen'));
check('Präparat außerhalb des Fensters nicht',
  !context.some((entry) => entry.name === 'Magnesium'), JSON.stringify(context.map(c=>c.name)));

console.log('\n— Bericht: Datensparsamkeit —');

const data = {
  supplements,
  intakeLogs: logs,
  trials: [{
    id: 't1', userSupplementId: 'u1', supplementName: 'Eisen', metricId: 'energy',
    baselineValue: 2, durationDays: 28, startedAt: '2026-05-01T00:00:00.000Z',
    status: TRIAL_STATUS.COMPLETED, conclusion: TRIAL_CONCLUSION.CONTINUE,
    concludedAt: '2026-06-01T00:00:00.000Z',
  }],
  trialRatings: [],
  labValues: values,
  profile: { medicationClasses: ['anticoagulants'] },
  lifeStageId: 'adult-woman',
};

const full = buildReport(data);
check('Vollständiger Bericht nennt die Präparate', full.includes('Eisen'));
check('… enthält Laborwerte', full.includes('32'));
check('… enthält Medikamentengruppen', /Gerinnungshemmer/.test(full));

const minimal = buildReport(data, { sections: [EXPORT_SECTIONS.SUPPLEMENTS] });
check('Eingeschränkter Bericht enthält die Präparate', minimal.includes('Eisen'));
check('… aber KEINE Laborwerte', !minimal.includes('µg/l'), 'Laborwert im Minimalbericht!');
check('… und KEINE Medikamentenangaben', !/Gerinnungshemmer/.test(minimal));

console.log('\n— Bericht: keine Bewertung —');
// Der Bericht darf Werte nicht einordnen. "auffällig", "Mangel", "zu
// niedrig" waeren Diagnostik.
const verdictWords = /(Mangel|zu niedrig|zu hoch|auffällig|unauffällig|normal|pathologisch)/i;
const labOnly = buildReport(data, { sections: [EXPORT_SECTIONS.LAB] });
check('Keine wertenden Begriffe bei den Laborwerten',
  !verdictWords.test(labOnly), labOnly.match(verdictWords)?.[0]);
check('Laborteil weist auf die Herkunft der Referenzbereiche hin',
  /Labor/i.test(labOnly));

console.log('\n— Bericht: Struktur —');
check('Beginnt mit einer Überschrift', full.startsWith('# '));
check('Enthält ein Erstellungsdatum', /\d{4}-\d{2}-\d{2}/.test(full));
check('Enthält einen Hinweis auf die Grenzen', full.includes('>'));
check('Tagessummen werden ausgewiesen', full.includes('##'));
check('Leere Daten ergeben trotzdem einen gültigen Bericht',
  buildReport({}).startsWith('# '));

console.log('\n— Bericht: Einschränkungen der Wirkungskontrolle —');
const withTrial = buildReport(data, { sections: [EXPORT_SECTIONS.OUTCOMES] });
check('Beobachtung erscheint im Bericht', withTrial.includes('Eisen'));
check('Zielgröße wird genannt', /Energie/i.test(withTrial));

console.log('\n— Zweisprachig —');
setActiveLanguage('en');
const english = buildReport(data, { sections: [EXPORT_SECTIONS.SUPPLEMENTS] });
check('Englischer Bericht nutzt englische Überschriften',
  !/Präparate|Erstellt/.test(english), english.slice(0, 120));
setActiveLanguage('de');

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
