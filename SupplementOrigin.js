/**
 * SupplementOrigin.js
 * ─────────────────────────────────────────────────────────────
 * Uebersetzt die technische Herkunft eines Bestandseintrags in eine
 * Aussage, die in der Oberflaeche stehen darf.
 *
 * WARUM ALS EIGENES MODUL:
 * Die Zuordnung ist Fachlogik, nicht Darstellung — sie entscheidet, was
 * die App ueber die Verlaesslichkeit einer Zahl sagt. Screens holen sich
 * nur das Ergebnis (siehe Regel in ConflictLogic.js: "Logik NIEMALS in
 * UI-Komponenten").
 *
 * WAS NICHT IN DIE OBERFLAECHE GEHOERT:
 * Modellnamen (claude-opus-5), interne Modus-Schluessel
 * ('community-cache', 'demo-fallback'), Bild-Zaehler, Cache-Treffer.
 * Die Nutzerin interessiert, WOHER die Zahl kommt und wie genau sie
 * geprueft ist — nicht, welche Technik dahinter lief. Deshalb bildet
 * dieses Modul die sechs internen analysisMode-Werte auf vier
 * verstaendliche Herkuenfte ab.
 *
 * Fotoanalyse und Cache-Treffer werden bewusst ZUSAMMENGEFASST: Ein
 * Cache-Eintrag ist eine frueher gelaufene Fotoanalyse (eines anderen
 * Geraets), die redaktionell freigegeben wurde. Fuer die Nutzerin ist
 * beides "aus einem Etikettenfoto gelesen"; der Unterschied ist
 * betriebsintern.
 */

export const ORIGIN = {
  /** Etikettenfoto per KI ausgewertet, eigene Aufnahme oder freigegebener Cache-Treffer. */
  PHOTO: 'photo',
  /** Barcode gescannt, Daten aus einer Produktdatenbank. */
  BARCODE: 'barcode',
  /** Aus dem mitgelieferten Produktkatalog uebernommen. */
  CATALOG: 'catalog',
  /** Von Hand eingetragen. */
  MANUAL: 'manual',
  /** Testdaten (Mock oder Demo). Erscheint nur in Entwicklungsstaenden. */
  DEMO: 'demo',
  /** Aelterer Eintrag ohne hinterlegte Herkunft. */
  UNKNOWN: 'unknown',
};

const BY_ANALYSIS_MODE = {
  vision: ORIGIN.PHOTO,
  'community-cache': ORIGIN.PHOTO,
  'barcode-off': ORIGIN.BARCODE,
  'seed-catalog': ORIGIN.CATALOG,
  mock: ORIGIN.DEMO,
  'demo-fallback': ORIGIN.DEMO,
};

const LABEL_KEYS = {
  [ORIGIN.PHOTO]: 'origin.photo',
  [ORIGIN.BARCODE]: 'origin.barcode',
  [ORIGIN.CATALOG]: 'origin.catalog',
  [ORIGIN.MANUAL]: 'origin.manual',
  [ORIGIN.DEMO]: 'origin.demo',
  [ORIGIN.UNKNOWN]: 'origin.unknown',
};

/**
 * resolveOrigin(supplement)
 * Bestimmt die Herkunft rein aus den gespeicherten Feldern. Reihenfolge
 * bewusst: analysisMode ist die genaueste Angabe, source der groebere
 * Rueckfall fuer Eintraege von vor dieser Aenderung.
 *
 * Gibt immer ein Ergebnis zurueck, nie null — ein Eintrag ohne Angaben
 * ist UNKNOWN, kein Fehler.
 */
export function resolveOrigin(supplement = {}) {
  const mode = typeof supplement?.analysisMode === 'string' ? supplement.analysisMode : '';
  const mapped = BY_ANALYSIS_MODE[mode];
  if (mapped) {
    return { origin: mapped, labelKey: LABEL_KEYS[mapped], fromAnalysisMode: true };
  }

  // Bestandseintraege: 'manual' und 'library' sind die alten Werte aus
  // normalizeUserSupplement, 'scan' stand fuer jeden Scan-Weg.
  const source = typeof supplement?.source === 'string' ? supplement.source : '';
  if (source === 'manual') {
    return { origin: ORIGIN.MANUAL, labelKey: LABEL_KEYS[ORIGIN.MANUAL], fromAnalysisMode: false };
  }
  if (source === 'library') {
    return { origin: ORIGIN.CATALOG, labelKey: LABEL_KEYS[ORIGIN.CATALOG], fromAnalysisMode: false };
  }

  return { origin: ORIGIN.UNKNOWN, labelKey: LABEL_KEYS[ORIGIN.UNKNOWN], fromAnalysisMode: false };
}

/**
 * hasReviewableOrigin(supplement)
 * True, wenn die Zahlen aus einer automatischen Auswertung stammen und
 * deshalb gegen das Etikett geprueft werden sollten. Von Hand
 * Eingetragenes hat die Nutzerin selbst gesetzt, Katalogeintraege sind
 * redaktionell gepflegt.
 */
export function hasReviewableOrigin(supplement = {}) {
  const { origin } = resolveOrigin(supplement);
  return origin === ORIGIN.PHOTO || origin === ORIGIN.BARCODE;
}
