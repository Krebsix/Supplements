/**
 * tests/dose-normalizer.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Prueft die Unterscheidung Verbindungsmenge vs. Elementmenge.
 *
 * Hintergrund: "Magnesiumcitrat 500 mg" enthaelt rund 81 mg elementares
 * Magnesium. Wurde die Verbindungsmenge ungeprueft gegen den elementaren
 * Grenzwert gehalten, meldete die App eine Ueberschreitung, wo keine war.
 *
 * Die Tests decken beide Fehlerrichtungen ab:
 *   - falsche Warnung  (Verbindung nicht heruntergerechnet)
 *   - falsche Entwarnung (elementare Angabe faelschlich heruntergerechnet)
 * Die zweite Richtung ist die gefaehrlichere und deshalb mehrfach geprueft.
 */

import { matchIngredient } from '../SubstanceMatcher.js';
import { checkAgainstReference } from '../ReferenceCheck.js';
import { AMOUNT_BASIS, resolveAmountBasis, getComparableAmount } from '../DoseNormalizer.js';
import { elementalFractions, elementTerms } from '../data/elementalFractions.js';
import { substances, substanceById } from '../data/substances.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

console.log('\n— Verbindung wird auf das Element heruntergerechnet —');

const citrate = matchIngredient({ name: 'Magnesiumcitrat', amount: '500', unit: 'mg' });
const citrateDose = resolveAmountBasis(citrate);
check('Magnesiumcitrat → basis "compound"',
  citrateDose.basis === AMOUNT_BASIS.COMPOUND, citrateDose.basis);
check('500 mg Magnesiumcitrat → rund 81 mg elementar',
  citrateDose.elementalAmount === 81, citrateDose.elementalAmount);
check('Ursprungsmenge bleibt erhalten',
  citrateDose.originalAmount === 500, citrateDose.originalAmount);

const citrateCheck = checkAgainstReference(citrate, 'adult-woman');
check('Magnesiumcitrat 500 mg → KEINE Grenzwert-Warnung mehr (war der Bug)',
  citrateCheck.status !== 'above_limit', citrateCheck.status);
check('Verglichen wird die elementare Menge',
  citrateCheck.amount === 81, citrateCheck.amount);
check('Die Umrechnung wird im Text offengelegt',
  /Grundlage der Rechnung/.test(citrateCheck.summary));
check('Der Text nennt das Etikettenwort, nicht den internen Formnamen',
  /Magnesiumcitrat enthalten/.test(citrateCheck.summary));

const zincOxide = matchIngredient({ name: 'Zinkoxid', amount: '50', unit: 'mg' });
check('Zinkoxid 50 mg → 40,2 mg elementar (hoher Anteil)',
  resolveAmountBasis(zincOxide).elementalAmount === 40.2,
  resolveAmountBasis(zincOxide).elementalAmount);
check('Zinkoxid 50 mg bleibt trotz Umrechnung über der Obergrenze',
  checkAgainstReference(zincOxide, 'adult-woman').status === 'above_limit');

console.log('\n— Elementare Angaben bleiben unangetastet (LMIV-Regelfall) —');

const elemental = matchIngredient({ name: 'Magnesium', amount: '300', unit: 'mg' });
check('"Magnesium 300 mg" → basis "elemental"',
  resolveAmountBasis(elemental).basis === AMOUNT_BASIS.ELEMENTAL);
check('Menge wird NICHT heruntergerechnet',
  checkAgainstReference(elemental, 'adult-woman').amount === 300);

// Der kritischste Fall: Die Verbindung steht als Quelle daneben, die Menge
// meint aber das Element. Wird hier gerechnet, verschwindet eine echte
// Ueberschreitung aus der Anzeige.
const withSource = matchIngredient({ name: 'Magnesium', form: 'aus Magnesiumcitrat', amount: '300', unit: 'mg' });
check('"Magnesium (aus Magnesiumcitrat) 300 mg" → bleibt elementar',
  resolveAmountBasis(withSource).basis === AMOUNT_BASIS.ELEMENTAL,
  resolveAmountBasis(withSource).basis);
check('… und behält die volle Menge',
  checkAgainstReference(withSource, 'adult-woman').amount === 300);

const overdose = matchIngredient({ name: 'Magnesium', amount: '900', unit: 'mg' });
check('Echte Überdosis wird weiterhin gemeldet (keine Falsch-Entwarnung)',
  checkAgainstReference(overdose, 'adult-woman').status === 'above_limit');

console.log('\n— Ohne belastbaren Elementanteil wird nicht gerechnet —');

// Molybdaenglycinat ist ein proprietaeres Chelat ohne feste Summenformel.
// data/elementalFractions.js laesst es deshalb bewusst weg.
const molyb = matchIngredient({ name: 'Molybdänglycinat', amount: '200', unit: 'µg' });
check('Molybdänglycinat wird als Form erkannt', Boolean(molyb?.form));

const molybDose = resolveAmountBasis(molyb);
check('Molybdänglycinat → basis "compound_unknown"',
  molybDose.basis === AMOUNT_BASIS.COMPOUND_UNKNOWN, molybDose.basis);
check('… und liefert keinen erfundenen Elementwert',
  molybDose.elementalAmount === null);
check('… und keinen erfundenen Anteil',
  molybDose.fraction === null);

// Der Vergleichspfad in checkAgainstReference laesst sich hier nicht ueber
// einen echten Etikettentext pruefen: Molybdaen und Chrom sind die einzigen
// Substanzen mit Formen ohne gesicherten Elementanteil, und fuer beide sind
// (noch) keine Referenzwerte hinterlegt — ohne Referenzwert steigt die
// Funktion schon vorher aus. Sobald dort Werte ergaenzt werden, gehoert
// dieser Fall ergaenzt. Geprueft wird deshalb die Stelle, an der die
// Entscheidung faellt: getComparableAmount() gibt nichts Vergleichbares her.
check('Ohne gesicherten Anteil gibt es keine vergleichbare Menge',
  getComparableAmount(molyb) === null);
check('Bei bekannter Verbindung dagegen schon',
  getComparableAmount(citrate) === 81, getComparableAmount(citrate));

console.log('\n— Substanzen ohne Element/Verbindung-Frage —');

const vitC = matchIngredient({ name: 'Vitamin C', amount: '500', unit: 'mg' });
check('Vitamin C → basis "not_applicable"',
  resolveAmountBasis(vitC).basis === AMOUNT_BASIS.NOT_APPLICABLE);
check('Vitamin C behält seine Menge',
  checkAgainstReference(vitC, 'adult-woman').amount === 500);

const ashwa = matchIngredient({ name: 'Ashwagandha', amount: '600', unit: 'mg' });
check('Pflanzenstoff → keine Umrechnung',
  resolveAmountBasis(ashwa).basis === AMOUNT_BASIS.NOT_APPLICABLE);

console.log('\n— Datenintegrität der Stöchiometrie-Tabelle —');

let unknownSubstance = 0;
let unknownForm = 0;
let badFraction = 0;
let missingNote = 0;

for (const [substanceId, forms] of Object.entries(elementalFractions)) {
  const substance = substanceById.get(substanceId);
  if (!substance) { console.log(`  FAIL Elementanteil für unbekannte Substanz: ${substanceId}`); unknownSubstance++; continue; }

  const knownForms = (substance.forms ?? []).map((f) => f.name);
  for (const [formName, entry] of Object.entries(forms)) {
    // Schutz gegen stilles Brechen: wird eine Form in substances.js
    // umbenannt, findet getElementalFraction() sie nicht mehr und die
    // App rechnet klammheimlich nicht mehr um.
    if (!knownForms.includes(formName)) {
      console.log(`  FAIL ${substanceId}: Form "${formName}" existiert nicht in substances.js (bekannt: ${knownForms.join(', ')})`);
      unknownForm++;
    }
    if (!(entry.fraction > 0 && entry.fraction <= 1)) {
      console.log(`  FAIL ${substanceId}/${formName}: Anteil ${entry.fraction} liegt außerhalb 0–1`);
      badFraction++;
    }
    if (!entry.note || entry.note.length < 10) {
      console.log(`  FAIL ${substanceId}/${formName}: Beleg (note) fehlt oder ist zu knapp`);
      missingNote++;
    }
  }
}

check('Alle Elementanteile verweisen auf bekannte Substanzen', unknownSubstance === 0);
check('Alle Formnamen existieren in substances.js', unknownForm === 0);
check('Alle Anteile liegen plausibel zwischen 0 und 1', badFraction === 0);
check('Jeder Anteil trägt einen Beleg (Summenformel/Molmasse)', missingNote === 0);

let missingTerms = 0;
for (const substanceId of Object.keys(elementalFractions)) {
  if (!Array.isArray(elementTerms[substanceId]) || elementTerms[substanceId].length === 0) {
    console.log(`  FAIL ${substanceId}: keine elementTerms hinterlegt — Erkennung "Element genannt" schlägt fehl`);
    missingTerms++;
  }
}
check('Jede Substanz mit Elementanteilen hat Element-Bezeichner', missingTerms === 0);

// "mg" als Element-Bezeichner waere fatal: jede Milligramm-Angabe wuerde
// als Magnesium-Elementnennung gelesen.
const dangerousTerms = Object.entries(elementTerms).filter(([, terms]) =>
  terms.some((t) => ['mg', 'g', 'ie', 'iu', 'ml'].includes(t))
);
check('Keine Einheitenkürzel unter den Element-Bezeichnern',
  dangerousTerms.length === 0, JSON.stringify(dangerousTerms));

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
