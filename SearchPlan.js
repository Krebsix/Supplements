// Suchplan fuer den Tab "Wissen" (search.jsx): welche Trefferbereiche zu
// einer Eingabe gehoeren und in welcher Rolle. Liegt ausserhalb der UI
// (Projektregel), damit die Regeln in Node testbar sind.
//
// Audit-Befund L4 (docs/feature-audit-scanner-v1.0.md): Die Suche fand
// nur Wirkstoffe. Produktnamen wie "Biogena Magnesium" blieben unfindbar,
// obwohl der Katalog sie kennt. Die Produktsuche selbst existierte schon
// (searchSeedCatalog, Scanner-Ablauf) -- hier wird sie nur angebunden,
// keine zweite Suchlogik.

import { substances } from './data/substances';
import { searchSeedCatalog } from './SeedCatalog';

// Ziel eines Tipps auf ein Katalogprodukt: derselbe Aufnehmen-Ablauf wie
// im Markenregister. Ein Katalogeintrag ist bereits geprueft, deshalb
// nicht ueber den Pruef-Screen der Foto-Scans (results.jsx).
export const CATALOG_PICK_ROUTE = '/AddSupplement?fromScan=1';

// Hoechstens so viele Produkte nach Namen. Mehr wuerde die Liste
// ueberladen; wer eine Marke durchsehen will, hat das Markenregister.
export const PRODUCT_HIT_LIMIT = 5;

// Freitextsuche ueber Name, Synonyme und Anwendungsgebiete —
// damit auch "Kraempfe" oder "Schlaf" zu Treffern fuehrt.
// (Unveraendert aus search.jsx hierher verschoben.)
export function searchSubstances(query) {
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

/**
 * planProductHits(query, { substanceCount })
 * Entscheidet, ob und in welcher Rolle Produkte nach Namen erscheinen.
 *
 * - Genau ein Wirkstoff erkannt ("Magnesium"): 'none'. Der Wirkstoff ist
 *   die Antwort, und der Screen zeigt darunter bereits alle
 *   Katalogprodukte mit diesem Wirkstoff. Namenstreffer wie
 *   "Spar / Magnesium" wuerden diese Liste nur doppeln und die
 *   Wissenskarte nach unten druecken.
 * - Mehrere Wirkstoffe ("Zink", "Schlaf"): 'secondary'. Wirkstoffe
 *   bleiben vorn, Produkte folgen danach.
 * - Kein Wirkstoff ("Biogena Magnesium", "Orthomol"): 'primary'. Dann
 *   sind die Produkte die eigentliche Antwort.
 *
 * Liefert { placement, hits }; hits im Format von searchSeedCatalog
 * (entry bleibt vollstaendig, inklusive license fuer die ODbL-Kennzeichnung).
 */
export function planProductHits(query, { substanceCount = 0 } = {}) {
  if (substanceCount === 1) return { placement: 'none', hits: [] };

  const hits = searchSeedCatalog(query ?? '', PRODUCT_HIT_LIMIT);
  if (hits.length === 0) return { placement: 'none', hits: [] };

  return { placement: substanceCount > 0 ? 'secondary' : 'primary', hits };
}
