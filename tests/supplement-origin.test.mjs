/**
 * tests/supplement-origin.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Prueft die Herkunft eines Bestandseintrags (Audit-Befund L5).
 *
 * Vorher lag `analysisMode` nur am Scan-Ergebnis, und `scanResultId`
 * wurde geschrieben, aber nie gelesen. Nach dem Speichern war damit nicht
 * mehr feststellbar, ob eine Zahl aus einer Fotoanalyse, einem Barcode,
 * dem Katalog oder von Hand kam.
 *
 * Zwei Dinge werden hier festgehalten:
 *   1. Die Zuordnung der sechs technischen analysisMode-Werte auf vier
 *      verstaendliche Herkuenfte, ohne Modellnamen und ohne interne
 *      Schluessel in der Oberflaeche.
 *   2. Dass Bestandseintraege OHNE die neuen Felder weiter funktionieren.
 */

import { ORIGIN, hasReviewableOrigin, resolveOrigin } from '../SupplementOrigin.js';
import { normalizeUserSupplement } from '../storeLogic.js';
import de from '../i18n/de/inventory.js';
import en from '../i18n/en/inventory.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

console.log('\n— Zuordnung der Scan-Wege —');
const cases = [
  ['vision', ORIGIN.PHOTO],
  ['community-cache', ORIGIN.PHOTO],
  ['barcode-off', ORIGIN.BARCODE],
  ['seed-catalog', ORIGIN.CATALOG],
  ['mock', ORIGIN.DEMO],
  ['demo-fallback', ORIGIN.DEMO],
];
for (const [mode, expected] of cases) {
  const { origin } = resolveOrigin({ analysisMode: mode });
  check(`${mode} → ${expected}`, origin === expected, `war ${origin}`);
}
check(
  'Fotoanalyse und Cache-Treffer sind fuer die Nutzerin dasselbe',
  resolveOrigin({ analysisMode: 'vision' }).origin ===
    resolveOrigin({ analysisMode: 'community-cache' }).origin
);
check(
  'unbekannter Modus faellt nicht auf einen falschen Weg',
  resolveOrigin({ analysisMode: 'irgendwas-neues' }).origin === ORIGIN.UNKNOWN
);

console.log('\n— Bestandseintraege ohne die neuen Felder —');
check(
  'kein analysisMode, source manual → von Hand',
  resolveOrigin({ source: 'manual' }).origin === ORIGIN.MANUAL
);
check(
  'kein analysisMode, source library → Katalog',
  resolveOrigin({ source: 'library' }).origin === ORIGIN.CATALOG
);
check(
  'alter Scan-Eintrag ohne analysisMode → Herkunft nicht hinterlegt, kein Fehler',
  resolveOrigin({ source: 'scan' }).origin === ORIGIN.UNKNOWN
);
check('leeres Objekt stuerzt nicht ab', resolveOrigin({}).origin === ORIGIN.UNKNOWN);
check('ohne Argument stuerzt nicht ab', resolveOrigin().origin === ORIGIN.UNKNOWN);
check('null-Felder stuerzen nicht ab', resolveOrigin({ analysisMode: null, source: null }).origin === ORIGIN.UNKNOWN);

console.log('\n— Herkunft wird am Praeparat gespeichert —');
{
  const gespeichert = normalizeUserSupplement({
    name: 'Vitamin D3 Tropfen',
    analysisMode: 'vision',
    scanResultId: 'scan-42',
    captureSummary: { completedCount: 2, requiredCount: 4, steps: [] },
  });
  check('analysisMode bleibt erhalten', gespeichert.analysisMode === 'vision');
  check('scanResultId bleibt erhalten', gespeichert.scanResultId === 'scan-42');
  check('captureSummary bleibt erhalten', gespeichert.captureSummary?.completedCount === 2);
  check('Herkunft daraus ableitbar', resolveOrigin(gespeichert).origin === ORIGIN.PHOTO);
}
{
  // Ein Eintrag, wie ihn der Bestand vor dieser Aenderung enthielt.
  const alt = normalizeUserSupplement({ name: 'Magnesium', source: 'manual' });
  check('alter Eintrag: Felder sind null, nicht undefined', alt.analysisMode === null && alt.scanResultId === null && alt.captureSummary === null);
  check('alter Eintrag bleibt gueltig', alt.status === 'active' && Array.isArray(alt.ingredientDetails));
  check('alter Eintrag: Herkunft von Hand', resolveOrigin(alt).origin === ORIGIN.MANUAL);
}

console.log('\n— Pruefbedarf —');
check('Fotoanalyse sollte geprueft werden', hasReviewableOrigin({ analysisMode: 'vision' }) === true);
check('Barcode sollte geprueft werden', hasReviewableOrigin({ analysisMode: 'barcode-off' }) === true);
check('Katalog braucht keine Pruefung', hasReviewableOrigin({ analysisMode: 'seed-catalog' }) === false);
check('Eigene Eingabe braucht keine Pruefung', hasReviewableOrigin({ source: 'manual' }) === false);

console.log('\n— Oberflaechentexte: verstaendlich, ohne Technik —');
const labelKeys = ['origin.photo', 'origin.barcode', 'origin.catalog', 'origin.manual', 'origin.demo', 'origin.unknown'];
for (const key of labelKeys) {
  check(`${key} auf Deutsch vorhanden`, typeof de[key] === 'string' && de[key].length > 0);
  check(`${key} auf Englisch vorhanden`, typeof en[key] === 'string' && en[key].length > 0);
}
check('Herkunftszeile in beiden Sprachen', Boolean(de['inventory.originLine'] && en['inventory.originLine']));
// Keine technischen Details in der Oberflaeche: weder Modellnamen noch
// interne Modus-Schluessel duerfen in den Texten auftauchen.
const verboten = ['claude', 'opus', 'sonnet', 'haiku', 'gpt', 'vision', 'cache', 'mock', 'analysismode', 'seed', 'off'];
for (const [sprache, katalog] of [['de', de], ['en', en]]) {
  for (const key of [...labelKeys, 'inventory.originLine']) {
    const text = String(katalog[key] ?? '').toLowerCase();
    const treffer = verboten.filter((wort) => text.includes(wort));
    check(`${sprache} ${key} ohne technische Begriffe`, treffer.length === 0, treffer.join(','));
  }
}

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
