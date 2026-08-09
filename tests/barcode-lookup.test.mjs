/**
 * tests/barcode-lookup.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Prueft die Mapping-/Normalisierungslogik des Barcode-Pfads:
 * Open-Food-Facts-Produktobjekt → Scan-Ergebnis im App-Format.
 *
 * Bewusst OHNE echten Netzwerkaufruf: lookupBarcode() selbst ruft
 * fetch() auf und wird hier nicht getestet. Getestet wird
 * mapOffProductToScanResult() — eine reine Funktion, die aus
 * lookupBarcode() ausgelagert wurde (kein Verhalten geaendert),
 * sowie die Hilfsfunktionen cleanText/splitIngredients, aus denen
 * sich die Normalisierung zusammensetzt.
 *
 * Um sicherzustellen, dass wirklich nichts ins Netz geht, wird
 * global.fetch mit einer Funktion ueberschrieben, die bei jedem
 * Aufruf sofort fehlschlaegt — jeder unbeabsichtigte echte Aufruf
 * faellt damit im Test sofort auf.
 */

global.fetch = () => {
  throw new Error('fetch darf in diesem Test nicht aufgerufen werden');
};

import { mapOffProductToScanResult, cleanText, splitIngredients, lookupBarcode, extractProductCode } from '../BarcodeLookup.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

console.log('\n— cleanText —');
check('String wird getrimmt', cleanText('  Magnesium  ') === 'Magnesium');
check('null → leerer String', cleanText(null) === '');
check('undefined → leerer String', cleanText(undefined) === '');
check('Zahl → leerer String (kein String-Zwang)', cleanText(42) === '');

console.log('\n— splitIngredients —');
check('Kommagetrennte Liste wird zerlegt',
  JSON.stringify(splitIngredients('Magnesiumcitrat, Kapselhuelle: HPMC, Reismehl')) ===
  JSON.stringify(['Magnesiumcitrat', 'Kapselhuelle: HPMC', 'Reismehl']));
check('Semikolon trennt ebenfalls',
  JSON.stringify(splitIngredients('Zink; Kupfer')) === JSON.stringify(['Zink', 'Kupfer']));
check('Leerer Text → leeres Array', JSON.stringify(splitIngredients('')) === '[]');
check('Kurzeintraege (Laenge <= 1) fallen raus',
  !splitIngredients('Magnesium, a, Zink').includes('a'));
check('Maximal 30 Eintraege',
  splitIngredients(Array.from({ length: 40 }, (_, i) => `Stoff${i}`).join(',')).length === 30);

console.log('\n— mapOffProductToScanResult: Grunddaten —');

const product = {
  product_name_de: 'Magnesium Complex',
  product_name: 'Magnesium Complex EN',
  brands: 'Beispielmarke',
  ingredients_text_de: 'Magnesiumcitrat, Kapselhuelle: HPMC',
  ingredients_text: 'Magnesium citrate, Capsule shell: HPMC',
  quantity: '60 Kapseln',
  serving_size: '2 Kapseln',
};

const mapped = mapOffProductToScanResult(product, '4001234567890');

check('productName bevorzugt die deutsche Bezeichnung',
  mapped.productName === 'Magnesium Complex');
check('brand wird uebernommen', mapped.brand === 'Beispielmarke');
check('confidence ist bewusst 0 (OFF liefert keine Konfidenz)',
  mapped.confidence === 0);
check('detectedIngredients nutzt den deutschen Ingredients-Text',
  JSON.stringify(mapped.detectedIngredients) ===
  JSON.stringify(['Magnesiumcitrat', 'Kapselhuelle: HPMC']));
check('dosage bleibt leer (OFF liefert keine strukturierte Dosierung)',
  mapped.dosage.amount === '' && mapped.dosage.unit === '');
check('timingSuggestion nennt die Herstellerangabe (serving_size)',
  mapped.timingSuggestion === 'Herstellerangabe laut Datenbank: 2 Kapseln');
check('analysisMode ist "barcode-off"', mapped.analysisMode === 'barcode-off');
check('barcode wird durchgereicht', mapped.barcode === '4001234567890');
check('zwei Warnhinweise zur Datenherkunft', mapped.warnings.length === 2);
check('uncertaintyNote verweist auf den Etikettenabgleich',
  /Etikett/.test(mapped.uncertaintyNote));
check('analyzedAt ist ein gueltiger ISO-Zeitstempel',
  !Number.isNaN(new Date(mapped.analyzedAt).getTime()));

console.log('\n— mapOffProductToScanResult: Fallbacks auf Englisch —');

const englishOnly = {
  product_name: 'Zinc Picolinate',
  ingredients_text: 'Zinc picolinate, Cellulose',
};
const mappedEnglish = mapOffProductToScanResult(englishOnly, '111');
check('productName faellt auf Englisch zurueck, wenn Deutsch fehlt',
  mappedEnglish.productName === 'Zinc Picolinate');
check('detectedIngredients faellt auf Englisch zurueck',
  JSON.stringify(mappedEnglish.detectedIngredients) ===
  JSON.stringify(['Zinc picolinate', 'Cellulose']));

console.log('\n— mapOffProductToScanResult: fehlende Felder statt erfundener Werte —');

const sparse = {};
const mappedSparse = mapOffProductToScanResult(sparse, '222');
check('Ohne jede Angabe: productName bleibt leer statt geraten',
  mappedSparse.productName === '');
check('Ohne jede Angabe: brand bleibt leer',
  mappedSparse.brand === '');
check('Ohne serving_size: timingSuggestion bleibt leer statt Platzhaltertext',
  mappedSparse.timingSuggestion === '');
check('Ohne ingredients_text: detectedIngredients ist leeres Array',
  JSON.stringify(mappedSparse.detectedIngredients) === '[]');

console.log('\n— lookupBarcode: frueher Ausstieg ohne Netzwerkaufruf —');

const emptyBarcodeResult = await lookupBarcode('');
check('Leerer Barcode → null, ohne fetch aufzurufen (sonst waere der Test oben abgestuerzt)',
  emptyBarcodeResult === null);
const whitespaceBarcodeResult = await lookupBarcode('   ');
check('Nur Leerzeichen als Barcode → ebenfalls null ohne fetch',
  whitespaceBarcodeResult === null);

console.log('\n— extractProductCode: Produktnummer aus Roh-Codes —');
check('EAN-13 bleibt unveraendert',
  extractProductCode('4260123456789') === '4260123456789');
check('EAN-8 bleibt unveraendert',
  extractProductCode('42601234') === '42601234');
check('GS1 Digital Link liefert die GTIN aus dem Pfad',
  extractProductCode('https://id.gs1.org/01/04012345678901/21/ABC') === '4012345678901');
check('GS1 Digital Link ohne weitere Pfadteile',
  extractProductCode('https://id.gs1.org/01/09506000134352') === '9506000134352');
check('GTIN-14-Schreibweise verliert fuehrende Nullen',
  extractProductCode('00004260123456789'.slice(0, 14)) === '4260123456');
check('QR mit gewoehnlicher URL → keine Produktnummer',
  extractProductCode('https://example.com/produktseite') === '');
check('Freitext → keine Produktnummer',
  extractProductCode('hallo welt') === '');
check('Leerer Wert → leere Produktnummer',
  extractProductCode('') === '');

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
