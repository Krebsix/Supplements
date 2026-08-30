/**
 * data/certifications.js
 * ─────────────────────────────────────────────────────────────
 * Qualitaets-Layer der App.
 *
 * BEWUSSTE PRODUKTENTSCHEIDUNG: Die App bewertet keine Hersteller und
 * fuehrt keine Marken-Rankings. Stattdessen macht sie pruefbare
 * Zertifizierungen sichtbar — was ein Siegel bedeutet, wer es vergibt
 * und was es NICHT abdeckt.
 *
 * Das ist rechtlich unangreifbar (keine Herabsetzung von Wettbewerbern),
 * inhaltlich belastbar (jedes Siegel ist nachpruefbar) und laesst
 * spaetere Partnerschaften offen, weil keine Marke bewertet wird.
 *
 * `scope` ist das ehrlichste Feld: Ein Doping-Siegel sagt nichts ueber
 * Wirksamkeit, ein GMP-Zertifikat nichts ueber die Rezeptur.
 */

export const CERTIFICATION_KIND = {
  PURITY: 'purity', // Reinheit / Schadstoffe / Doping
  MANUFACTURING: 'manufacturing', // Herstellungsprozess
  CONTENT: 'content', // Deklarationstreue: ist drin, was draufsteht
  ORIGIN: 'origin', // Herkunft / Anbau
};

export const KIND_LABELS = {
  [CERTIFICATION_KIND.PURITY]: 'Reinheit',
  [CERTIFICATION_KIND.MANUFACTURING]: 'Herstellung',
  [CERTIFICATION_KIND.CONTENT]: 'Deklaration',
  [CERTIFICATION_KIND.ORIGIN]: 'Herkunft',
};

export const certifications = [
  {
    id: 'koelner-liste',
    name: 'Kölner Liste',
    kind: CERTIFICATION_KIND.PURITY,
    issuer: 'Olympiastützpunkt Rheinland / Zentrum für Präventive Dopingforschung, Köln',
    what: 'Prüfung auf Dopingsubstanzen (Anabolika, Stimulanzien) durch ein akkreditiertes Labor. Chargenbezogen und öffentlich einsehbar.',
    scope: 'Sagt nichts über Wirksamkeit, Dosierung oder die sonstige Zusammensetzung aus — geprüft wird ausschließlich auf Dopingrelevanz.',
    region: 'DACH',
    synonyms: ['koelner liste', 'kölner liste', 'cologne list'],
  },
  {
    id: 'informed-sport',
    name: 'Informed Sport',
    kind: CERTIFICATION_KIND.PURITY,
    issuer: 'LGC Group (UK)',
    what: 'Chargenweise Laborprüfung auf verbotene Substanzen nach WADA-Liste. Jede Charge erhält eine eigene, prüfbare Nummer.',
    scope: 'Reine Dopingkontrolle. Keine Aussage zu Wirksamkeit oder Nährstoffgehalt.',
    region: 'international',
    synonyms: ['informed sport', 'informed-sport', 'informed choice'],
  },
  {
    id: 'nsf-sport',
    name: 'NSF Certified for Sport',
    kind: CERTIFICATION_KIND.PURITY,
    issuer: 'NSF International (USA)',
    what: 'Prüft auf über 280 verbotene Substanzen, kontrolliert zusätzlich die Übereinstimmung von Etikett und Inhalt sowie die Produktionsstätte.',
    scope: 'Deckt Doping und Deklarationstreue ab, trifft aber keine Aussage darüber, ob ein Wirkstoff für die Nutzerin sinnvoll ist.',
    region: 'international',
    synonyms: ['nsf certified for sport', 'nsf sport', 'nsf certified'],
  },
  {
    id: 'usp-verified',
    name: 'USP Verified',
    kind: CERTIFICATION_KIND.CONTENT,
    issuer: 'United States Pharmacopeia',
    what: 'Prüft, ob die deklarierten Wirkstoffe in der angegebenen Menge enthalten sind, ob sich die Kapsel im Körper auflöst und ob Schadstoffgrenzwerte eingehalten werden.',
    scope: 'Das aussagekräftigste Siegel für "ist drin, was draufsteht". Bewertet nicht, ob das Produkt sinnvoll zusammengesetzt ist.',
    region: 'international',
    synonyms: ['usp verified', 'usp', 'u.s. pharmacopeia'],
  },
  {
    id: 'gmp',
    name: 'GMP',
    kind: CERTIFICATION_KIND.MANUFACTURING,
    issuer: 'Behördlich / auditierende Stellen',
    what: 'Good Manufacturing Practice: dokumentierte Standards für Herstellungsprozess, Hygiene und Rückverfolgbarkeit.',
    scope: 'Betrifft ausschließlich den Herstellungsprozess. Ein GMP-Hinweis sagt nichts über den Inhalt des Produkts aus.',
    region: 'international',
    synonyms: ['gmp', 'good manufacturing practice', 'gmp-zertifiziert'],
  },
  {
    id: 'ifos',
    name: 'IFOS (Fischöl)',
    kind: CERTIFICATION_KIND.PURITY,
    issuer: 'Nutrasource / IFOS Program',
    what: 'Speziell für Omega-3-Produkte: prüft EPA/DHA-Gehalt, Oxidationsgrad (Ranzigkeit) sowie Schwermetall- und Dioxinbelastung.',
    scope: 'Nur für Fisch- und Algenöle relevant. Der Oxidationswert ist hier die eigentlich interessante Größe.',
    region: 'international',
    synonyms: ['ifos', 'international fish oil standards'],
  },
  {
    id: 'eu-bio',
    name: 'EU-Bio-Siegel',
    kind: CERTIFICATION_KIND.ORIGIN,
    issuer: 'EU-Öko-Kontrollstellen',
    what: 'Bestätigt ökologische Erzeugung der Rohstoffe nach EU-Öko-Verordnung.',
    scope: 'Aussage über den Anbau, nicht über Reinheit des Endprodukts, Wirkstoffgehalt oder Bioverfügbarkeit.',
    region: 'EU',
    synonyms: ['eu-bio', 'eu bio', 'bio-siegel', 'oeko-kontrollstelle', 'de-öko'],
  },
  {
    id: 'vegan-label',
    name: 'Veganblume / V-Label',
    kind: CERTIFICATION_KIND.ORIGIN,
    issuer: 'Vegan Society / V-Label International',
    what: 'Bestätigt, dass keine tierischen Bestandteile enthalten sind — relevant etwa bei Gelatinekapseln, Vitamin D3 und Omega-3.',
    scope: 'Aussage zur Herkunft der Zutaten, nicht zur Qualität oder Wirksamkeit.',
    region: 'EU',
    synonyms: ['v-label', 'veganblume', 'vegan society', 'vegan zertifiziert'],
  },
];

export const certificationById = new Map(
  certifications.map((cert) => [cert.id, cert])
);

function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const certIndex = certifications.flatMap((cert) =>
  [cert.name, ...(cert.synonyms ?? [])].map((term) => ({
    term: normalize(term),
    cert,
  }))
);

/**
 * matchCertifications(labels)
 * labels: Strings vom Etikett, die die Vision-Analyse als Siegel
 *         erkannt hat. Unbekannte Siegel bleiben unbekannt — es wird
 *         nichts geraten.
 */
/**
 * certificationById(id)
 * Siegel-Eintrag zu einer Katalog-Referenz (data/seedProducts.json,
 * Feld certifications). Unbekannte IDs liefern null statt zu raten.
 */
export function certificationById(id) {
  return certifications.find((cert) => cert.id === id) ?? null;
}

export function matchCertifications(labels = []) {
  if (!Array.isArray(labels)) return [];

  const seen = new Set();
  const matched = [];
  const unknown = [];

  for (const label of labels) {
    const normalized = normalize(label);
    if (!normalized) continue;

    const hit = certIndex.find(
      (entry) => entry.term && normalized.includes(entry.term)
    );

    if (hit && !seen.has(hit.cert.id)) {
      seen.add(hit.cert.id);
      matched.push(hit.cert);
    } else if (!hit) {
      unknown.push(String(label).trim());
    }
  }

  return { matched, unknown };
}
