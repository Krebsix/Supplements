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

console.log('\n— Doppelangabe auf EINEM Etikett: "1000 I.E. (25 µg)" —');
// Belegter Fall aus dem Feature-Audit 2026-09-14: Die Vision-Analyse
// liefert fuer diese eine Etikettzeile ZWEI Zutatenzeilen. Vorher summierte
// der Analyzer sie zu 2000 IE und meldete 250 Prozent des Referenzwerts.
{
  const doppelangabe = [
    {
      id: 'dup-1',
      name: 'Vitamin D3 + K2 Tropfen',
      status: 'active',
      dosage: { amount: '1', unit: 'Tropfen' },
      ingredientDetails: [
        { name: 'Vitamin D3', form: 'Cholecalciferol', amount: '1000', unit: 'I.E.' },
        { name: 'Vitamin D3', form: 'Cholecalciferol', amount: '25', unit: 'µg' },
      ],
    },
  ];
  const result = analyzeStack(doppelangabe, 'adult-woman');
  const d3 = result.totals.find((entry) => entry.substanceId === 'vitamin-d3');

  check('genau eine Position gezaehlt', d3?.countedPositions === 1, `war ${d3?.countedPositions}`);
  check('als Wiederholung erkannt', d3?.restatedPositions === 1, `war ${d3?.restatedPositions}`);
  check('Summe 1000 IE statt 2000', d3?.totalMax === 1000, `war ${d3?.totalMax} ${d3?.unit}`);
  check('Einheit bleibt IE', d3?.unit === 'IE', `war ${d3?.unit}`);
  check(
    '125 Prozent bei Referenzwert 800 IE',
    d3?.referenceCheck?.percentOfReference === 125,
    `war ${d3?.referenceCheck?.percentOfReference}`
  );
  check('Referenzwert unveraendert 800 IE', d3?.referenceCheck?.reference === 800);
  check('keine Obergrenzen-Ueberschreitung gemeldet', d3?.referenceCheck?.status !== 'above_limit');
  // Beide Etikettangaben muessen nachvollziehbar bleiben.
  check('beide Angaben bleiben sichtbar', d3?.sources.length === 2, `waren ${d3?.sources.length}`);
  check(
    'eine Quelle traegt 1000 I.E., eine 25 µg',
    d3?.sources.some((s) => s.amountText === '1000 I.E.') &&
      d3?.sources.some((s) => s.amountText === '25 µg')
  );
  check(
    'genau eine Quelle zaehlt fuer die Summe',
    d3?.sources.filter((s) => s.countedForTotal).length === 1
  );
  check(
    'die gezaehlte Quelle ist die in IE',
    d3?.sources.find((s) => s.countedForTotal)?.amountText === '1000 I.E.'
  );
  check('Wiederholung nicht als ungeloest gemeldet', result.unresolved.length === 0, JSON.stringify(result.unresolved));
}

console.log('\n— Zwei VERSCHIEDENE Praeparate mit je 1000 IE: addieren —');
{
  const zweiPraeparate = [
    {
      id: 'a',
      name: 'Vitamin D3 Tropfen',
      status: 'active',
      ingredientDetails: [{ name: 'Vitamin D3', form: 'Cholecalciferol', amount: '1000', unit: 'I.E.' }],
    },
    {
      id: 'b',
      name: 'Multivitamin',
      status: 'active',
      ingredientDetails: [{ name: 'Vitamin D3', form: 'Cholecalciferol', amount: '1000', unit: 'I.E.' }],
    },
  ];
  const d3 = analyzeStack(zweiPraeparate, 'adult-woman').totals
    .find((entry) => entry.substanceId === 'vitamin-d3');

  check('beide Positionen gezaehlt', d3?.countedPositions === 2, `war ${d3?.countedPositions}`);
  check('Summe 2000 IE', d3?.totalMax === 2000, `war ${d3?.totalMax}`);
  check('keine Wiederholung erkannt', d3?.restatedPositions === 0);
  check('250 Prozent bei Referenzwert 800 IE', d3?.referenceCheck?.percentOfReference === 250);
}

console.log('\n— Zwei Praeparate, eines mit Doppelangabe: 1000 + 1000 = 2000 —');
{
  const gemischt = [
    {
      id: 'a',
      name: 'Tropfen mit Doppelangabe',
      status: 'active',
      ingredientDetails: [
        { name: 'Vitamin D3', form: 'Cholecalciferol', amount: '1000', unit: 'I.E.' },
        { name: 'Vitamin D3', form: 'Cholecalciferol', amount: '25', unit: 'µg' },
      ],
    },
    {
      id: 'b',
      name: 'Multivitamin',
      status: 'active',
      ingredientDetails: [{ name: 'Vitamin D3', form: 'Cholecalciferol', amount: '25', unit: 'µg' }],
    },
  ];
  const d3 = analyzeStack(gemischt, 'adult-woman').totals
    .find((entry) => entry.substanceId === 'vitamin-d3');

  check('zwei Positionen gezaehlt', d3?.countedPositions === 2, `war ${d3?.countedPositions}`);
  check('Summe 2000 IE', d3?.totalMax === 2000, `war ${d3?.totalMax}`);
  check('eine Wiederholung erkannt', d3?.restatedPositions === 1);
  check('alle drei Angaben bleiben sichtbar', d3?.sources.length === 3);
}

console.log('\n— Verschiedene Formen: zwei Quellen, nicht zusammenfuehren —');
{
  // "D3 aus Lanolin 500 IE" plus "D3 aus Flechten 12,5 µg" sind zwei
  // echte Quellen. Ohne Formpruefung wuerde daraus 500 IE, also zu wenig.
  const zweiQuellen = [
    {
      id: 'c',
      name: 'Kombipraeparat',
      status: 'active',
      ingredientDetails: [
        { name: 'Vitamin D3', form: 'D3 (Cholecalciferol)', amount: '500', unit: 'I.E.' },
        { name: 'Vitamin D3', form: 'D2 (Ergocalciferol)', amount: '12.5', unit: 'µg' },
      ],
    },
  ];
  const d3 = analyzeStack(zweiQuellen, 'adult-woman').totals
    .find((entry) => entry.substanceId === 'vitamin-d3');

  check('beide Positionen gezaehlt', d3?.countedPositions === 2, `war ${d3?.countedPositions}`);
  check('Summe 1000 IE', d3?.totalMax === 1000, `war ${d3?.totalMax}`);
  check('keine Zusammenfuehrung', d3?.restatedPositions === 0);
}

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
