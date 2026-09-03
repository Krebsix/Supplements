// Tests fuer data/evidenceGraph.js: Roadmap-Baustein "Evidence Graph",
// Pilot Magnesium. Jede Aussage braucht eine echte Quelle, keine
// praeskriptive Sprache, EN-Overlay deckt jeden Eintrag ab.
import { EVIDENCE_CERTAINTY, evidenceGraph, getEvidenceForSubstance } from '../data/evidenceGraph';
import { EVIDENCE_SUMMARIES_EN } from '../data/en/evidenceGraph';
import { localizeEvidenceEntry } from '../data/localize';
import { setActiveLanguage } from '../i18n/runtime';
import { getSubstance } from '../data/substances';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}

const VALID_CERTAINTY = new Set(Object.values(EVIDENCE_CERTAINTY));
const VALID_DIRECTION = new Set(['benefit', 'no-benefit', 'inconsistent']);
const PRESCRIPTIVE = /\bnimm\b|\bsollten sie\b|\bsollte(n)? eingenommen werden\b|\bempfohlen\b/i;

console.log('— Struktur —');

check('Pilot-Substanz Magnesium ist vorhanden', Array.isArray(evidenceGraph.magnesium) && evidenceGraph.magnesium.length > 0);
check('Magnesium ist eine echte Substanz-ID', Boolean(getSubstance('magnesium')));

for (const [substanceId, entries] of Object.entries(evidenceGraph)) {
  check(`${substanceId}: Substanz-ID existiert in substances.js`, Boolean(getSubstance(substanceId)));
  for (const entry of entries) {
    const label = `${substanceId}/${entry.outcome}`;
    check(`${label}: hat outcome`, typeof entry.outcome === 'string' && entry.outcome.length > 0);
    check(`${label}: hat population`, typeof entry.population === 'string' && entry.population.length > 0);
    check(`${label}: gueltige certainty`, VALID_CERTAINTY.has(entry.certainty), entry.certainty);
    check(`${label}: gueltige evidenceDirection`, VALID_DIRECTION.has(entry.evidenceDirection), entry.evidenceDirection);
    check(`${label}: hat summary`, typeof entry.summary === 'string' && entry.summary.length > 20);
    check(`${label}: mindestens eine Quelle mit Label und URL`,
      Array.isArray(entry.sources) && entry.sources.length > 0 &&
      entry.sources.every((s) => s.label && s.url && s.url.startsWith('https://')));
    check(`${label}: kein Gedankenstrich in summary`, !/[—–]/.test(entry.summary));
    check(`${label}: keine praeskriptive Formulierung`, !PRESCRIPTIVE.test(entry.summary), entry.summary);
  }
}

console.log('— getEvidenceForSubstance —');
check('Magnesium liefert Eintraege', getEvidenceForSubstance('magnesium').length === evidenceGraph.magnesium.length);
check('Unbekannte Substanz liefert leeres Array statt Absturz', JSON.stringify(getEvidenceForSubstance('unbekannt')) === '[]');

console.log('— EN-Overlay —');
for (const entry of evidenceGraph.magnesium) {
  const key = `magnesium|${entry.outcome}`;
  check(`EN-Overlay existiert fuer ${key}`, Boolean(EVIDENCE_SUMMARIES_EN[key]));
  const overlay = EVIDENCE_SUMMARIES_EN[key];
  if (overlay) {
    check(`${key}: EN summary ohne Gedankenstrich`, !/[—–]/.test(overlay.summary));
    check(`${key}: EN summary unterscheidet sich vom Deutschen`, overlay.summary !== entry.summary);
  }
}

setActiveLanguage('en');
const localizedFirst = localizeEvidenceEntry('magnesium', evidenceGraph.magnesium[0]);
check('localizeEvidenceEntry ersetzt summary auf Englisch',
  localizedFirst.summary === EVIDENCE_SUMMARIES_EN[`magnesium|${evidenceGraph.magnesium[0].outcome}`].summary);
check('localizeEvidenceEntry behaelt sources unveraendert (nicht uebersetzt)',
  JSON.stringify(localizedFirst.sources) === JSON.stringify(evidenceGraph.magnesium[0].sources));
setActiveLanguage('de');

const unknownOutcomeEntry = { outcome: 'does-not-exist', summary: 'x', population: 'y', sources: [] };
setActiveLanguage('en');
check('Ohne EN-Overlay: unveraendertes Original zurueck',
  localizeEvidenceEntry('magnesium', unknownOutcomeEntry).summary === 'x');
setActiveLanguage('de');
check('Auf Deutsch: localizeEvidenceEntry ist ein No-op',
  localizeEvidenceEntry('magnesium', evidenceGraph.magnesium[0]) === evidenceGraph.magnesium[0]);

if (failures > 0) {
  console.error(`\n${failures} Fehlschlaege`);
  process.exit(1);
}
console.log('\nAlle Evidence-Graph-Tests bestanden.');
