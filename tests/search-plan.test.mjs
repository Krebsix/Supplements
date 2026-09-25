import { readFileSync } from 'node:fs';
import path from 'node:path';
// Tests fuer SearchPlan.js: Suche im Tab "Wissen" (Audit-Befund L4).
// Wirkstoffsuche unveraendert, Produkte nach Namen auffindbar, und
// Produkte verdraengen einen erkannten Wirkstoff nicht.

import {
  CATALOG_PICK_ROUTE,
  PRODUCT_HIT_LIMIT,
  planProductHits,
  searchSubstances,
} from '../SearchPlan';
import { seedEntryToScanDraft } from '../SeedCatalog';
import { matchIngredient } from '../SubstanceMatcher';
import { substances } from '../data/substances';
import { setActiveLanguage } from '../i18n/runtime';
import de from '../i18n/de/index.js';
import en from '../i18n/en/index.js';

let failures = 0;

function check(name, condition, extra = '') {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name} ${extra}`);
  }
}

// Wie search.jsx: Wirkstoff-Profile sind die Treffer, die matchIngredient
// aufloesen kann; deren Anzahl steuert die Produkt-Rolle.
function substanceCountFor(query) {
  return searchSubstances(query)
    .map((substance) => matchIngredient({ name: substance.name }))
    .filter((match) => match?.matched).length;
}

function planFor(query) {
  return planProductHits(query, { substanceCount: substanceCountFor(query) });
}

const label = (hit) => `${hit.brand} / ${hit.productName}`;

// Bisherige Implementierung aus search.jsx, woertlich: Referenz dafuer,
// dass das Verschieben nach SearchPlan.js nichts veraendert hat.
function legacySearchSubstances(query) {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];
  return substances.filter((substance) => {
    const haystack = [
      substance.name,
      ...(substance.synonyms ?? []),
      ...(substance.useCases ?? []).map((useCase) => useCase.topic),
      substance.category,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });
}

console.log('\n— Wirkstoffsuche unveraendert —');

const legacyQueries = [
  'Magnesium', 'magnesium', 'Vitamin D', 'Zink', 'Eisen', 'Omega 3', 'Schlaf',
  'Kraempfe', 'ma', 'm', '', '   ', 'Biogena Magnesium', 'xyzabc', 'Mineralstoffe',
];
for (const query of legacyQueries) {
  const now = searchSubstances(query).map((substance) => substance.id);
  const before = legacySearchSubstances(query).map((substance) => substance.id);
  check(
    `"${query}" liefert dieselben Wirkstoffe wie vorher`,
    JSON.stringify(now) === JSON.stringify(before),
    `${now.length} statt ${before.length}`
  );
}
check(
  '"Magnesium" findet den Wirkstoff Magnesium',
  searchSubstances('Magnesium').some((substance) => substance.id === 'magnesium')
);
check('Eingaben unter 2 Zeichen liefern nichts', searchSubstances('m').length === 0);

console.log('\n— Wirkstoff bleibt primaer —');

const magnesium = planFor('Magnesium');
check('"Magnesium" loest genau einen Wirkstoff auf', substanceCountFor('Magnesium') === 1);
check(
  '"Magnesium": keine Namenstreffer, die Wirkstoffkarte bleibt die Antwort',
  magnesium.placement === 'none' && magnesium.hits.length === 0
);
check(
  'genau ein Wirkstoff unterdrueckt Produkte auch bei vorhandenen Namenstreffern',
  planProductHits('Omega 3', { substanceCount: 1 }).placement === 'none'
);

const zink = planFor('Zink');
check('"Zink" trifft mehrere Wirkstoffe', substanceCountFor('Zink') > 1);
check(
  '"Zink": Produkte erscheinen nur nachrangig',
  zink.placement === 'secondary' && zink.hits.length > 0
);

console.log('\n— Produkte nach Namen —');

const orthomol = planFor('Orthomol');
check('"Orthomol" trifft keinen Wirkstoff', substanceCountFor('Orthomol') === 0);
check('"Orthomol": Produkte sind die Antwort', orthomol.placement === 'primary');
check(
  '"Orthomol": jeder Treffer gehoert zur Marke',
  orthomol.hits.length > 0 && orthomol.hits.every((hit) => /orthomol/i.test(hit.brand)),
  orthomol.hits.map(label).join('; ')
);

const biogena = planFor('Biogena Magnesium');
check('"Biogena Magnesium" trifft keinen Wirkstoff', substanceCountFor('Biogena Magnesium') === 0);
check('"Biogena Magnesium": Produkte sind die Antwort', biogena.placement === 'primary');
check(
  '"Biogena Magnesium" findet BIOGENA / Magnesium 150 mg',
  biogena.hits.some((hit) => /biogena/i.test(hit.brand) && hit.productName === 'Magnesium 150 mg'),
  biogena.hits.map(label).join('; ')
);
check(
  '"Magnesium Biogena" (umgekehrte Reihenfolge) findet dasselbe Produkt',
  planFor('Magnesium Biogena').hits.some((hit) => hit.productName === 'Magnesium 150 mg')
);
check(
  'hoechstens PRODUCT_HIT_LIMIT Treffer',
  ['Orthomol', 'Mivolis', 'Zink', 'ESN'].every((query) => planFor(query).hits.length <= PRODUCT_HIT_LIMIT)
);

console.log('\n— Kein Treffer —');

const nothing = planFor('xyzabc');
check('"xyzabc": kein Wirkstoff', substanceCountFor('xyzabc') === 0);
check('"xyzabc": keine Produkte', nothing.placement === 'none' && nothing.hits.length === 0);
check('leere Eingabe: keine Produkte', planProductHits('', {}).hits.length === 0);
check('fehlende Eingabe wirft nicht', planProductHits(undefined).hits.length === 0);

console.log('\n— Herkunft und Lizenz bleiben erhalten —');

const mivolis = planFor('Mivolis');
check(
  'Open-Food-Facts-Treffer tragen license ODbL',
  mivolis.hits.length > 0 && mivolis.hits.every((hit) => hit.entry?.license === 'ODbL'),
  mivolis.hits.map(label).join('; ')
);
check(
  'Herstellerkatalog-Treffer tragen keine ODbL-Kennung',
  biogena.hits.every((hit) => hit.entry?.license === undefined)
);

console.log('\n— Tipp fuehrt in den bestehenden Aufnehmen-Ablauf —');

check('Ziel ist /AddSupplement?fromScan=1', CATALOG_PICK_ROUTE === '/AddSupplement?fromScan=1');
const draft = seedEntryToScanDraft(biogena.hits[0].entry);
check('Entwurf ist als Katalogtreffer gekennzeichnet', draft.analysisMode === 'seed-catalog');

const screen = readFileSync(
  path.join(process.cwd(), 'app/(tabs)/(discover)/search.jsx'),
  'utf8'
);
check('search.jsx nutzt CATALOG_PICK_ROUTE', screen.includes('router.push(CATALOG_PICK_ROUTE)'));
check(
  'Namenstreffer gehen ueber denselben Handler wie die Wirkstoff-Produkte',
  screen.includes('handlePickCatalogProduct(hit.entry)') &&
    screen.includes('handlePickCatalogProduct(product.entry)')
);
check(
  'beide Produktlisten rendern ueber CatalogProductRow (gleiche ODbL-Kennzeichnung)',
  (screen.match(/<CatalogProductRow/g) ?? []).length === 2 &&
    screen.includes("entry?.license === 'ODbL'")
);
check('keine eigene Wirkstoffsuche mehr im Screen', !screen.includes('function searchSubstances'));

console.log('\n— Deutsch und Englisch —');

for (const key of ['search.productHits.title', 'search.products.offBadge', 'search.products.offSource']) {
  check(`${key} auf Deutsch vorhanden`, typeof de[key] === 'string' && de[key].trim().length > 0);
  check(`${key} auf Englisch vorhanden`, typeof en[key] === 'string' && en[key].trim().length > 0);
  check(`${key} ohne Gedankenstrich`, !/[—–]/.test(`${de[key]} ${en[key]}`));
}

setActiveLanguage('en');
const biogenaEn = planFor('Biogena Magnesium');
const mivolisEn = planFor('Mivolis');
setActiveLanguage('de');
check(
  'Produkttreffer sind sprachunabhaengig (Marke und Name)',
  JSON.stringify(biogenaEn.hits.map(label)) === JSON.stringify(biogena.hits.map(label)) &&
    JSON.stringify(mivolisEn.hits.map(label)) === JSON.stringify(mivolis.hits.map(label))
);
check('Rolle auf Englisch unveraendert', biogenaEn.placement === 'primary');

if (failures > 0) {
  console.error(`\n${failures} Fehler`);
  process.exit(1);
}
console.log('\nsearch-plan: alle Pruefungen bestanden');
