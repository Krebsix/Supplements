// Tests fuer die data/en/*-Overlays.
//
// Zwei Sorgen, zwei Testarten:
// 1. VOLLSTAENDIGKEIT: jeder DE-Eintrag (jede Beschwerde, jeder
//    Lebensphasen-Hinweis, jede Lebensphase, jede Zertifizierung) hat
//    einen EN-Eintrag mit allen erwarteten Freitextfeldern, Arrays
//    gleich lang wie im Original.
// 2. COMPLIANCE: kein verbotenes Wort (Heilversprechen, Empfehlung),
//    kein Gedankenstrich ("—") in irgendeinem EN-Text.
//
// Fuer labMarkers.js und outcomeMetrics.js gibt es keine Freitexte zu
// ueberlagern (siehe Header-Kommentare der jeweiligen data/en/-Datei);
// dort steht stattdessen ein Kanarienvogel-Test, der anschlaegt, sobald
// die DE-Quelle ein neues Freitextfeld bekommt, das noch keine
// EN-Entsprechung hat.

import { COMPLAINTS } from '../data/complaints.js';
import { COMPLAINTS_EN } from '../data/en/complaints.js';

import { ADVISORY_SEVERITY, SEVERITY_META, advisories } from '../data/lifeStageAdvisories.js';
import { advisoriesEN, buildAdvisoryKey, severityLabels } from '../data/en/lifeStageAdvisories.js';

import { LIFE_STAGES } from '../data/referenceValues.js';
import { LIFE_STAGES_EN } from '../data/en/referenceValues.js';

import { certifications, KIND_LABELS } from '../data/certifications.js';
import { CERTIFICATIONS_EN, kindLabels } from '../data/en/certifications.js';

import { LAB_MARKERS } from '../data/labMarkers.js';
import { LAB_MARKERS_EN } from '../data/en/labMarkers.js';

import { OUTCOME_METRICS } from '../data/outcomeMetrics.js';
import { OUTCOME_METRICS_EN } from '../data/en/outcomeMetrics.js';

let failures = 0;

function check(name, condition) {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name}`);
  }
}

// ── Compliance-Scan: verbotene Woerter + Gedankenstrich ────────────
//
// Verboten laut Auftrag: cure, heals, treats, boosts, recommended,
// "you should", "indicates a deficiency". Wortgrenzen per \b, damit
// z. B. "treatable" oder "treatment" (rein deskriptive Kategorien wie
// im DE-Original "behandlungsbeduerftig") nicht faelschlich anschlagen.
const FORBIDDEN_PATTERNS = [
  { name: 'cure(s/d/ing)', re: /\bcures?\b|\bcured\b|\bcuring\b/i },
  { name: 'heal(s/ed/ing)', re: /\bheals?\b|\bhealed\b|\bhealing\b/i },
  { name: 'treat(s/ed/ing)', re: /\btreats?\b|\btreated\b|\btreating\b/i },
  { name: 'boost(s/ed/ing)', re: /\bboosts?\b|\bboosted\b|\bboosting\b/i },
  { name: 'recommend(s/ed/ing)', re: /\brecommends?\b|\brecommended\b|\brecommending\b/i },
  { name: '"you should"', re: /\byou should\b/i },
  { name: '"indicates a deficiency"', re: /\bindicates?\s+a\s+deficienc(y|ies)\b/i },
];

// Beobachtend statt deutend, nur fuer redFlags-Texte relevant
// (siehe data/complaints.js Header): "indicates"/"points to"/"suggests"
// duerfen dort nicht vorkommen, unabhaengig vom generellen Scan oben.
const INTERPRETIVE_PATTERNS = [
  { name: '"indicates"', re: /\bindicat(e|es|ed|ing)\b/i },
  { name: '"points to"', re: /\bpoints?\s+to\b/i },
  { name: '"suggests"', re: /\bsuggests?\b/i },
];

function scanCompliance(label, text) {
  if (typeof text !== 'string') return;
  for (const { name, re } of FORBIDDEN_PATTERNS) {
    check(`${label}: no forbidden word (${name})`, !re.test(text));
  }
  check(`${label}: no em dash ("—")`, !text.includes('—'));
}

function scanObservational(label, text) {
  if (typeof text !== 'string') return;
  for (const { name, re } of INTERPRETIVE_PATTERNS) {
    check(`${label}: stays observational, not "${name}"`, !re.test(text));
  }
}

// ── 1. data/en/complaints.js ────────────────────────────────────────

console.log('— data-en: complaints —');

for (const complaint of COMPLAINTS) {
  const en = COMPLAINTS_EN[complaint.id];
  check(`complaints.${complaint.id}: overlay exists`, Boolean(en));
  if (!en) continue;

  check(`complaints.${complaint.id}: label present`, typeof en.label === 'string' && en.label.length > 0);
  check(`complaints.${complaint.id}: intro present`, typeof en.intro === 'string' && en.intro.length > 0);

  check(
    `complaints.${complaint.id}: contextAreas length matches DE (${complaint.contextAreas.length})`,
    Array.isArray(en.contextAreas) && en.contextAreas.length === complaint.contextAreas.length
  );
  check(
    `complaints.${complaint.id}: redFlags length matches DE (${complaint.redFlags.length})`,
    Array.isArray(en.redFlags) && en.redFlags.length === complaint.redFlags.length
  );
  check(
    `complaints.${complaint.id}: relatedNutrients length matches DE (${complaint.relatedNutrients.length})`,
    Array.isArray(en.relatedNutrients) && en.relatedNutrients.length === complaint.relatedNutrients.length
  );
  check(
    `complaints.${complaint.id}: questionsForProfessional length matches DE (${complaint.questionsForProfessional.length})`,
    Array.isArray(en.questionsForProfessional) &&
      en.questionsForProfessional.length === complaint.questionsForProfessional.length
  );

  // relatedNutrients: gleiche Reihenfolge der substanceId wie im Original
  if (Array.isArray(en.relatedNutrients) && en.relatedNutrients.length === complaint.relatedNutrients.length) {
    complaint.relatedNutrients.forEach((deEntry, idx) => {
      const enEntry = en.relatedNutrients[idx];
      check(
        `complaints.${complaint.id}: relatedNutrients[${idx}] substanceId matches ("${deEntry.substanceId}")`,
        enEntry?.substanceId === deEntry.substanceId
      );
      check(
        `complaints.${complaint.id}: relatedNutrients[${idx}] note present`,
        typeof enEntry?.note === 'string' && enEntry.note.length > 0
      );
    });
  }

  scanCompliance(`complaints.${complaint.id}.label`, en.label);
  scanCompliance(`complaints.${complaint.id}.intro`, en.intro);
  (en.contextAreas ?? []).forEach((text, idx) => scanCompliance(`complaints.${complaint.id}.contextAreas[${idx}]`, text));
  (en.redFlags ?? []).forEach((text, idx) => {
    scanCompliance(`complaints.${complaint.id}.redFlags[${idx}]`, text);
    scanObservational(`complaints.${complaint.id}.redFlags[${idx}]`, text);
  });
  (en.relatedNutrients ?? []).forEach((entry, idx) =>
    scanCompliance(`complaints.${complaint.id}.relatedNutrients[${idx}].note`, entry?.note)
  );
  (en.questionsForProfessional ?? []).forEach((text, idx) =>
    scanCompliance(`complaints.${complaint.id}.questionsForProfessional[${idx}]`, text)
  );
}

// ── 2. data/en/lifeStageAdvisories.js ───────────────────────────────

console.log('— data-en: lifeStageAdvisories —');

let advisoryEntryCount = 0;

for (const [substanceId, entries] of Object.entries(advisories)) {
  const enEntries = advisoriesEN[substanceId];
  check(`advisories.${substanceId}: overlay group exists`, Boolean(enEntries));

  entries.forEach((entry, idx) => {
    advisoryEntryCount += 1;
    const key = buildAdvisoryKey(entry.lifeStages, entry.severity);
    const text = enEntries?.[key];
    check(`advisories.${substanceId}[${idx}] (key "${key}"): overlay text exists`, typeof text === 'string' && text.length > 0);
    scanCompliance(`advisories.${substanceId}[${idx}]`, text);
  });
}

check('advisories: at least one entry was checked', advisoryEntryCount > 0);

console.log('— data-en: severityLabels —');

for (const severityValue of Object.values(ADVISORY_SEVERITY)) {
  check(`severityLabels.${severityValue}: exists`, typeof severityLabels[severityValue] === 'string' && severityLabels[severityValue].length > 0);
  scanCompliance(`severityLabels.${severityValue}`, severityLabels[severityValue]);
}
check(
  'severityLabels: same key count as SEVERITY_META',
  Object.keys(severityLabels).length === Object.keys(SEVERITY_META).length
);

// ── 3. data/en/referenceValues.js ───────────────────────────────────

console.log('— data-en: referenceValues (LIFE_STAGES) —');

for (const stage of LIFE_STAGES) {
  const en = LIFE_STAGES_EN[stage.id];
  check(`referenceValues.${stage.id}: overlay exists`, Boolean(en));
  if (!en) continue;

  check(`referenceValues.${stage.id}: short present`, typeof en.short === 'string' && en.short.length > 0);
  check(`referenceValues.${stage.id}: note present`, typeof en.note === 'string' && en.note.length > 0);

  scanCompliance(`referenceValues.${stage.id}.short`, en.short);
  scanCompliance(`referenceValues.${stage.id}.note`, en.note);
}

// ── 4. data/en/certifications.js ────────────────────────────────────

console.log('— data-en: certifications —');

for (const cert of certifications) {
  const en = CERTIFICATIONS_EN[cert.id];
  check(`certifications.${cert.id}: overlay exists`, Boolean(en));
  if (!en) continue;

  check(`certifications.${cert.id}: what present`, typeof en.what === 'string' && en.what.length > 0);
  check(`certifications.${cert.id}: scope present`, typeof en.scope === 'string' && en.scope.length > 0);

  scanCompliance(`certifications.${cert.id}.what`, en.what);
  scanCompliance(`certifications.${cert.id}.scope`, en.scope);
}

for (const kindValue of Object.values(
  // KIND_LABELS ist bereits nach Kind-Value indiziert (siehe data/certifications.js)
  { PURITY: 'purity', MANUFACTURING: 'manufacturing', CONTENT: 'content', ORIGIN: 'origin' }
)) {
  check(`kindLabels.${kindValue}: exists`, typeof kindLabels[kindValue] === 'string' && kindLabels[kindValue].length > 0);
  scanCompliance(`kindLabels.${kindValue}`, kindLabels[kindValue]);
}
check('kindLabels: same key count as KIND_LABELS', Object.keys(kindLabels).length === Object.keys(KIND_LABELS).length);

// ── 5. data/en/labMarkers.js — Kanarienvogel-Test ───────────────────

console.log('— data-en: labMarkers (canary) —');

const ALLOWED_LAB_MARKER_FIELDS = new Set(['id', 'labelKey', 'commonUnit', 'relatedSubstanceId']);

for (const marker of LAB_MARKERS) {
  const extraFields = Object.keys(marker).filter((field) => !ALLOWED_LAB_MARKER_FIELDS.has(field));
  check(
    `labMarkers.${marker.id}: no new free-text field beyond {id, labelKey, commonUnit, relatedSubstanceId} (found: ${extraFields.join(', ') || 'none'})`,
    extraFields.length === 0
  );
}
check('labMarkers overlay: intentionally empty', Object.keys(LAB_MARKERS_EN).length === 0);

// ── 6. data/en/outcomeMetrics.js — Kanarienvogel-Test ───────────────

console.log('— data-en: outcomeMetrics (canary) —');

const ALLOWED_OUTCOME_METRIC_FIELDS = new Set(['id', 'labelKey', 'direction']);

for (const metric of OUTCOME_METRICS) {
  const extraFields = Object.keys(metric).filter((field) => !ALLOWED_OUTCOME_METRIC_FIELDS.has(field));
  check(
    `outcomeMetrics.${metric.id}: no new free-text field beyond {id, labelKey, direction} (found: ${extraFields.join(', ') || 'none'})`,
    extraFields.length === 0
  );
}
check('outcomeMetrics overlay: intentionally empty', Object.keys(OUTCOME_METRICS_EN).length === 0);

if (failures > 0) {
  console.error(`\n${failures} TEST(S) FEHLGESCHLAGEN`);
  process.exit(1);
}
console.log('\nALLE TESTS BESTANDEN');
