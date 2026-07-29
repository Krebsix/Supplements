/**
 * tests/stack-analyzer.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Prueft die Tagessumme ueber ALLE Produkte des Bestands.
 *
 * Hintergrund: Obergrenzen gelten fuer die Gesamtzufuhr, nicht pro Dose.
 * Drei Magnesium-Praeparate mit je unauffaelliger Einzelmenge koennen die
 * Obergrenze zusammen deutlich reissen — das blieb bisher unbemerkt, weil
 * jedes Produkt einzeln geprueft wurde.
 */

import { analyzeStack, getStackWarnings, parseAmountRange } from '../StackAnalyzer.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

console.log('\n— Mengenspannen vom Etikett —');
check('"250-500" → Spanne', JSON.stringify(parseAmountRange('250-500')) === '{"min":250,"max":500}');
check('"250 bis 500" → Spanne', JSON.stringify(parseAmountRange('250 bis 500')) === '{"min":250,"max":500}');
check('"300" → fester Wert', JSON.stringify(parseAmountRange('300')) === '{"min":300,"max":300}');
check('"1,5" → Dezimalkomma verstanden', parseAmountRange('1,5').max === 1.5);
check('Leere Angabe → null', parseAmountRange('') === null);
check('Verdrehte Spanne wird sortiert', parseAmountRange('500-250').min === 250);

console.log('\n— Summierung über mehrere Produkte —');

const stack = [
  { id: 'a', name: 'Magnesium', dosage: { amount: '200', unit: 'mg' } },
  { id: 'b', name: 'Magnesiumcitrat', dosage: { amount: '400', unit: 'mg' } },
  { id: 'c', name: 'Magnesium', dosage: { amount: '150', unit: 'mg' } },
  { id: 'd', name: 'Zink', dosage: { amount: '10', unit: 'mg' } },
];

const analysis = analyzeStack(stack, 'adult-woman');
const magnesium = analysis.totals.find((t) => t.substanceId === 'magnesium');

check('Magnesium aus drei Produkten erkannt', magnesium?.sources.length === 3, magnesium?.sources.length);
// 200 + (400 × 0,162 = 64,8) + 150 = 414,8 → gerundet 415
check('Summe rechnet die Verbindung vorher herunter (415 statt 750)',
  magnesium?.totalMax === 415, magnesium?.totalMax);
check('Die Umrechnung wird kenntlich gemacht', magnesium?.hasConvertedAmounts === true);
check('Summe reißt die Obergrenze → above_limit',
  magnesium?.referenceCheck?.status === 'above_limit', magnesium?.referenceCheck?.status);

const zinc = analysis.totals.find((t) => t.substanceId === 'zinc');
check('Einzelnes Produkt wird korrekt geführt', zinc?.sources.length === 1);
check('Zink 10 mg bleibt unter der Obergrenze',
  zinc?.referenceCheck?.status !== 'above_limit', zinc?.referenceCheck?.status);

console.log('\n— Doppelungen —');
check('Magnesium gilt als Doppelung',
  analysis.duplicates.some((d) => d.substanceId === 'magnesium'));
check('Zink gilt nicht als Doppelung',
  !analysis.duplicates.some((d) => d.substanceId === 'zinc'));

console.log('\n— Warnungen —');
const warnings = getStackWarnings(analysis);
const critical = warnings.filter((w) => w.level === 'critical');
check('Genau eine kritische Warnung', critical.length === 1, critical.length);
check('Die Warnung nennt die Anzahl der Produkte',
  /3 Produkten/.test(critical[0]?.text ?? ''), critical[0]?.text);
check('Die Warnung nennt die Summe',
  /415/.test(critical[0]?.text ?? ''));

console.log('\n— Nichts erfinden, wo nichts erkennbar ist —');

const messy = analyzeStack([
  { id: 'x', name: 'Irgendein Kräuterblend', dosage: { amount: '500', unit: 'mg' } },
  { id: 'y', name: 'Magnesium', dosage: { amount: '', unit: 'mg' } },
], 'adult-woman');

check('Unbekannte Substanz landet unter "ungeklärt"',
  messy.unresolved.some((u) => u.reason === 'unknown_substance'));
check('Position ohne Menge landet unter "ungeklärt"',
  messy.unresolved.some((u) => u.reason === 'no_amount'));
check('Ohne Menge wird nichts summiert',
  messy.totals.find((t) => t.substanceId === 'magnesium')?.totalMax === 0);
check('Ohne verwertbare Menge kein Referenzurteil',
  messy.totals.find((t) => t.substanceId === 'magnesium')?.referenceCheck === null);

console.log('\n— Spannen im Bestand —');
const ranged = analyzeStack([
  { id: 'r1', name: 'Magnesium', dosage: { amount: '100-200', unit: 'mg' } },
  { id: 'r2', name: 'Magnesium', dosage: { amount: '50', unit: 'mg' } },
], 'adult-woman');
const rangedMg = ranged.totals.find((t) => t.substanceId === 'magnesium');
check('Untergrenzen werden addiert (100 + 50)', rangedMg?.totalMin === 150, rangedMg?.totalMin);
check('Obergrenzen werden addiert (200 + 50)', rangedMg?.totalMax === 250, rangedMg?.totalMax);

console.log('\n— Gescanntes Multivitamin mit mehreren Wirkstoffen —');
const multi = analyzeStack([
  {
    id: 'm1',
    name: 'Multivitamin',
    ingredientDetails: [
      { name: 'Magnesium', amount: '100', unit: 'mg' },
      { name: 'Zink', amount: '5', unit: 'mg' },
    ],
  },
  { id: 'm2', name: 'Zink', dosage: { amount: '15', unit: 'mg' } },
], 'adult-woman');

check('Multivitamin wird in Einzelwirkstoffe zerlegt',
  multi.totals.length === 2, multi.totals.length);
const multiZinc = multi.totals.find((t) => t.substanceId === 'zinc');
check('Zink aus Multivitamin und Einzelpräparat summiert (5 + 15)',
  multiZinc?.totalMax === 20, multiZinc?.totalMax);
check('Zink 20 mg → über Referenzwert, unter Obergrenze 25',
  multiZinc?.referenceCheck?.status === 'above_reference', multiZinc?.referenceCheck?.status);

console.log('\n— Leerer Bestand —');
const empty = analyzeStack([], 'adult-woman');
check('Leerer Bestand → keine Summen', empty.totals.length === 0);
check('Leerer Bestand → keine Warnungen', getStackWarnings(empty).length === 0);
check('Kein Absturz ohne Lebensphase', Array.isArray(analyzeStack(stack, null).totals));

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
