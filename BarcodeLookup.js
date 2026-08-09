/**
 * BarcodeLookup.js
 * ─────────────────────────────────────────────────────────────
 * Barcode-Pfad des Scanners: schlaegt einen erkannten EAN/UPC-Code
 * in der Open Food Facts Datenbank nach (offen, kostenlos, ohne Key).
 *
 * Abdeckung bei Nahrungsergaenzungsmitteln ist lueckenhaft und die
 * Daten sind Community-gepflegt — deshalb wird das Ergebnis klar als
 * 'barcode-off' gekennzeichnet und nie als verifiziert dargestellt.
 * Nicht vorhandene Werte bleiben leer (keine erfundenen Werte).
 */

const OFF_ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product';
const OFF_FIELDS = [
  'product_name',
  'product_name_de',
  'brands',
  'ingredients_text_de',
  'ingredients_text',
  'quantity',
  'serving_size',
].join(',');
const REQUEST_TIMEOUT_MS = 15000;

// Exportiert fuer Tests: reine Normalisierungslogik, kein Netzwerkzugriff.
export function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Zutatenliste ("Magnesiumcitrat, Kapselhuelle: HPMC, ...") grob in
// Einzeleintraege zerlegen — bewusst ohne Interpretation der Mengen.
export function splitIngredients(text) {
  return cleanText(text)
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 1)
    .slice(0, 30);
}

/**
 * lookupBarcode(barcode)
 * Rueckgabe: Scan-Ergebnis im App-Format oder null, wenn der Code
 * nicht in der Datenbank ist.
 */
export async function lookupBarcode(barcode) {
  const code = cleanText(barcode);
  if (!code) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(
      `${OFF_ENDPOINT}/${encodeURIComponent(code)}.json?fields=${OFF_FIELDS}`,
      { signal: controller.signal }
    );
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Die Barcode-Suche hat zu lange gedauert.');
    }
    throw new Error('Die Produktdatenbank ist nicht erreichbar.');
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Barcode-Suche fehlgeschlagen (Status ${response.status}).`);
  }

  const json = await response.json();
  if (json?.status !== 1 || !json?.product) return null;

  return mapOffProductToScanResult(json.product, code);
}

/**
 * mapOffProductToScanResult(product, code)
 * Reine Mapping-/Normalisierungslogik: OFF-Produktobjekt → Scan-Ergebnis
 * im App-Format. Bewusst ohne Netzwerkzugriff, damit sie isoliert testbar
 * ist. Ausgelagert aus lookupBarcode(), Verhalten unveraendert.
 */
export function mapOffProductToScanResult(product, code) {
  const productName =
    cleanText(product.product_name_de) || cleanText(product.product_name);
  const ingredientsText =
    cleanText(product.ingredients_text_de) || cleanText(product.ingredients_text);
  const servingSize = cleanText(product.serving_size);

  return {
    productName,
    brand: cleanText(product.brands),
    confidence: 0, // OFF liefert keine Konfidenz — bewusst niedrig ansetzen
    detectedIngredients: splitIngredients(ingredientsText),
    // Dosierung liefert OFF nicht strukturiert — bleibt leer statt geraten
    dosage: { amount: '', unit: '' },
    timingSuggestion: servingSize
      ? `Herstellerangabe laut Datenbank: ${servingSize}`
      : '',
    warnings: [
      'Daten stammen aus Open Food Facts (Community-gepflegt) und koennen unvollstaendig oder veraltet sein.',
      'Dosierung und Wirkstoffmengen bitte direkt vom Etikett uebernehmen.',
    ],
    uncertaintyNote:
      'Barcode-Treffer aus einer offenen Produktdatenbank. Vor der Uebernahme mit dem Etikett abgleichen.',
    analysisMode: 'barcode-off',
    barcode: code,
    analyzedAt: new Date().toISOString(),
  };
}
