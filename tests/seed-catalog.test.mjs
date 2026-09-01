import { readFileSync } from 'node:fs';
import path from 'node:path';
// Tests fuer SeedCatalog.js und data/seedProducts.json:
// Datenintegritaet des Katalogs (Quelle je Eintrag, gueltige EANs) und
// Verhalten von Suche und Draft-Erzeugung.

import {
  catalogCounts,
  findProductsBySubstance,
  normalizeCatalogText,
  parseCatalogAmount,
  productsForBrand,
  searchSeedCatalog,
  seedEntryToScanDraft,
  sortProducts,
} from '../SeedCatalog';
import seedProducts from '../data/seedProducts.json';
import offProducts from '../data/offProducts.json';

let failures = 0;

function check(name, condition, extra = '') {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name} ${extra}`);
  }
}

console.log('— Katalog-Integritaet —');
check('Katalog hat mindestens 100 Eintraege', seedProducts.length >= 100, String(seedProducts.length));
check('Jeder Eintrag hat Marke, Name und Quelle', seedProducts.every((p) => p.brand && p.name && p.source));
check('EANs sind reine Ziffernfolgen', seedProducts.every((p) => !p.ean || /^[0-9]{8,14}$/.test(String(p.ean))));
check('Country ist DE, AT oder CH', seedProducts.every((p) => ['DE', 'AT', 'CH'].includes(p.country)));
check(
  'keyIngredients tragen nie erfundene Einheiten (Menge ohne Einheit erlaubt, Einheit ohne Menge nicht)',
  seedProducts.every((p) => (p.keyIngredients ?? []).every((i) => !i.unit || i.amount !== null && i.amount !== undefined))
);

console.log('— ODbL-Split (Task 6) —');
// seedProducts.json enthaelt nach dem Split keine Open-Food-Facts-Quellen
// mehr; offProducts.json traegt sie samt Attribution im Dateikopf.
check(
  'seedProducts.json enthaelt keine world.openfoodfacts.org-Quellen mehr',
  seedProducts.every((p) => !String(p.source ?? '').includes('world.openfoodfacts.org'))
);
check('offProducts.json traegt license ODbL-1.0 im Kopf', offProducts.license === 'ODbL-1.0');
check('offProducts.json traegt eine Attribution', typeof offProducts.attribution === 'string' && offProducts.attribution.length > 0);
const counts = catalogCounts();
check('catalogCounts: 365 Herstellerkatalog-Eintraege', counts.manufacturer === 365, String(counts.manufacturer));
check('catalogCounts: 48 OFF-Eintraege', counts.off === 48, String(counts.off));
check('catalogCounts: 413 Eintraege gesamt', counts.total === 413, String(counts.total));
// productsForBrand liest CATALOG (Herstellerkatalog + OFF zusammengefuehrt):
// jedes OFF-Produkt muss dort unter seiner EAN mit license 'ODbL' auftauchen.
const offBrands = [...new Set(offProducts.products.map((p) => p.brand))];
const catalogEntriesByEan = new Map();
for (const brand of offBrands) {
  for (const entry of productsForBrand(brand)) catalogEntriesByEan.set(entry.ean, entry);
}
check(
  'jedes OFF-Produkt hat im Katalog license ODbL',
  offProducts.products.every((p) => catalogEntriesByEan.get(p.ean)?.license === 'ODbL'),
  String(offProducts.products.filter((p) => catalogEntriesByEan.get(p.ean)?.license !== 'ODbL').length)
);

console.log('— Suche —');
const biogena = searchSeedCatalog('biogena magnesium');
check('BIOGENA Magnesium wird gefunden', biogena.length >= 1, JSON.stringify(biogena.slice(0, 1)));
check('Treffer tragen origin seed und den Roheintrag', biogena.every((c) => c.origin === 'seed' && c.entry));
check('Leere Suche → leeres Ergebnis', searchSeedCatalog('').length === 0);
check('Fantasiewort → leeres Ergebnis', searchSeedCatalog('xyzzynichtda').length === 0);
check('Maximal 5 Treffer', searchSeedCatalog('magnesium').length <= 5);

console.log('— Normalisierung —');
check('Tausenderpunkt faellt weg (2.000 → 2000)', normalizeCatalogText('Vitamin D3 2.000 I.E.') === 'vitamin d3 2000 i e');
check('Suche mit 500 findet Vigantolvit 500 I.E.',
  searchSeedCatalog('vigantolvit 500').some((c) => c.productName.includes('500')));
check('Suche in Ziffern ohne Punkt trifft gepunktete Namen',
  searchSeedCatalog('vigantol 20000').some((c) => c.productName.includes('20.000')));

console.log('— Draft-Erzeugung —');
const entry = seedProducts.find((p) => (p.keyIngredients ?? []).length > 0);
const draft = seedEntryToScanDraft(entry);
check('Draft traegt analysisMode seed-catalog', draft.analysisMode === 'seed-catalog');
check('Wirkstoffe wandern in ingredientDetails', draft.ingredientDetails.length === entry.keyIngredients.length);
check('Provenienz-Hinweis vorhanden', draft.warnings.length > 0 && Boolean(draft.uncertaintyNote));
check('Keine erfundene Dosierung', draft.dosage.amount === '' && draft.dosage.unit === '');

const empty = seedEntryToScanDraft({ brand: 'X', name: 'Y', ean: null, keyIngredients: [] });
check('Eintrag ohne Mengen → leere Wirkstofflisten, kein Erfinden', empty.detectedIngredients.length === 0 && empty.barcode === null);

console.log('— Produkte je Wirkstoff —');
const mg = findProductsBySubstance('magnesium');
// Realer Wert per Sondierung ermittelt (SubstanceMatcher matcht alle
// magnesiumhaltigen keyIngredients-Zeilen des Katalogs, dedupliziert je
// Eintrag): 66 Treffer. Schwelle 60 haelt damit sicher.
check('Magnesium liefert Produkte', mg.length >= 60, String(mg.length));
check('jeder Treffer hat Marke und Namen', mg.every((p) => p.brand && p.name));
check('Menge ist Zahl oder null', mg.every((p) => p.amount === null || Number.isFinite(p.amount)));
check('Standard nach Marke sortiert', mg.every((p, i) => i === 0 || mg[i - 1].brand.localeCompare(p.brand, 'de') <= 0));
const byAmount = sortProducts(mg, 'amount');
check('Sortierung nach Menge absteigend', byAmount.every((p, i) => i === 0 || (byAmount[i - 1].amount ?? -1) >= (p.amount ?? -1)));
check('unbekannte Substanz: leer', findProductsBySubstance('gibt-es-nicht').length === 0);
check('Synonym trifft (Magnesiumcitrat-Produkte enthalten)', mg.some((p) => /citrat/i.test(p.form ?? '') || /citrat/i.test(p.name)));

console.log('— parseCatalogAmount —');
check('leerer String → null (keine erfundene 0)', parseCatalogAmount('') === null);
check('Dezimalkomma → Punkt (1,1 → 1.1)', parseCatalogAmount('1,1') === 1.1);
check('reine Ziffernfolge (400) → 400', parseCatalogAmount('400') === 400);
check('Spanne (250-500) → null, keine geratene Zahl', parseCatalogAmount('250-500') === null);
check('undefined → null', parseCatalogAmount(undefined) === null);

console.log('— Index-Invariante: Menge ist nie eine erfundene Zahl —');
// Ueber mehrere Substanzen hinweg (nicht nur Magnesium): jeder Treffer im
// Index hat entweder null oder eine echte, endliche Zahl -- nie NaN und
// nie eine 0, die aus einem leeren Wert entstanden waere.
for (const substanceId of ['vitamin-d3', 'vitamin-b12', 'thiamin', 'magnesium']) {
  const hits = findProductsBySubstance(substanceId);
  check(
    `${substanceId}: amount ist null oder endliche Zahl bei jedem Treffer`,
    hits.every((p) => p.amount === null || Number.isFinite(p.amount)),
    String(hits.filter((p) => !(p.amount === null || Number.isFinite(p.amount))).length)
  );
}

console.log('— Siegel-Referenzen im Katalog —');
{
  const { certificationById } = await import('../data/certifications.js');
  const raw = JSON.parse(
    readFileSync(path.join(process.cwd(), 'data', 'seedProducts.json'), 'utf8')
  );
  let certCount = 0;
  for (const entry of raw) {
    for (const cert of entry.certifications ?? []) {
      certCount += 1;
      check(`${entry.brand} ${entry.name}: Siegel-ID bekannt (${cert.id})`, certificationById(cert.id) !== null);
      check(`${entry.brand} ${entry.name}: level product|brand`, cert.level === 'product' || cert.level === 'brand');
      check(`${entry.brand} ${entry.name}: Quelle ist URL`, /^https:\/\//.test(cert.sourceUrl ?? ''));
      check(`${entry.brand} ${entry.name}: checkedAt gesetzt`, /^\d{4}-\d{2}-\d{2}$/.test(cert.checkedAt ?? ''));
    }
  }
  check('mindestens ein Siegel-Eintrag vorhanden', certCount >= 1);
}

if (failures > 0) {
  console.error(`\n${failures} Fehlschlaege`);
  process.exit(1);
}
console.log('\nALLE TESTS BESTANDEN');
